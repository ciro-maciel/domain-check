// ============================================================================
// Email Templates - Domain Monitor
// Professional email template system with consistent branding
// ============================================================================

const baseStyles = `
    body { 
        font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
        background: #0f172a;
    }
    .container { 
        max-width: 600px; 
        margin: 0 auto; 
        padding: 24px 16px;
    }
    .card {
        background: #1e293b;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
    }
    .header { 
        text-align: center; 
        padding: 32px 24px 24px;
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        border-bottom: 1px solid #334155;
    }
    .logo { 
        width: 48px; 
        height: 48px; 
        margin-bottom: 16px;
        border-radius: 12px;
    }
    .brand {
        font-size: 14px;
        font-weight: 600;
        color: #94a3b8;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin: 0 0 8px 0;
    }
    .title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
        color: #f1f5f9;
    }
    .title-gradient {
        background: linear-gradient(135deg, #22d3ee 0%, #a78bfa 50%, #f472b6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .content { 
        padding: 32px 24px; 
    }
    .content p {
        color: #cbd5e1;
        line-height: 1.6;
        margin: 12px 0;
        font-size: 15px;
    }
    .button { 
        display: inline-block;
        background: linear-gradient(135deg, #22d3ee 0%, #6366f1 100%);
        color: #0f172a !important;
        padding: 14px 32px; 
        text-decoration: none; 
        border-radius: 10px;
        font-weight: 700;
        font-size: 14px;
        margin: 20px 0;
        box-shadow: 0 4px 16px rgba(34, 211, 238, 0.3);
        letter-spacing: 0.5px;
    }
    .button-success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
    }
    .footer { 
        color: #64748b; 
        font-size: 12px; 
        text-align: center;
        padding: 24px;
        background: #0f172a;
        border-top: 1px solid #334155;
    }
    .footer p {
        margin: 6px 0;
    }
    .footer a {
        color: #22d3ee;
        text-decoration: none;
    }
    .alert-box {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%);
        padding: 20px;
        border-left: 4px solid #22c55e;
        border-radius: 0 12px 12px 0;
        margin: 20px 0;
    }
    .alert-box-warning {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
        border-left-color: #fbbf24;
    }
    .alert-box-info {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
        border-left-color: #22d3ee;
    }
    .info-box {
        background: #334155;
        padding: 16px 20px;
        border-radius: 12px;
        margin: 20px 0;
        border: 1px solid #475569;
    }
    .stat-grid {
        display: flex;
        gap: 12px;
        margin: 20px 0;
    }
    .stat-card {
        flex: 1;
        background: #334155;
        padding: 16px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid #475569;
    }
    .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 0;
    }
    .stat-value-success { color: #22c55e; }
    .stat-value-primary { color: #22d3ee; }
    .stat-value-warning { color: #fbbf24; }
    .stat-label {
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 8px 0 0 0;
    }
    .domain-badge {
        display: inline-block;
        background: linear-gradient(135deg, #22d3ee 0%, #6366f1 100%);
        color: #0f172a;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 16px;
        letter-spacing: 0.5px;
    }
    .domain-badge-success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    }
    .table-container {
        margin: 20px 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #475569;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th {
        background: #334155;
        padding: 14px 16px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    td {
        padding: 14px 16px;
        border-top: 1px solid #334155;
        color: #e2e8f0;
        font-size: 14px;
    }
    tr:nth-child(even) td {
        background: rgba(51, 65, 85, 0.3);
    }
    .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .status-available {
        background: rgba(34, 197, 94, 0.2);
        color: #4ade80;
    }
    .status-registered {
        background: rgba(34, 211, 238, 0.2);
        color: #22d3ee;
    }
    .status-error {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
    }
    .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, #475569, transparent);
        margin: 24px 0;
    }
    .timestamp {
        color: #64748b;
        font-size: 12px;
    }
    .highlight {
        color: #22d3ee;
        font-weight: 600;
    }
`;

const baseTemplate = (title, content, footer = "", titleGradient = true) => `
<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
        <style>${baseStyles}</style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <p class="brand">Domain Monitor</p>
                    <h1 class="title ${
                      titleGradient ? "title-gradient" : ""
                    }">${title}</h1>
                </div>
                <div class="content">${content}</div>
                <div class="footer">
                    ${footer}
                    <p>© ${new Date().getFullYear()} Domain Monitor</p>
                    <p>Monitoramento automático de disponibilidade de domínios</p>
                </div>
            </div>
        </div>
    </body>
</html>
`;

// ============================================================================
// Domain Available Alert
// ============================================================================

