import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { domainAvailable, summaryReport } from "./email-templates.js";

// ============================================================================
// Configuration
// ============================================================================

const DOMAINS_RAW = process.env.DOMAIN;

if (!DOMAINS_RAW) {
  console.error("❌ ERROR: DOMAIN environment variable is required");
  console.error("   Example: DOMAIN=myleads.click bun run src/index.js");
  console.error("   Multiple: DOMAIN=domain1.click,domain2.com,domain3.io");
  process.exit(1);
}

// Support multiple domains separated by comma
const DOMAINS = DOMAINS_RAW.split(",")
  .map((d) => d.trim())
  .filter(Boolean);

const CONFIG = {
  DOMAINS,
  CHECK_INTERVAL_MS: 10 * 60 * 1000, // 10 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000, // Start with 2s, then exponential backoff
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  ALERT_EMAIL: process.env.ALERT_EMAIL,
  DB_PATH: process.env.DB_PATH || "./data/domain-check.db",
};

// ============================================================================
// Database Schema (Drizzle ORM)
// ============================================================================

const domainStatus = sqliteTable("domain_status", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  domain: text("domain").notNull().unique(),
  status: text("status").notNull(), // "registered" | "available" | "error"
  lastCheckedAt: integer("last_checked_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ============================================================================
// Database Initialization
// ============================================================================

function initDatabase() {
  const dir = CONFIG.DB_PATH.substring(0, CONFIG.DB_PATH.lastIndexOf("/"));
  if (dir) {
    Bun.spawnSync(["mkdir", "-p", dir]);
  }

  const sqlite = new Database(CONFIG.DB_PATH);
  const db = drizzle(sqlite);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS domain_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      last_checked_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  return { db, sqlite };
}

// ============================================================================
// Utility: Sleep
// ============================================================================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// RDAP Domain Check with Retry
// ============================================================================

async function checkDomainAvailability(domain, retries = CONFIG.MAX_RETRIES) {
  // TEST_MODE: Simulate domain as available
  if (process.env.TEST_MODE === "true") {
    console.log(`[TEST] Simulating ${domain} as AVAILABLE`);
    return { available: true, status: "available" };
  }

  const rdapUrl = `https://rdap.org/domain/${domain}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(rdapUrl, {
        method: "GET",
        headers: { Accept: "application/rdap+json" },
        redirect: "follow", // Explicitly follow redirects
      });

      console.log(
        `[RDAP] ${domain}: HTTP ${response.status} (URL: ${response.url})`
      );

      // 404 = domain not found = available
      if (response.status === 404) {
        console.log(`[RDAP] ${domain}: Not found (404) - Domain is AVAILABLE`);
        return { available: true, status: "available" };
      }

      // 200 = domain exists = registered
      if (response.ok) {
        // Double-check by parsing the response to confirm it's a valid RDAP response
        try {
          const data = await response.json();
          // If we have an ldhName or handle, the domain is definitely registered
          if (data.ldhName || data.handle) {
            console.log(
              `[RDAP] ${domain}: Found registration data - Domain is REGISTERED`
            );
            return { available: false, status: "registered" };
          }
        } catch (parseError) {
          // If we can't parse but got 200, still consider it registered
          console.log(`[RDAP] ${domain}: Got 200 OK - Domain is REGISTERED`);
        }
        return { available: false, status: "registered" };
      }

      // Rate limit or server error - retry
      if (response.status === 429 || response.status >= 500) {
        const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[RDAP] ${domain}: Status ${response.status}, retry ${attempt}/${retries} in ${delay}ms`
        );
        await sleep(delay);
        continue;
      }

      // Other unexpected status
      console.error(`[RDAP] ${domain}: Unexpected status ${response.status}`);
      return { available: false, status: "error" };
    } catch (error) {
      const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `[RDAP] ${domain}: ${error.message}, retry ${attempt}/${retries} in ${delay}ms`
      );
      if (attempt < retries) {
        await sleep(delay);
      }
    }
  }

  console.error(`[RDAP] ${domain}: All ${retries} retries failed`);
  return { available: false, status: "error" };
}

