# 📬 Postman/ThunderClient Testing Guide

## Setup
1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Server runs on: `http://localhost:3000`

---

## 🧪 Test Scenarios

### Scenario 1: Successful Order Flow

#### 1️⃣ Create Order
**POST** `http://localhost:3000/api/orders`

**Request Body:**
```json
{
  "customerId": "CUST-12345",
  "items": [
    {
      "productId": "PROD-001",
      "quantity": 2,
      "price": 999.99
    },
    {
      "productId": "PROD-002",
      "quantity": 1,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  }
}
```

**Expected Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "orderId": "ORD-1735717234567-abc123xyz",
    "customerId": "CUST-12345",
    "items": [...],
    "shippingAddress": {...},
    "totalAmount": 2029.97,
    "status": "CREATED",
    "createdAt": "2026-01-01T10:30:00.000Z",
    "updatedAt": "2026-01-01T10:30:00.000Z",
    "failureReason": null
  },
  "message": "Order created successfully",
  "success": true
}
```

**Note:** Copy the `orderId` from response for next steps.

---

#### 2️⃣ Reserve Inventory
**POST** `http://localhost:3000/api/orders/{orderId}/reserve-inventory`

Replace `{orderId}` with the actual order ID from step 1.

**Expected Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "order": {
      "orderId": "ORD-1735717234567-abc123xyz",
      "status": "RESERVED",
      "totalAmount": 2029.97,
      ...
    },
    "reservation": {
      "orderId": "ORD-1735717234567-abc123xyz",
      "reservedItems": [
        {
          "productId": "PROD-001",
          "quantity": 2
        },
        {
          "productId": "PROD-002",
          "quantity": 1
        }
      ],
      "reservedAt": "2026-01-01T10:31:00.000Z"
    }
  },
  "message": "Inventory reserved successfully",
  "success": true
}
```

---

#### 3️⃣ Get Order Details
**GET** `http://localhost:3000/api/orders/{orderId}`

**Expected Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "orderId": "ORD-1735717234567-abc123xyz",
    "customerId": "CUST-12345",
    "status": "RESERVED",
    ...
  },
  "message": "Order retrieved successfully",
  "success": true
}
```

---

### Scenario 2: Insufficient Inventory

#### 1️⃣ Create Order with High Quantity
**POST** `http://localhost:3000/api/orders`

**Request Body:**
```json
{
  "customerId": "CUST-67890",
  "items": [
    {
      "productId": "PROD-004",
      "quantity": 100,
      "price": 299.99
    }
  ],
  "shippingAddress": {
    "street": "456 Oak Avenue",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Expected Response (201):**
Order created successfully with status `CREATED`.

---

#### 2️⃣ Attempt to Reserve (Will Fail)
**POST** `http://localhost:3000/api/orders/{orderId}/reserve-inventory`

**Expected Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot reserve inventory - insufficient stock",
  "errors": [
    {
      "productId": "PROD-004",
      "name": "Monitor",
      "reason": "Insufficient stock",
      "requested": 100,
      "available": 30
    }
  ],
  "data": null
}
```

---

### Scenario 3: Release Inventory (Order Cancellation)

#### 1️⃣ Create and Reserve Order
Follow Scenario 1 steps 1-2 to create an order and reserve inventory.

#### 2️⃣ Release Inventory
**POST** `http://localhost:3000/api/orders/{orderId}/release-inventory`

**Expected Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "order": {
      "orderId": "ORD-1735717234567-abc123xyz",
      "status": "FAILED",
      "failureReason": "Inventory released by user action",
      ...
    },
    "release": {
      "orderId": "ORD-1735717234567-abc123xyz",
      "releasedItems": [
        {
          "productId": "PROD-001",
          "quantity": 2
        },
        {
          "productId": "PROD-002",
          "quantity": 1
        }
      ],
      "releasedAt": "2026-01-01T10:35:00.000Z"
    }
  },
  "message": "Inventory released and order marked as failed",
  "success": true
}
```

---

### Scenario 4: Validation Errors

#### Missing Required Fields
**POST** `http://localhost:3000/api/orders`

**Request Body:**
```json
{
  "customerId": "CUST-99999",
  "items": []
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Order validation failed",
  "errors": [
    {
      "field": "items",
      "message": "Order must contain at least one item"
    },
    {
      "field": "shippingAddress",
      "message": "Shipping address is required"
    }
  ],
  "data": null
}
```

---

#### Invalid Product ID
**POST** `http://localhost:3000/orders`

**Request Body:**
```json
{
  "customerId": "CUST-99999",
  "items": [
    {
      "productId": "PROD-999",
      "quantity": 1,
      "price": 100
    }
  ],
  "shippingAddress": {
    "street": "123 Test St",
    "city": "TestCity",
    "zipCode": "12345",
    "country": "USA"
  }
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Order validation failed",
  "errors": [
    {
      "field": "items[0].productId",
      "message": "Product PROD-999 does not exist"
    }
  ],
  "data": null
}
```

---

### Scenario 5: Invalid State Transitions

#### Try to Reserve Already Reserved Order
**POST** `http://localhost:3000/api/orders/{orderId}/reserve-inventory`
(on an order that's already RESERVED)

**Expected Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot reserve inventory for order in RESERVED status",
  "errors": [
    {
      "field": "status",
      "message": "Order must be in CREATED status"
    }
  ],
  "data": null
}
```

---

## 🔍 Debug Endpoints

#### Get All Orders
**GET** `http://localhost:3000/api/orders`

Returns all orders in the system (useful for debugging).

#### Health Check
**GET** `http://localhost:3000/health`

Verify server is running.

---

## 📊 Available Products (Inventory)

| Product ID | Name | Available Stock |
|------------|------|-----------------|
| PROD-001 | Laptop | 50 |
| PROD-002 | Mouse | 200 |
| PROD-003 | Keyboard | 150 |
| PROD-004 | Monitor | 30 |
| PROD-005 | Headphones | 100 |

---

## 🎯 Testing Checklist

- ✅ Create order with valid data
- ✅ Create order with invalid data (validation errors)
- ✅ Reserve inventory successfully
- ✅ Reserve inventory with insufficient stock
- ✅ Release inventory
- ✅ Get order details
- ✅ Attempt invalid state transitions
- ✅ Verify order status changes (CREATED → RESERVED → FAILED)

---

## 💡 Design Decisions

### Why Separate Reserve/Release Endpoints?
- **Explicit control**: Allows frontend/external systems to trigger actions separately
- **State visibility**: Each step is trackable and reversible
- **Business alignment**: Mirrors real-world workflows (reserve → payment → confirm/cancel)

### Why Not Auto-Reserve on Create?
- **Separation of concerns**: Order creation validates business rules; reservation checks physical constraints
- **Flexibility**: Allows time for additional validations (fraud checks, pricing updates) before locking inventory
- **Recovery**: Failed reservations don't invalidate the order entity

### Why In-Memory DB?
- This is a **technical demo** focused on architecture, not persistence
- In production: Replace with PostgreSQL, MongoDB, or Redis (pattern remains the same)
