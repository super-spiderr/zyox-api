import { IOrderItem } from "../../models/order.model";
import { OrderItemType } from "../../constants/order.constant";

// Helper to compute billing totals for an order
export const calculateOrderTotals = (
  items: Array<{
    type: OrderItemType;
    itemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>,
  discountAmountInput: number = 0,
  advanceAmountInput: number = 0,
) => {
  let subTotal = 0;
  const orderItems: IOrderItem[] = items.map((item) => {
    const totalPrice = item.quantity * item.unitPrice;
    subTotal += totalPrice;
    return {
      type: item.type,
      itemId: item.itemId,
      itemModel: item.type === OrderItemType.PACKAGE ? "Package" : "Product",
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice,
    };
  });

  const totalAmount = Math.max(0, subTotal - discountAmountInput);
  const balanceAmount = totalAmount - advanceAmountInput;

  return {
    orderItems,
    subTotal,
    discountAmount: discountAmountInput,
    totalAmount,
    advanceAmount: advanceAmountInput,
    balanceAmount,
  };
};
