export const PENDING_ORDER_KEY = "1uplabs_pending_order_v1";

const ORDER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function subscribePendingOrder (): () => void
{
  return () => {};
}

export function readPendingOrderId (): string | null
{
  if (typeof window === "undefined") return null;
  try
  {
    const id = window.sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!id || !ORDER_ID_PATTERN.test(id)) return null;
    return id;
  }
  catch
  {
    return null;
  }
}

export function rememberPendingOrder (orderId: string): void
{
  if (typeof window === "undefined" || !ORDER_ID_PATTERN.test(orderId)) return;
  try
  {
    window.sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
  }
  catch
  {
    // Storage can be blocked; the pay page URL still has the order.
  }
}

export function forgetPendingOrder (orderId: string): void
{
  if (typeof window === "undefined") return;
  try
  {
    if (window.sessionStorage.getItem(PENDING_ORDER_KEY) === orderId)
    {
      window.sessionStorage.removeItem(PENDING_ORDER_KEY);
    }
  }
  catch
  {
    // Ignore storage failures.
  }
}