// ============================================================================
// Webhook Notification
// ============================================================================

async function sendWebhookAlert(domain, status) {
  if (!CONFIG.WEBHOOK_URL) {
    console.warn("[Webhook] WEBHOOK_URL not configured, skipping");
    return;
  }

  const payload = {
    content: `🚨 **Domain Alert** 🚨`,
    embeds: [
      {
        title: "Domain Available!",
        description: `The domain **${domain}** is now **AVAILABLE** for registration!`,
        color: 0x00ff00,
        fields: [
          { name: "Domain", value: domain, inline: true },
          { name: "Status", value: status, inline: true },
          {
            name: "Checked At",
            value: new Date().toISOString(),
            inline: false,
          },
        ],
        footer: { text: "Domain Monitor - Act fast!" },
      },
    ],
  };

  try {
    const response = await fetch(CONFIG.WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[Webhook] Alert sent for ${domain}`);
    } else {
      console.error(`[Webhook] Failed: ${response.status}`);
    }
  } catch (error) {
    console.error(`[Webhook] Error: ${error.message}`);
  }
}

// ============================================================================
// Email Notification (Resend)
// ============================================================================

async function sendEmailAlert(domain) {
  const apiKey = CONFIG.RESEND_API_KEY;
  const toEmail = CONFIG.ALERT_EMAIL;

  if (!apiKey || !toEmail) {
    console.warn(
      "[Email] RESEND_API_KEY or ALERT_EMAIL not configured, skipping"
    );
    return;
  }

  const template = domainAvailable({
    domain,
    checkedAt: new Date().toISOString(),
  });

  const payload = {
    from: "Domain Monitor <onboarding@resend.dev>",
    to: [toEmail],
    subject: template.subject,
    html: template.html,
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[Email] Alert sent to ${toEmail}`);
    } else {
      const error = await response.text();
      console.error(`[Email] Failed: ${error}`);
    }
  } catch (error) {
    console.error(`[Email] Error: ${error.message}`);
  }
}

// ============================================================================
// Summary Email (Health Report)
// ============================================================================

