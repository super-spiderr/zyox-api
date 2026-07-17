export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum OrderItemType {
  PACKAGE = "PACKAGE",
  PRODUCT = "PRODUCT",
}

export enum OrderSource {
  WHATSAPP = "WHATSAPP",
  CALL = "CALL",
  WALK_IN = "WALK_IN",
}
