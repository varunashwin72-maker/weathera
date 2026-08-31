import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const storageFile = path.join(dataDir, 'storage.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(storageFile)) {
  fs.writeFileSync(storageFile, JSON.stringify({ users: [], sessions: [] }, null, 2));
}

function readStore() {
  const raw = fs.readFileSync(storageFile, 'utf8');
  return JSON.parse(raw);
}

function writeStore(store) {
  fs.writeFileSync(storageFile, JSON.stringify(store, null, 2));
}

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'aurora-weather-os', 100000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function createToken() {
  return crypto.randomBytes(24).toString('hex');
}

function parseJson(body) {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function getAuthUser(req, store) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;

  const session = store.sessions.find((entry) => entry.token === token);
  if (!session) return null;

  return store.users.find((user) => user.id === session.userId) || null;
}

const server = http.createServer((req, res) => {
  const { method, url = '/' } = req;
  const pathname = new URL(url, 'http://localhost').pathname;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (pathname === '/api/health') {
    sendJson(res, 200, { ok: true, service: 'aurora-weather-backend' });
    return;
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const store = readStore();
      const data = parseJson(body);
      const email = String(data.email || '').trim().toLowerCase();
      const password = String(data.password || '');
      const name = String(data.name || 'Weather User').trim();

      if (!email || password.length < 6) {
        sendJson(res, 400, { error: 'Provide a valid email and a password of at least 6 characters.' });
        return;
      }

      if (store.users.some((user) => user.email === email)) {
        sendJson(res, 409, { error: 'An account with that email already exists.' });
        return;
      }

      const user = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
        history: [],
      };

      const token = createToken();
      store.users.push(user);
      store.sessions.push({ token, userId: user.id });
      writeStore(store);

      sendJson(res, 201, { user: { id: user.id, name: user.name, email: user.email }, token });
    });
    return;
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const store = readStore();
      const data = parseJson(body);
      const email = String(data.email || '').trim().toLowerCase();
      const password = String(data.password || '');

      const user = store.users.find((entry) => entry.email === email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        sendJson(res, 401, { error: 'Invalid email or password.' });
        return;
      }

      const token = createToken();
      store.sessions = store.sessions.filter((entry) => entry.userId !== user.id);
      store.sessions.push({ token, userId: user.id });
      writeStore(store);

      sendJson(res, 200, { user: { id: user.id, name: user.name, email: user.email }, token });
    });
    return;
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    const store = readStore();
    const user = getAuthUser(req, store);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    sendJson(res, 200, { user: { id: user.id, name: user.name, email: user.email } });
    return;
  }

  if (pathname === '/api/history' && method === 'GET') {
    const store = readStore();
    const user = getAuthUser(req, store);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    sendJson(res, 200, { history: user.history || [] });
    return;
  }

  if (pathname === '/api/history' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const store = readStore();
      const user = getAuthUser(req, store);
      if (!user) {
        sendJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      const data = parseJson(body);
      const location = String(data.location || '').trim();
      if (!location) {
        sendJson(res, 400, { error: 'A location name is required.' });
        return;
      }

      const userRecord = store.users.find((entry) => entry.id === user.id);
      if (!userRecord) {
        sendJson(res, 404, { error: 'User not found.' });
        return;
      }

      userRecord.history = [location, ...(userRecord.history || []).filter((item) => item !== location)].slice(0, 8);
      writeStore(store);
      sendJson(res, 200, { history: userRecord.history });
    });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

const port = Number(process.env.PORT || 4000);
server.listen(port, '0.0.0.0', () => {
  console.log(`Aurora weather backend listening on port ${port}`);
});
