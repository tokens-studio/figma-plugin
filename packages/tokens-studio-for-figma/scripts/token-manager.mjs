import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = path.join(__dirname, '.test-token.json');
const CLIENT_ID = 'figma_plugin';
const SCOPE = 'read write';
const API_BASE = 'https://api-staging.tokens.studio';

async function validateToken(token) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/organizations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function runDeviceFlow() {
  process.stderr.write("Initiating authorization flow...\n");
  const initRes = await fetch(`${API_BASE}/oauth/authorize_device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, scope: SCOPE })
  });

  if (!initRes.ok) {
    throw new Error(`Failed to start device flow: ${initRes.status}`);
  }

  const authData = await initRes.json();
  
  process.stderr.write(`\n\n=== 🔐 AUTH REQUIRED 🔐 ===\n`);
  process.stderr.write(`1. Open: ${authData.verification_uri_complete || authData.verification_uri}\n`);
  if (!authData.verification_uri_complete) {
    process.stderr.write(`2. Code: ${authData.user_code}\n`);
  }
  process.stderr.write(`===========================\n\n`);

  const pollUrl = `${API_BASE}/oauth/token`;
  const intervalMs = (authData.interval || 5) * 1000;

  while (true) {
    await new Promise(r => setTimeout(r, intervalMs));
    const tokenRes = await fetch(pollUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: authData.device_code
      })
    });

    if (tokenRes.ok) {
      const data = await tokenRes.json();
      return data;
    } else {
      const errorData = await tokenRes.json().catch(() => ({}));
      if (errorData.error === 'authorization_pending') {
        process.stderr.write(".");
      } else if (errorData.error === 'slow_down') {
        process.stderr.write("-");
      } else {
        throw new Error(`OAuth error: ${errorData.error}`);
      }
    }
  }
}

async function runCypressAuth() {
  process.stderr.write("Initiating automated headless authorization via Cypress...\n");
  const { execSync } = await import('node:child_process');
  try {
    execSync('npx cypress run --spec cypress/e2e/auth_automation.cy.js --browser chrome --headless --config baseUrl=https://staging.tokens.studio', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    }
    throw new Error("Cypress finished but token file was not created.");
  } catch (err) {
    throw new Error(`Cypress auth failed: ${err.message}`);
  }
}

async function main() {
  let cache = {};
  if (fs.existsSync(TOKEN_FILE)) {
    cache = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  }

  if (cache.access_token && await validateToken(cache.access_token)) {
    console.log(cache.access_token);
    return;
  }

  // Token missing or invalid, run headless auth
  try {
    const newData = await runCypressAuth();
    process.stderr.write("\n✅ Automated Auth successful.\n");
    console.log(newData.access_token);
  } catch (err) {
    process.stderr.write(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
