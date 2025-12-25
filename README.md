# 🔍 Domain Availability Monitor

![Domain Status](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/ciro-maciel/domain-check/main/data/badge.json)

> Monitore domínios em expiração e seja notificado **instantaneamente** quando ficarem disponíveis para registro.

---

## 💡 Como Funciona

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                           │
│                   (a cada 5 minutos)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Consulta RDAP (protocolo oficial de registro)          │
│     https://rdap.org/domain/seudominio.com                  │
│                                                             │
│  2. Interpreta resposta:                                    │
│     • 200 OK → Domínio registrado 🔒                        │
│     • 404 Not Found → Domínio DISPONÍVEL ✅                 │
│                                                             │
│  3. Se mudou para disponível:                              │
│     → Envia email + webhook                                │
│     → Você registra antes de qualquer um!                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/ciro-maciel/domain-check.git
cd domain-check

# 2. Instale dependências
bun install

# 3. Configure
cp .env.example .env
# Edite .env com suas credenciais

# 4. Teste
bun test
```

---

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
# Domínio(s) para monitorar (separados por vírgula)
DOMAIN=example.click,anotherdomain.com

# Credenciais do Resend (https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx
ALERT_EMAIL=seu@email.com

# Webhook Discord/Slack (opcional)
WEBHOOK_URL=https://discord.com/api/webhooks/...
```

---

## 📧 Notificações

### Alerta Instantâneo

Quando um domínio fica disponível, você recebe:

- **Email** via Resend com instruções para registrar
- **Webhook** no Discord/Slack (opcional)

### Relatório de Saúde (a cada 2 horas)

Email automático com:

- Status de todos os domínios monitorados
- Contadores (registrados/disponíveis/erros)
- Hora da última verificação

```bash
# Testar relatório manualmente
bun summary
```

---

## 🏷️ Badge Dinâmico

O badge no topo deste README é **atualizado automaticamente** pelo GitHub Actions.

### Como usar no seu README:

```markdown
![Domain Status](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/SEU_USER/domain-check/main/data/badge.json)
```

O badge mostra:

- 🔵 `1 registered | 0 available` - Domínio ainda registrado
- 🟢 `0 registered | 1 available` - Domínio DISPONÍVEL!

---

## 🔄 GitHub Actions

### Verificação (a cada 5 minutos)

`.github/workflows/domain-check.yml`

- Consulta RDAP para cada domínio
- Envia alerta se ficar disponível
- Atualiza badge automaticamente

### Relatório (a cada 2 horas)

`.github/workflows/summary-report.yml`

- Envia email de sumário
- Confirma que o serviço está funcionando

### Secrets Necessários

No GitHub, vá em **Settings → Secrets → Actions** e adicione:

| Secret           | Descrição                      |
| ---------------- | ------------------------------ |
| `DOMAIN`         | Domínio(s) para monitorar      |
| `RESEND_API_KEY` | Chave da API do Resend         |
| `ALERT_EMAIL`    | Seu email para receber alertas |

---

## 🛡️ Resiliência

- **3 tentativas** com backoff exponencial em caso de erro
- **Cache** do estado entre execuções (evita alertas duplicados)
- **SQLite** para persistência leve

---

## 📁 Estrutura

```
domain-check/
├── .env                 # Suas credenciais (não versionado)
├── .github/workflows/   # Automação GitHub Actions
├── data/
│   ├── badge.json       # Badge dinâmico para shields.io
│   └── status.json      # Status completo em JSON
├── src/
│   └── index.js         # Código principal
└── package.json
```

---

## 🧪 Scripts

| Comando       | Descrição                                      |
| ------------- | ---------------------------------------------- |
| `bun start`   | Executa verificação única                      |
| `bun test`    | Simula domínio disponível (testa notificações) |
| `bun summary` | Envia relatório de saúde                       |
| `bun dev`     | Modo watch para desenvolvimento                |

---

## 📜 Licença

MIT © [Ciro Maciel](https://github.com/ciro-maciel)
