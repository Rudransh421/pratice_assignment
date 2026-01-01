const orders = new Map();

const inventory = new Map([
  [
    "PROD-001",
    { productId: "PROD-001", name: "Laptop", available: 50, reserved: 0 },
  ],
  [
    "PROD-002",
    { productId: "PROD-002", name: "Mouse", available: 200, reserved: 0 },
  ],
  [
    "PROD-003",
    { productId: "PROD-003", name: "Keyboard", available: 150, reserved: 0 },
  ],
  [
    "PROD-004",
    { productId: "PROD-004", name: "Monitor", available: 30, reserved: 0 },
  ],
  [
    "PROD-005",
    { productId: "PROD-005", name: "Headphones", available: 100, reserved: 0 },
  ],
]);

const reservations = new Map();

export const db = {
  orders,
  inventory,
  reservations,
};

export const generateId = () => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
