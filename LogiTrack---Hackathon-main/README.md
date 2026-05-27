# LogiTrack — Hackathon

App de rastreamento de encomendas com frontend React e backend Node.js.

## Estrutura do projeto

```
LogiTrack---Hackathon-main/
├── Rastreamento de Encomendas/   ← Frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                      ← Backend (Node.js + Express)
    ├── server.js
    ├── db.js
    ├── auth.js
    ├── tracking.js
    └── package.json
```

## Deploy no Render

### Frontend — Static Site
| Campo | Valor |
|-------|-------|
| Root Directory | `Rastreamento de Encomendas` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

### Backend — Web Service
| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

#### Variáveis de ambiente do backend
| Variável | Descrição |
|----------|-----------|
| `JWT_SECRET` | Chave secreta JWT (string longa aleatória) |
| `FRONTEND_URL` | URL do frontend para liberar CORS |
| `DB_PATH` | `/opt/render/project/src/logitrack.db` |