export const domainAvailable = ({ domain, checkedAt }) => {
  const timestamp = checkedAt || new Date().toISOString();

  return {
    subject: `🎉 DOMÍNIO DISPONÍVEL: ${domain}`,
    text: `
DOMÍNIO DISPONÍVEL!

O domínio ${domain} está DISPONÍVEL para registro!

Ação necessária: Registre imediatamente antes que alguém pegue!

Verificado em: ${timestamp}

---
Domain Monitor - Monitoramento automático de disponibilidade de domínios
        `.trim(),
    html: baseTemplate(
      "🎉 Domínio Disponível!",
      `
            <div style="text-align: center; margin-bottom: 24px;">
                <p style="color: #94a3b8; margin: 0 0 16px 0;">O domínio que você estava monitorando está disponível:</p>
                <span class="domain-badge domain-badge-success">${domain}</span>
            </div>
            
            <div class="alert-box">
                <p style="margin: 0 0 8px 0; font-weight: 700; color: #22c55e; font-size: 16px;">✅ Status: DISPONÍVEL</p>
                <p style="margin: 0; color: #a7f3d0;">Este domínio não está registrado e pode ser adquirido agora!</p>
            </div>
            
            <div style="text-align: center;">
                <a href="https://registro.br/busca-dominio/?fqdn=${domain}" class="button button-success">
                    Registrar Agora →
                </a>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-box" style="text-align: center;">
                <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 12px;">Verificado em</p>
                <p style="margin: 0; color: #f1f5f9; font-weight: 600;">${timestamp}</p>
            </div>
            `,
      `<p style="color: #fbbf24;">⚠️ Aja rápido! Domínios populares são registrados rapidamente.</p>`
    ),
  };
};

// ============================================================================
// Summary Report (Health Check)
// ============================================================================

