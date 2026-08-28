# API Test Authoring & Automation Playbook

> Practical, code-level guide for writing, scaffolding, and executing comprehensive API integration tests across technology stacks.

---

## 1. Node.js / TypeScript API Testing (Supertest + Vitest / Jest)

### 1.1 Complete Setup & Test Harness
```typescript
// tests/helpers/test-client.ts
import request from 'supertest';
import app from '../../src/index.js';

export const api = request(app);

export async function getAuthHeader(credentials = { email: 'admin@evenda.test', password: 'password123' }) {
  const res = await api.post('/api/auth/login').send(credentials);
  return { Authorization: `Bearer ${res.body.data.token}` };
}
```

### 1.2 Full CRUD & State Machine Test Suite
```typescript
// tests/api/orders.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, getAuthHeader } from '../helpers/test-client.js';

describe('Orders API & State Lifecycle', () => {
  let authHeader: Record<string, string>;
  let createdOrderId: string;
  let orderNo: string;

  beforeAll(async () => {
    authHeader = await getAuthHeader();
  });

  // 1. HAPPY PATH: CREATE ORDER
  it('POST /api/orders/checkout - should create a new order and return payment info', async () => {
    const payload = {
      eventId: 'evt_sample_123',
      customer: { name: 'Budi Santoso', email: 'budi@test.local', phone: '08123456789' },
      items: [{
        ticketTypeId: 'tkt_vip_01',
        quantity: 2,
        attendees: [
          { name: 'Budi Santoso', email: 'budi@test.local', phone: '08123456789' },
          { name: 'Siti Rahma', email: 'siti@test.local', phone: '08123456780' },
        ],
      }],
      paymentMethod: 'qris',
    };

    const res = await api.post('/api/orders/checkout').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNo).toBeDefined();
    expect(res.body.data.status).toBe('PENDING');
    
    createdOrderId = res.body.data.orderId;
    orderNo = res.body.data.orderNo;
  });

  // 2. ADVERSARIAL: ATTENDEE MISMATCH
  it('POST /api/orders/checkout - should reject when attendee count does not match quantity', async () => {
    const invalidPayload = {
      eventId: 'evt_sample_123',
      customer: { name: 'Attacker', email: 'attacker@test.local', phone: '08123456789' },
      items: [{
        ticketTypeId: 'tkt_vip_01',
        quantity: 5,
        attendees: [{ name: 'One Attendee', email: 'one@test.local', phone: '08123456789' }], // Mismatch!
      }],
    };

    const res = await api.post('/api/orders/checkout').send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ATTENDEE_COUNT_MISMATCH');
  });

  // 3. READ DETAIL
  it('GET /api/orders/:orderNo - should fetch order detail with sanitized fees for public', async () => {
    const res = await api.get(`/api/orders/${orderNo}`);

    expect(res.status).toBe(200);
    expect(res.body.data.orderNo).toBe(orderNo);
    expect(res.body.data.items).toHaveLength(1);
    // Verify public does NOT see internal fee markup
    expect(res.body.data.platformFeeAmount).toBeUndefined();
  });

  // 4. AUTHORIZED LEDGER QUERY
  it('GET /api/orders - should return paginated list for authenticated organizer', async () => {
    const res = await api
      .get('/api/orders?page=1&limit=10&status=PENDING')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.pagination).toBeDefined();
  });
});
```

---

## 2. Python API Testing (Pytest + HTTPX / Requests)

```python
# tests/test_orders_api.py
import pytest
import httpx

BASE_URL = "http://localhost:5001/api"

@pytest.fixture
async def client():
    async with httpx.AsyncClient(base_url=BASE_URL) as ac:
        yield ac

@pytest.mark.asyncio
async def test_create_order_happy_path(client):
    payload = {
        "eventId": "evt_sample_123",
        "customer": {"name": "Ahmad", "email": "ahmad@test.local", "phone": "0812345678"},
        "items": [{
            "ticketTypeId": "tkt_01",
            "quantity": 1,
            "attendees": [{"name": "Ahmad", "email": "ahmad@test.local", "phone": "0812345678"}]
        }]
    }
    response = await client.post("/orders/checkout", json=payload)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["status"] == "PENDING"
    assert "orderNo" in data
```
