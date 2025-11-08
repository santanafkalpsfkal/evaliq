import 'dotenv/config';

const BASE = process.env.TEST_BASE || 'http://localhost:5000/api';
const email = process.env.TEST_EMAIL || 'admin@example.com';
const password = process.env.TEST_PASSWORD || 'Admin#2025!';

async function main() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
  if (res.status !== 200) {
    console.log('Try debug-user:');
    const dbg = await fetch(`${BASE}/auth/debug-user?email=${encodeURIComponent(email)}`);
    console.log('Debug-user status:', dbg.status);
    console.log('Debug-user body:', await dbg.text());
  }
}

main().catch(e => { console.error(e); process.exit(1); });
