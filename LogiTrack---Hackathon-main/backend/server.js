import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { signToken, authMiddleware } from './auth.js';
import { fetchTracking, detectCarrier, isValidTrackingCode } from './tracking.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'LogiTrack API', version: '1.0.0' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name.trim(), email.toLowerCase(), hashed);

    const user = { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() };
    const token = signToken({ id: user.id, email: user.email });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = signToken({ id: user.id, email: user.email });
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/me  (valida token e retorna dados do usuário)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ user });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRACKING ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/tracking/:code  (público — qualquer um pode rastrear)
app.get('/api/tracking/:code', (req, res) => {
  const { code } = req.params;

  if (!isValidTrackingCode(code)) {
    return res.status(400).json({ error: 'Código de rastreio inválido' });
  }

  try {
    const info = fetchTracking(code.trim().toUpperCase());
    res.json(info);
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).json({ error: 'Erro ao consultar rastreio' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PACKAGES ROUTES (requer autenticação)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/packages  (lista encomendas salvas do usuário)
app.get('/api/packages', authMiddleware, (req, res) => {
  try {
    const packages = db.prepare(
      'SELECT * FROM packages WHERE user_id = ? ORDER BY added_at DESC'
    ).all(req.user.id);
    res.json(packages);
  } catch (err) {
    console.error('List packages error:', err);
    res.status(500).json({ error: 'Erro ao listar encomendas' });
  }
});

// POST /api/packages  (salva uma encomenda)
app.post('/api/packages', authMiddleware, (req, res) => {
  const { code, nickname } = req.body;

  if (!code || !isValidTrackingCode(code)) {
    return res.status(400).json({ error: 'Código de rastreio inválido' });
  }

  try {
    const upperCode = code.trim().toUpperCase();
    const carrier = detectCarrier(upperCode);
    const info = fetchTracking(upperCode);

    const existing = db.prepare(
      'SELECT id FROM packages WHERE user_id = ? AND code = ?'
    ).get(req.user.id, upperCode);

    if (existing) {
      return res.status(409).json({ error: 'Encomenda já salva' });
    }

    const result = db.prepare(
      'INSERT INTO packages (user_id, code, carrier, status, nickname) VALUES (?, ?, ?, ?, ?)'
    ).run(req.user.id, upperCode, carrier, info.status, nickname?.trim() || null);

    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(pkg);
  } catch (err) {
    console.error('Save package error:', err);
    res.status(500).json({ error: 'Erro ao salvar encomenda' });
  }
});

// PATCH /api/packages/:code  (atualiza apelido ou status)
app.patch('/api/packages/:code', authMiddleware, (req, res) => {
  const { code } = req.params;
  const { nickname } = req.body;

  try {
    const upperCode = code.trim().toUpperCase();

    // Atualiza status consultando rastreio
    const info = fetchTracking(upperCode);

    db.prepare(
      'UPDATE packages SET nickname = ?, status = ?, updated_at = datetime("now") WHERE user_id = ? AND code = ?'
    ).run(nickname?.trim() || null, info.status, req.user.id, upperCode);

    const pkg = db.prepare('SELECT * FROM packages WHERE user_id = ? AND code = ?').get(req.user.id, upperCode);
    if (!pkg) return res.status(404).json({ error: 'Encomenda não encontrada' });

    res.json(pkg);
  } catch (err) {
    console.error('Update package error:', err);
    res.status(500).json({ error: 'Erro ao atualizar encomenda' });
  }
});

// DELETE /api/packages/:code  (remove uma encomenda salva)
app.delete('/api/packages/:code', authMiddleware, (req, res) => {
  const { code } = req.params;
  try {
    const upperCode = code.trim().toUpperCase();
    const result = db.prepare(
      'DELETE FROM packages WHERE user_id = ? AND code = ?'
    ).run(req.user.id, upperCode);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete package error:', err);
    res.status(500).json({ error: 'Erro ao remover encomenda' });
  }
});

// POST /api/packages/:code/refresh  (força atualização do status)
app.post('/api/packages/:code/refresh', authMiddleware, (req, res) => {
  const { code } = req.params;
  try {
    const upperCode = code.trim().toUpperCase();
    const info = fetchTracking(upperCode);

    db.prepare(
      'UPDATE packages SET status = ?, updated_at = datetime("now") WHERE user_id = ? AND code = ?'
    ).run(info.status, req.user.id, upperCode);

    res.json(info);
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Erro ao atualizar rastreio' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 404
// ═══════════════════════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 LogiTrack API rodando na porta ${PORT}`);
});
