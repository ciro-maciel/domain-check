// ============================================================================
// Email Templates - Domain Monitor
// Design System: Clean, minimal, sophisticated
// ============================================================================

const baseStyles = `
    body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: #f9fafb;
        color: #111827;
        line-height: 1.6;
    }
    .container { 
        max-width: 580px; 
        margin: 0 auto; 
        padding: 40px 20px;
    }
    .card {
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        overflow: hidden;
    }
    .header { 
        padding: 32px 32px 24px;
        border-bottom: 1px solid #f3f4f6;
    }
    .brand {
        font-size: 11px;
        font-weight: 600;
        color: #9ca3af;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        margin: 0 0 8px 0;
    }
    .title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        letter-spacing: -0.3px;
    }
    .content { 
        padding: 32px; 
    }
    .content p {
        color: #4b5563;
        margin: 0 0 16px 0;
        font-size: 15px;
    }
    .button { 
        display: inline-block;
        background: #111827;
        color: #ffffff !important;
        padding: 12px 24px; 
        text-decoration: none; 
        border-radius: 6px;
        font-weight: 500;
        font-size: 14px;
        margin: 8px 0 16px;
    }
    .footer { 
        color: #9ca3af; 
        font-size: 12px; 
        text-align: center;
        padding: 24px 32px;
        background: #f9fafb;
        border-top: 1px solid #f3f4f6;
    }
    .footer p {
        margin: 4px 0;
    }
    .footer a {
        color: #6b7280;
        text-decoration: none;
    }
    .footer a:hover {
        color: #111827;
    }
    .info-box {
        background: #f9fafb;
        padding: 20px;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
        margin: 20px 0;
    }
    .stat-row {
        display: flex;
        gap: 16px;
        margin: 24px 0;
    }
    .stat-card {
        flex: 1;
        padding: 20px;
        text-align: center;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background: #ffffff;
    }
    .stat-value {
        font-size: 28px;
        font-weight: 600;
        font-style: normal;
        color: #111827;
        margin: 0;
        line-height: 1.2;
    }
    .stat-label {
        font-size: 11px;
        font-weight: 500;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 8px 0 0 0;
    }
    .domain-text {
        font-weight: 600;
        color: #111827;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th {
        padding: 12px 16px;
        text-align: left;
        font-size: 11px;
        font-weight: 500;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
    }
    td {
        padding: 14px 16px;
        border-bottom: 1px solid #f3f4f6;
        color: #4b5563;
        font-size: 14px;
    }
    .status-text {
        font-weight: 500;
        font-size: 13px;
    }
    .status-available { color: #059669; }
    .status-registered { color: #6b7280; }
    .status-error { color: #dc2626; }
    .divider {
        height: 1px;
        background: #f3f4f6;
        margin: 24px 0;
    }
    .timestamp {
        color: #9ca3af;
        font-size: 13px;
    }
    .label {
        font-size: 11px;
        font-weight: 500;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 4px 0;
    }
    .highlight-box {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
    }
    .highlight-box.warning {
        background: #fffbeb;
        border-color: #fde68a;
    }
`;

const baseTemplate = (title, content, footer = "") => `
<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <p class="brand">Domain Monitor</p>
                    <h1 class="title">${title}</h1>
                </div>
                <div class="content">${content}</div>
                <div class="footer">
                    ${footer}
                    <p>Desenvolvido por <a href="https://blog.ciromaciel.click/" style="color: #6b7280; font-weight: 500;">Ciro Cesar Maciel</a></p>
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
  const formattedDate = new Date(timestamp).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    subject: `Domínio Disponível: ${domain}`,
    text: `
Domínio Disponível

O domínio ${domain} está disponível para registro.

Verificado em: ${formattedDate}