async function sendSummaryEmail(sqlite) {
  const apiKey = CONFIG.RESEND_API_KEY;
  const toEmail = CONFIG.ALERT_EMAIL;

  if (!apiKey || !toEmail) {
    console.warn(
      "[Summary] RESEND_API_KEY or ALERT_EMAIL not configured, skipping"
    );
    return;
  }

  const rows = sqlite
    .query("SELECT domain, status, last_checked_at FROM domain_status")
    .all();

  const domains = rows.map((r) => ({
    domain: r.domain,
    status: r.status,
    lastChecked: new Date(r.last_checked_at * 1000).toISOString(),
  }));

  const counts = {
    total: rows.length,
    available: rows.filter((r) => r.status === "available").length,
    registered: rows.filter((r) => r.status === "registered").length,
    error: rows.filter((r) => r.status === "error").length,
  };

  const template = summaryReport({
    domains,
    counts,
    generatedAt: new Date().toISOString(),
  });

  const payload = {
    from: "Domain Monitor <onboarding@resend.dev>",
    to: [toEmail],
    subject: template.subject,
    html: template.html,
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[Summary] Health report sent to ${toEmail}`);
    } else {
      const error = await response.text();
      console.error(`[Summary] Failed: ${error}`);
    }
  } catch (error) {
    console.error(`[Summary] Error: ${error.message}`);
  }
}

// ============================================================================
// Check Single Domain
// ============================================================================

async function checkAndUpdateDomain(db, domain) {
  const now = new Date();
  console.log(`[${now.toISOString()}] Checking: ${domain}`);

  const result = await checkDomainAvailability(domain);

  if (result.status === "error") {
    console.log(`[Check] ${domain}: Skipping update due to error`);
    return { domain, status: "error", changed: false };
  }

  // Get previous status
  const existing = db
    .select()
    .from(domainStatus)
    .where(eq(domainStatus.domain, domain))
    .get();

  const previousStatus = existing?.status || null;

  // Update or insert
  if (existing) {
    db.update(domainStatus)
      .set({
        status: result.status,
        lastCheckedAt: now,
        updatedAt: previousStatus !== result.status ? now : existing.updatedAt,
      })
      .where(eq(domainStatus.domain, domain))
      .run();
  } else {
    db.insert(domainStatus)
      .values({
        domain,
        status: result.status,
        lastCheckedAt: now,
        updatedAt: now,
      })
      .run();
  }

  // Send alert on status change to "available"
  if (previousStatus !== "available" && result.status === "available") {
    console.log(`[Alert] 🎉 ${domain} is now AVAILABLE!`);
    await sendWebhookAlert(domain, result.status);
    await sendEmailAlert(domain);
    return { domain, status: "available", changed: true };
  }

  console.log(`[Status] ${domain}: ${result.status}`);
  return { domain, status: result.status, changed: false };
}

// ============================================================================
// Check All Domains
// ============================================================================

async function checkAllDomains(db) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`Checking ${CONFIG.DOMAINS.length} domain(s)...`);
  console.log(`${"─".repeat(60)}`);

  const results = [];
  for (const domain of CONFIG.DOMAINS) {
    const result = await checkAndUpdateDomain(db, domain);
    results.push(result);
  }

  return results;
}

// ============================================================================
// Generate Health Badge JSON
// ============================================================================

function generateHealthBadge(sqlite) {
  const rows = sqlite
    .query("SELECT domain, status, last_checked_at FROM domain_status")
    .all();

  const summary = {
    lastCheck: new Date().toISOString(),
    domains: rows.map((r) => ({
      domain: r.domain,
      status: r.status,
      lastChecked: new Date(r.last_checked_at * 1000).toISOString(),
    })),
    counts: {
      total: rows.length,
      available: rows.filter((r) => r.status === "available").length,
      registered: rows.filter((r) => r.status === "registered").length,
      error: rows.filter((r) => r.status === "error").length,
    },
  };

  // Write badge JSON for shields.io endpoint
  const badgeData = {
    schemaVersion: 1,
    label: "domains",
    message: `${summary.counts.registered} registered | ${summary.counts.available} available`,
    color: summary.counts.available > 0 ? "brightgreen" : "blue",
  };

  Bun.write("./data/badge.json", JSON.stringify(badgeData, null, 2));
  Bun.write("./data/status.json", JSON.stringify(summary, null, 2));

  console.log(`[Badge] Generated ./data/badge.json and ./data/status.json`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const isLoopMode = process.env.LOOP_MODE === "true";

  console.log("=".repeat(60));
  console.log("Domain Availability Monitor");
  console.log("=".repeat(60));
  console.log(`Domains: ${CONFIG.DOMAINS.join(", ")}`);
  console.log(`Mode: ${isLoopMode ? "Continuous (loop)" : "Single run"}`);
  console.log(`Retries: ${CONFIG.MAX_RETRIES} with exponential backoff`);
  console.log(`Database: ${CONFIG.DB_PATH}`);
  console.log(`Email: ${CONFIG.ALERT_EMAIL || "Not configured"}`);
  console.log(
    `Webhook: ${CONFIG.WEBHOOK_URL ? "Configured" : "Not configured"}`
  );
  console.log("=".repeat(60));

  const { db, sqlite } = initDatabase();

  // Summary-only mode (for 2-hour reports)
  if (process.env.SEND_SUMMARY === "true") {
    console.log("[Summary] Sending health report...");
    await sendSummaryEmail(sqlite);
    console.log("[Monitor] Summary sent. Exiting.");
    process.exit(0);
  }

  // Run check
  await checkAllDomains(db);

  // Generate health badge
  generateHealthBadge(sqlite);

  if (isLoopMode) {
    setInterval(async () => {
      await checkAllDomains(db);
      generateHealthBadge(sqlite);
    }, CONFIG.CHECK_INTERVAL_MS);
    console.log("\n[Monitor] Running... Press Ctrl+C to stop");
  } else {
    console.log("\n[Monitor] Check complete. Exiting.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