export const summaryReport = ({ domains, counts, generatedAt }) => {
  const timestamp = generatedAt || new Date().toISOString();
  const healthStatus = counts.error > 0 ? "com_erros" : "saudavel";
  const healthLabel = counts.error > 0 ? "⚠️ Com Erros" : "✅ Saudável";
  const healthColor = counts.error > 0 ? "#fbbf24" : "#22c55e";

  const domainRows = domains
    .map((d) => {
      let statusClass = "status-registered";
      let statusLabel = "🔒 Registrado";

      if (d.status === "available") {
        statusClass = "status-available";
        statusLabel = "✅ Disponível";
      } else if (d.status === "error") {
        statusClass = "status-error";
        statusLabel = "⚠️ Erro";
      }

      const lastChecked = new Date(d.lastChecked).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
            <tr>
                <td style="font-weight: 600;">${d.domain}</td>
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td class="timestamp">${lastChecked}</td>
            </tr>
        `;
    })
    .join("");

  const domainsList = domains
    .map((d) => {
      const statusEmoji =
        d.status === "available"
          ? "✅"
          : d.status === "registered"
          ? "🔒"
          : "⚠️";
      return `- ${d.domain}: ${statusEmoji} ${d.status.toUpperCase()}`;
    })
    .join("\n");

  return {
    subject: `📊 Domain Monitor - Relatório (${counts.registered} registrados, ${counts.available} disponíveis)`,
    text: `
RELATÓRIO DE MONITORAMENTO

Gerado em: ${timestamp}
Status Geral: ${healthLabel}

Resumo:
- Total de domínios: ${counts.total}
- Registrados: ${counts.registered}
- Disponíveis: ${counts.available}
${counts.error > 0 ? `- Com erros: ${counts.error}` : ""}

Domínios:
${domainsList}

---
Domain Monitor - Relatório automático a cada 2 horas
        `.trim(),
    html: baseTemplate(
      "📊 Relatório de Monitoramento",
      `
            <p style="text-align: center; color: #94a3b8;">Status geral do serviço de monitoramento de domínios</p>
            
            <div class="info-box" style="text-align: center; border-color: ${healthColor};">
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Status do Sistema</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${healthColor};">${healthLabel}</p>
            </div>
            
            <!--[if mso]>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
            <![endif]-->
            <div style="display: flex; gap: 12px; margin: 24px 0;">
                <div style="flex: 1; background: #334155; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #475569;">
                    <p style="font-size: 28px; font-weight: 700; color: #f1f5f9; margin: 0;">${
                      counts.total
                    }</p>
                    <p style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 8px 0 0 0;">Total</p>
                </div>
                <div style="flex: 1; background: #334155; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #475569;">
                    <p style="font-size: 28px; font-weight: 700; color: #22d3ee; margin: 0;">${
                      counts.registered
                    }</p>
                    <p style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 8px 0 0 0;">Registrados</p>
                </div>
                <div style="flex: 1; background: #334155; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #475569;">
                    <p style="font-size: 28px; font-weight: 700; color: #22c55e; margin: 0;">${
                      counts.available
                    }</p>
                    <p style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 8px 0 0 0;">Disponíveis</p>
                </div>
                ${
                  counts.error > 0
                    ? `
                <div style="flex: 1; background: #334155; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #475569;">
                    <p style="font-size: 28px; font-weight: 700; color: #fbbf24; margin: 0;">${counts.error}</p>
                    <p style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 8px 0 0 0;">Erros</p>
                </div>
                `
                    : ""
                }
            </div>
            <!--[if mso]>
            </tr>
            </table>
            <![endif]-->
            
            <div class="divider"></div>
            
            <p style="font-weight: 600; color: #f1f5f9; margin-bottom: 16px;">Detalhes por Domínio</p>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Domínio</th>
                            <th>Status</th>
                            <th>Última Verificação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${domainRows}
                    </tbody>
                </table>
            </div>
            
            <div class="divider"></div>
            
            <div style="text-align: center;">
                <p class="timestamp">Relatório gerado em ${new Date(
                  timestamp
                ).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}</p>
            </div>
            `,
      `<p>Relatório automático enviado a cada 2 horas</p>`
    ),
  };
};

// ============================================================================
// Service Status Alert (for errors/issues)
// ============================================================================

export const serviceAlert = ({ type, message, details, timestamp }) => {
  const alertTimestamp = timestamp || new Date().toISOString();
  const isError = type === "error";
  const icon = isError ? "🚨" : "⚠️";
  const title = isError ? "Erro no Serviço" : "Alerta do Sistema";
  const alertBoxClass = isError ? "" : "alert-box-warning";

  return {
    subject: `${icon} Domain Monitor - ${title}`,
    text: `
${title.toUpperCase()}

${message}

${details ? `Detalhes:\n${details}` : ""}

Timestamp: ${alertTimestamp}

---
Domain Monitor - Monitoramento automático de disponibilidade de domínios
        `.trim(),
    html: baseTemplate(
      `${icon} ${title}`,
      `
            <div class="alert-box ${alertBoxClass}">
                <p style="margin: 0 0 8px 0; font-weight: 700; color: ${
                  isError ? "#f87171" : "#fbbf24"
                }; font-size: 16px;">
                    ${message}
                </p>
                ${
                  details
                    ? `<p style="margin: 0; color: #e2e8f0; font-size: 14px;">${details}</p>`
                    : ""
                }
            </div>
            
            <div class="info-box" style="text-align: center;">
                <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 12px;">Timestamp</p>
                <p style="margin: 0; color: #f1f5f9; font-weight: 600; font-family: monospace;">${alertTimestamp}</p>
            </div>
            `,
      `<p>Se este problema persistir, verifique os logs do sistema.</p>`
    ),
  };
};

// ============================================================================
// Welcome / Setup Confirmation
// ============================================================================

export const welcomeSetup = ({ domains, email }) => {
  const domainsList = domains
    .map((d) => `<li style="margin: 8px 0; color: #e2e8f0;">${d}</li>`)
    .join("");
  const domainsText = domains.map((d) => `  - ${d}`).join("\n");

  return {
    subject: "🚀 Domain Monitor Configurado com Sucesso",
    text: `
DOMAIN MONITOR ATIVADO!

O monitoramento foi configurado com sucesso.

Domínios sendo monitorados:
${domainsText}

Alertas serão enviados para: ${email}

O que acontece agora:
- Verificação automática a cada 10 minutos
- Alerta imediato quando um domínio ficar disponível
- Relatório de status a cada 2 horas

---
Domain Monitor - Monitoramento automático de disponibilidade de domínios
        `.trim(),
    html: baseTemplate(
      "🚀 Monitor Ativado!",
      `
            <p style="text-align: center; color: #94a3b8;">O monitoramento de domínios foi configurado com sucesso</p>
            
            <div class="alert-box alert-box-info">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #22d3ee;">Domínios sendo monitorados:</p>
                <ul style="margin: 0; padding-left: 20px;">
                    ${domainsList}
                </ul>
            </div>
            
            <div class="info-box">
                <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 12px;">Alertas serão enviados para</p>
                <p style="margin: 0; color: #22d3ee; font-weight: 600;">${email}</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-weight: 600; color: #f1f5f9; margin-bottom: 16px;">O que acontece agora?</p>
            
            <div style="color: #cbd5e1;">
                <p style="margin: 8px 0;">⏱️ <span class="highlight">Verificação automática</span> a cada 10 minutos</p>
                <p style="margin: 8px 0;">🔔 <span class="highlight">Alerta imediato</span> quando um domínio ficar disponível</p>
                <p style="margin: 8px 0;">📊 <span class="highlight">Relatório de status</span> a cada 2 horas</p>
            </div>
            `,
      ""
    ),
  };
};

// ============================================================================
// Export Default
// ============================================================================

export default {
  domainAvailable,
  summaryReport,
  serviceAlert,
  welcomeSetup,
};
