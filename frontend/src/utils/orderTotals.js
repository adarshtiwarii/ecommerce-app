export const GST_RATE = 0.18;
export const PLATFORM_FEE = 9;
export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_MINIMUM = 400;

export const calculateOrderTotals = (cart = []) => {
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const totalMRP = cart.reduce((sum, item) => sum + Number(item.mrp || item.price || 0) * Number(item.quantity || 0), 0);
  const discount = Math.max(totalMRP - subtotal, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const platformFee = cart.length > 0 ? PLATFORM_FEE : 0;
  const deliveryCharge = subtotal >= FREE_DELIVERY_MINIMUM || subtotal === 0 ? 0 : DELIVERY_FEE;
  const finalPrice = subtotal + gst + platformFee + deliveryCharge;

  return {
    subtotal,
    totalMRP,
    discount,
    gst,
    platformFee,
    deliveryCharge,
    finalPrice,
    freeDeliveryMinimum: FREE_DELIVERY_MINIMUM,
  };
};
