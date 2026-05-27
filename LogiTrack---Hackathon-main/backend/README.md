# LogiTrack — Backend API

API REST para o app de rastreamento de encomendas LogiTrack.

## Stack
- **Node.js** + **Express**
- **SQLite** (via better-sqlite3) — banco de dados em arquivo
- **JWT** — autenticação stateless
- **bcryptjs** — hash de senhas

---

## Rotas

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cria conta `{ name, email, password }` |
| POST | `/api/auth/login` | Login `{ email, password }` → `{ user, token }` |
| GET  | `/api/auth/me` | Dados do usuário logado (requer token) |

### Rastreio (público)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/tracking/:code` | Rastreia uma encomenda pelo código |

### Encomendas salvas (requer token)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET    | `/api/packages` | Lista encomendas do usuário |
| POST   | `/api/packages` | Salva encomenda `{ code, nickname? }` |
| PATCH  | `/api/packages/:code` | Atualiza apelido `{ nickname }` |
| DELETE | `/api/packages/:code` | Remove encomenda |
| POST   | `/api/packages/:code/refresh` | Atualiza status do rastreio |

---

## Deploy no Render (Web Service)

### Configurações
| Campo | Valor |
|-------|-------|
| **Language** | Node |
| **Branch** | main |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free ($0) |

### Variáveis de ambiente obrigatórias
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `JWT_SECRET` | Chave secreta do JWT — **use uma string longa e aleatória** | `minha_chave_super_secreta_123` |
| `FRONTEND_URL` | URL do frontend para CORS | `https://logitrack.onrender.com` |
| `DB_PATH` | Caminho do banco SQLite | `/opt/render/project/src/logitrack.db` |

> ⚠️ No plano Free do Render, o disco é **efêmero** — o banco é apagado ao reiniciar.
> Para persistência real, use um **Persistent Disk** ($1/mês) ou migre para PostgreSQL.

---

## Rodar localmente

```bash
npm install
node server.js
# API em http://localhost:3001
```

---

## Como conectar ao frontend

No frontend, troque as chamadas de `localStorage` por chamadas à API:

```ts
// Exemplo: login
const res = await fetch('https://SUA-URL.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { user, token } = await res.json();
localStorage.setItem('logitrack_token', token);

// Exemplo: rastrear
const res = await fetch(`https://SUA-URL.onrender.com/api/tracking/${code}`);
const info = await res.json();
```
