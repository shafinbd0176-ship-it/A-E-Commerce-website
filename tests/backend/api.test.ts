process.env.NODE_ENV = 'test';
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import app from '../../backend/src/server.js';
import { db } from '../../backend/src/database/db.js';

let server: http.Server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

before(async () => {
  await db.initialize();
  server = app.listen(PORT);
});

after(() => {
  server.close();
});

async function apiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  return { status: res.status, data: await res.json() };
}

describe('SecondLife Backend Core Integration Tests', () => {
  let authToken = '';
  let testProductId = '';

  test('1. Health Check Endpoint Returns 200 and Status UP', async () => {
    const res = await apiRequest('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'HEALTHY');
  });

  test('2. User Authentication - Customer Login Returns Valid JWT', async () => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@secondlife.tech',
        password: 'customer123456'
      })
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token);
    assert.strictEqual(res.data.data.user.role, 'customer');
    authToken = res.data.data.token;
  });

  test('3. Products Catalog - Retrieves Circular Products with Rebuild Metadata', async () => {
    const res = await apiRequest('/products?limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.length > 0);

    const first = res.data.data[0];
    testProductId = first.id;
    assert.ok(first.rebuildInfo);
    assert.ok(first.rebuildInfo.eWasteDivertedKg > 0);
  });

  test('4. Categories - Retrieves 5 Curated Circular Taxonomy Categories', async () => {
    const res = await apiRequest('/categories');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.length >= 5);
  });

  test('5. Cart - Adds Rebuilt Product to Persistent Server Cart', async () => {
    const res = await apiRequest('/cart/items', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        productId: testProductId,
        quantity: 1
      })
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    const cartRes = await apiRequest('/cart', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(cartRes.status, 200);
    assert.ok(cartRes.data.data.items.length > 0);
    assert.ok(cartRes.data.data.totalEWasteDivertedKg > 0);
  });

  test('6. Checkout & Payment Abstraction - Places and Confirms Order', async () => {
    const res = await apiRequest('/orders/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        shippingAddress: {
          recipientName: 'Elena Rostova',
          streetAddress1: '742 Evergreen Terrace',
          city: 'Portland',
          stateOrProvince: 'OR',
          postalCode: '97201',
          country: 'USA',
          phone: '+1 (555) 019-2834'
        },
        paymentMethod: 'SecondLife Sandbox Card Provider',
        paymentMethodToken: 'tok_sandbox_success',
        discountCode: 'SECONDLIFE10'
      })
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.orderNumber.startsWith('SL-'));
    assert.strictEqual(res.data.data.status, 'CONFIRMED');
    assert.strictEqual(res.data.data.paymentStatus, 'CAPTURED');
  });

  test('7. Admin System Health - Provides Diagnostics and Uptime Metrics', async () => {
    const adminLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@secondlife.tech',
        password: 'admin123456'
      })
    });
    const adminToken = adminLogin.data.data.token;

    const res = await apiRequest('/admin/health', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'HEALTHY');
    assert.strictEqual(res.data.data.services.api.status, 'UP');
    assert.strictEqual(res.data.data.services.database.status, 'UP');
  });
});
