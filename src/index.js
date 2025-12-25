import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";

// ============================================================================
// Configuration
// ============================================================================

const DOMAIN = process.env.DOMAIN;

if (!DOMAIN) {
  console.error("❌ ERROR: DOMAIN environment variable is required");
  console.error("   Example: DOMAIN=myleads.click bun run src/index.js");
  process.exit(1);
}

const CONFIG = {
  DOMAIN,
  RDAP_URL: `https://rdap.org/domain/${DOMAIN}`,
  CHECK_INTERVAL_MS: 10 * 60 * 1000, // 10 minutes
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
  status: text("status").notNull(), // "registered" | "available"
  lastCheckedAt: integer("last_checked_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ============================================================================
// Database Initialization
// ============================================================================

function initDatabase() {
  // Ensure data directory exists
  const dir = CONFIG.DB_PATH.substring(0, CONFIG.DB_PATH.lastIndexOf("/"));
  if (dir) {
    Bun.spawnSync(["mkdir", "-p", dir]);
  }

  const sqlite = new Database(CONFIG.DB_PATH);
  const db = drizzle(sqlite);

  // Create table if not exists
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS domain_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      last_checked_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  return db;
}

// ============================================================================
// RDAP Domain Check
// ============================================================================

async function checkDomainAvailability() {
  // TEST_MODE: Simulate domain as available to test notifications
  if (process.env.TEST_MODE === "true") {
    console.log("[TEST] Simulating domain as AVAILABLE");
    return { available: true, status: "available" };
  }

  try {
    const response = await fetch(CONFIG.RDAP_URL, {
      method: "GET",
      headers: {
        Accept: "application/rdap+json",
      },
    });

    // 404 = domain not found = available for registration
    if (response.status === 404) {
      return { available: true, status: "available" };
    }

    // 200 = domain exists = registered
    if (response.ok) {
      return { available: false, status: "registered" };
    }

    // Other status codes (rate limit, server error, etc.)
    console.error(`[RDAP] Unexpected status: ${response.status}`);
    return { available: false, status: "error" };
  } catch (error) {
    console.error(`[RDAP] Fetch error: ${error.message}`);
    return { available: false, status: "error" };
  }
}

// ============================================================================
// Webhook Notification
// ============================================================================

async function sendWebhookAlert(domain, status) {
  if (!CONFIG.WEBHOOK_URL) {
    console.warn("[Webhook] WEBHOOK_URL not configured, skipping notification");
    return;
  }

  const payload = {
    content: `🚨 **Domain Alert** 🚨`,
    embeds: [
      {
        title: "Domain Available!",
        description: `The domain **${domain}** is now **AVAILABLE** for registration!`,
        color: 0x00ff00, // Green
        fields: [
          {
            name: "Domain",
            value: domain,
            inline: true,
          },
          {
            name: "Status",
            value: status,
            inline: true,
          },
          {
            name: "Checked At",
            value: new Date().toISOString(),
            inline: false,
          },
        ],
        footer: {
          text: "Domain Monitor - Act fast!",
        },
      },
    ],
  };

  try {
    const response = await fetch(CONFIG.WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[Webhook] Alert sent successfully for ${domain}`);
    } else {
      console.error(`[Webhook] Failed to send: ${response.status}`);
    }
  } catch (error) {
    console.error(`[Webhook] Error: ${error.message}`);
  }
}

// ============================================================================
// Email Notification (Resend)
// ============================================================================

async function sendEmailAlert(domain) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ALERT_EMAIL;

  if (!apiKey || !toEmail) {
    console.warn(
      "[Email] RESEND_API_KEY or ALERT_EMAIL not configured, skipping"
    );
    return;
  }

  const payload = {
    from: "Domain Monitor <onboarding@resend.dev>",
    to: [toEmail],
    subject: `🚨 DOMÍNIO DISPONÍVEL: ${domain}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1 style="color: #22c55e;">🎉 Domínio Disponível!</h1>
        <p style="font-size: 18px;">O domínio <strong>${domain}</strong> está <span style="color: #22c55e; font-weight: bold;">DISPONÍVEL</span> para registro!</p>
        <p style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
          <strong>Ação:</strong> Registre imediatamente antes que alguém pegue!
        </p>
        <p style="color: #6b7280; font-size: 14px;">Verificado em: ${new Date().toISOString()}</p>
      </div>
    `,
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
// Main Loop
// ============================================================================

async function checkAndUpdate(db) {
  const now = new Date();
  console.log(`[${now.toISOString()}] Checking domain: ${CONFIG.DOMAIN}`);

  // Check domain availability via RDAP
  const result = await checkDomainAvailability();

  if (result.status === "error") {
    console.log("[Check] Skipping update due to error");
    return;
  }

  // Get previous status from database
  const existing = db
    .select()
    .from(domainStatus)
    .where(eq(domainStatus.domain, CONFIG.DOMAIN))
    .get();

  const previousStatus = existing?.status || null;

  // Update or insert status
  if (existing) {
    db.update(domainStatus)
      .set({
        status: result.status,
        lastCheckedAt: now,
        updatedAt: previousStatus !== result.status ? now : existing.updatedAt,
      })
      .where(eq(domainStatus.domain, CONFIG.DOMAIN))
      .run();
  } else {
    db.insert(domainStatus)
      .values({
        domain: CONFIG.DOMAIN,
        status: result.status,
        lastCheckedAt: now,
        updatedAt: now,
      })
      .run();
  }

  // Send alert only on status change to "available"
  if (previousStatus !== "available" && result.status === "available") {
    console.log(`[Alert] Domain ${CONFIG.DOMAIN} is now AVAILABLE!`);
    await sendWebhookAlert(CONFIG.DOMAIN, result.status);
    await sendEmailAlert(CONFIG.DOMAIN);
  } else {
    console.log(`[Status] ${CONFIG.DOMAIN}: ${result.status} (no change)`);
  }
}

async function main() {
  const isLoopMode = process.env.LOOP_MODE === "true";

  console.log("=".repeat(60));
  console.log("Domain Availability Monitor");
  console.log("=".repeat(60));
  console.log(`Domain: ${CONFIG.DOMAIN}`);
  console.log(
    `Mode: ${isLoopMode ? "Continuous (loop)" : "Single run (GitHub Actions)"}`
  );
  console.log(`Database: ${CONFIG.DB_PATH}`);
  console.log(
    `Webhook: ${CONFIG.WEBHOOK_URL ? "Configured" : "Not configured"}`
  );
  console.log("=".repeat(60));

  const db = initDatabase();

  // Run check
  await checkAndUpdate(db);

  if (isLoopMode) {
    // Continuous mode for local dev or Fly.io
    setInterval(() => checkAndUpdate(db), CONFIG.CHECK_INTERVAL_MS);
    console.log("[Monitor] Running... Press Ctrl+C to stop");
  } else {
    // Single run mode for GitHub Actions
    console.log("[Monitor] Check complete. Exiting.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
