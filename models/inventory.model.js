
export class InventoryItem {
  constructor(data) {
    this.productId = data.productId;
    this.name = data.name;
    this.available = data.available; 
    this.reserved = data.reserved;
  }

  getAvailableStock() {
    return this.available - this.reserved;
  }

  hasStock(quantity) {
    return this.getAvailableStock() >= quantity;
  }


  reserve(quantity) {
    if (!this.hasStock(quantity)) {
      return false;
    }
    this.reserved += quantity;
    return true;
  }

  release(quantity) {
    this.reserved = Math.max(0, this.reserved - quantity);
  }

  deduct(quantity) {
    this.available -= quantity;
    this.reserved = Math.max(0, this.reserved - quantity);
  }
}
