export const OrderStatus = {
  CREATED: "CREATED",
  RESERVED: "RESERVED",
  FAILED: "FAILED",
};

export class Order {
  constructor(data) {
    this.orderId = data.orderId;
    this.customerId = data.customerId;
    this.items = data.items;
    this.shippingAddress = data.shippingAddress;
    this.totalAmount = data.totalAmount;
    this.status = data.status || OrderStatus.CREATED;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.failureReason = data.failureReason || null;
  }

  static calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  updateStatus(newStatus, failureReason = null) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    if (failureReason) {
      this.failureReason = failureReason;
    }
  }

  canReserveInventory() {
    return this.status === OrderStatus.CREATED;
  }

  canReleaseInventory() {
    return this.status === OrderStatus.RESERVED;
  }
}