---
Domain Monitor
        `.trim(),
    html: baseTemplate(
      "Domínio Disponível",
      `
            <div class="highlight-box">
                <p class="label">Domínio</p>
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${domain}</p>
                <p style="margin: 12px 0 0 0; color: #059669; font-weight: 500;">Disponível para registro</p>
            </div>
            
            <p>O domínio que você estava monitorando está disponível. Recomendamos que você registre o mais breve possível.</p>
            
            <a href="https://registro.br/busca-dominio/?fqdn=${domain}" class="button">Registrar Domínio</a>
            
            <div class="divider"></div>
            
            <p class="timestamp">Verificado em ${formattedDate}</p>
            `,
      ""
    ),
  };
};

// ============================================================================
// Summary Report
// ============================================================================

export const summaryReport = ({ domains, counts, generatedAt }) => {
  const timestamp = generatedAt || new Date().toISOString();
  const formattedDate = new Date(timestamp).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const domainRows = domains
    .map((d) => {
      let statusClass = "status-registered";
      let statusLabel = "Registrado";

      if (d.status === "available") {
        statusClass = "status-available";
        statusLabel = "Disponível";
      } else if (d.status === "error") {
        statusClass = "status-error";
        statusLabel = "Erro";
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
                <td style="font-weight: 500; color: #111827;">${d.domain}</td>
                <td><span class="status-text ${statusClass}">${statusLabel}</span></td>
                <td class="timestamp">${lastChecked}</td>
            </tr>
        `;
    })
    .join("");

  const domainsList = domains
    .map((d) => `- ${d.domain}: ${d.status}`)
    .join("\n");

  return {
    subject: `Relatório: ${counts.total} domínios monitorados`,
    text: `
Relatório de Monitoramento

Gerado em: ${formattedDate}

Total: ${counts.total}
Registrados: ${counts.registered}
Disponíveis: ${counts.available}

Domínios:
${domainsList}

---
Domain Monitor
        `.trim(),
    html: baseTemplate(
      "Relatório de Monitoramento",
      `
            <p style="color: #6b7280;">Resumo do status dos domínios monitorados.</p>
            
            <!--[if mso]>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <![endif]-->
            <div style="display: flex; gap: 16px; margin: 24px 0;">
                <div style="flex: 1; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 6px; background: #ffffff;">
                    <p style="font-size: 28px; font-weight: 600; font-style: normal; color: #111827; margin: 0; line-height: 1.2;">${
                      counts.total
                    }</p>
                    <p style="font-size: 11px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin: 8px 0 0 0;">Total</p>
                </div>
                <div style="flex: 1; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 6px; background: #ffffff;">
                    <p style="font-size: 28px; font-weight: 600; font-style: normal; color: #6b7280; margin: 0; line-height: 1.2;">${
                      counts.registered
                    }</p>
                    <p style="font-size: 11px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin: 8px 0 0 0;">Registrados</p>
                </div>
                <div style="flex: 1; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-radius: 6px; background: #ffffff;">
                    <p style="font-size: 28px; font-weight: 600; font-style: normal; color: ${
                      counts.available > 0 ? "#059669" : "#111827"
                    }; margin: 0; line-height: 1.2;">${counts.available}</p>
                    <p style="font-size: 11px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin: 8px 0 0 0;">Disponíveis</p>
                </div>
            </div>
            <!--[if mso]>
            </tr></table>
            <![endif]-->
            
            <div class="divider"></div>
            
            <p class="label" style="margin-bottom: 12px;">Detalhes</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Domínio</th>
                        <th>Status</th>
                        <th>Verificação</th>
                    </tr>
                </thead>
                <tbody>
                    ${domainRows}
                </tbody>
            </table>
            
            <p class="timestamp" style="text-align: center; margin-top: 24px;">Relatório gerado em ${formattedDate}</p>
            `,
      ""
    ),
  };
};

// ============================================================================
// Service Alert
// ============================================================================

export const serviceAlert = ({ type, message, details, timestamp }) => {
  const alertTimestamp = timestamp || new Date().toISOString();
  const formattedDate = new Date(alertTimestamp).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isError = type === "error";
  const title = isError ? "Erro no Serviço" : "Alerta do Sistema";

  return {
    subject: `Domain Monitor: ${title}`,
    text: `
${title}

${message}

${details ? `Detalhes: ${details}` : ""}

Timestamp: ${formattedDate}

---
Domain Monitor
        `.trim(),
    html: baseTemplate(
      title,
      `
            <div class="highlight-box ${isError ? "" : "warning"}">
                <p style="margin: 0; font-weight: 500; color: #111827;">${message}</p>
                ${
                  details
                    ? `<p style="margin: 12px 0 0 0; color: #6b7280; font-size: 14px;">${details}</p>`
                    : ""
                }
            </div>
            
            <div class="divider"></div>
            
            <p class="timestamp">${formattedDate}</p>
            `,
      ""
    ),
  };
};

// ============================================================================
// Welcome Setup
// ============================================================================

export const welcomeSetup = ({ domains, email }) => {
  const domainsList = domains
    .map((d) => `<li style="margin: 6px 0; color: #4b5563;">${d}</li>`)
    .join("");
  const domainsText = domains.map((d) => `  - ${d}`).join("\n");

  return {
    subject: "Domain Monitor Configurado",
    text: `
Domain Monitor Ativado

O monitoramento foi configurado com sucesso.

Domínios:
${domainsText}

Alertas serão enviados para: ${email}

---
Domain Monitor
        `.trim(),
    html: baseTemplate(
      "Monitor Ativado",
      `
            <p>O monitoramento de domínios foi configurado com sucesso.</p>
            
            <div class="info-box">
                <p class="label">Domínios monitorados</p>
                <ul style="margin: 8px 0 0 0; padding-left: 18px;">
                    ${domainsList}
                </ul>
            </div>
            
            <div class="info-box">
                <p class="label">Email para alertas</p>
                <p style="margin: 4px 0 0 0; font-weight: 500; color: #111827;">${email}</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px;">Você receberá um alerta imediato quando um domínio ficar disponível, além de um relatório de status a cada 2 horas.</p>
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
