import "server-only";

import { eq } from "drizzle-orm";
import { Resend } from "resend";

import { db } from "@/app/db";
import { orderItems, orders } from "@/app/db/schema";
import { formatUsdFromCents } from "@/app/lib/money";
import { buildPaymentInstructionsText, getManualPaymentMethods, orderIdToMemo } from "@/app/lib/paymentMethods";
import { getSiteUrl } from "@/app/lib/site";

type OrderEmailData = {
  order: {
    id: string;
    email: string;
    status: "pending" | "paid" | "shipped" | "canceled";
    totalCents: number;
    mailService: string | null;
    trackingNumber: string | null;
    receiptEmailSentAt: Date | null;
    paymentInstructionsEmailSentAt: Date | null;
    statusEmailSentAt: Date | null;
  };
  items: Array<{
    productName: string;
    productAmount: string;
    qty: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }>;
};

export type EmailSendResult = "sent" | "already-sent" | "skipped-no-provider" | "failed";

type EmailCategory = "receipt" | "paymentInstructions" | "statusUpdate";

function getResend (): Resend | null
{
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress (): string
{
  return process.env.RESEND_FROM?.trim() || "1UpLabs <onboarding@resend.dev>";
}

function escapeHtml (input: string): string
{
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function amountFromCents (cents: number): string
{
  const safe = Number.isFinite(cents) ? Math.max(0, cents) : 0;
  return (safe / 100).toFixed(2);
}

function getOrderNumber (orderId: string): string
{
  return orderId.slice(0, 8).toUpperCase();
}

function statusDisplay (status: OrderEmailData["order"]["status"]): string
{
  switch (status)
  {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "shipped":
      return "Shipped";
    case "canceled":
      return "Canceled";
    default:
      return status;
  }
}

async function loadOrderEmailData (orderId: string): Promise<OrderEmailData | null>
{
  let order: OrderEmailData["order"] | undefined;
  try
  {
    const orderRows = await db
      .select({
        id: orders.id,
        email: orders.email,
        status: orders.status,
        totalCents: orders.totalCents,
        mailService: orders.mailService,
        trackingNumber: orders.trackingNumber,
        receiptEmailSentAt: orders.receiptEmailSentAt,
        paymentInstructionsEmailSentAt: orders.paymentInstructionsEmailSentAt,
        statusEmailSentAt: orders.statusEmailSentAt,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    order = orderRows[0];
  }
  catch (error)
  {
    // Allow checkout + email sending to work before running latest migration.
    const fallbackRows = await db
      .select({
        id: orders.id,
        email: orders.email,
        status: orders.status,
        totalCents: orders.totalCents,
        mailService: orders.mailService,
        trackingNumber: orders.trackingNumber,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    const fallback = fallbackRows[0];
    if (fallback)
    {
      order = {
        ...fallback,
        receiptEmailSentAt: null,
        paymentInstructionsEmailSentAt: null,
        statusEmailSentAt: null,
      };
      console.warn("[email] Email audit columns unavailable; using migration fallback.", error);
    }
  }

  if (!order) return null;

  const items = await db
    .select({
      productName: orderItems.productName,
      productAmount: orderItems.productAmount,
      qty: orderItems.qty,
      unitPriceCents: orderItems.unitPriceCents,
      lineTotalCents: orderItems.lineTotalCents,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return { order, items };
}

async function markEmailSentAt (orderId: string, category: EmailCategory): Promise<void>
{
  const now = new Date();
  const patch = category === "receipt"
    ? { receiptEmailSentAt: now }
    : category === "paymentInstructions"
      ? { paymentInstructionsEmailSentAt: now }
      : { statusEmailSentAt: now };

  try
  {
    await db.update(orders).set(patch).where(eq(orders.id, orderId));
  }
  catch (error)
  {
    console.warn("[email] Could not persist email sent audit timestamp.", error);
  }
}

async function sendEmail (
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<EmailSendResult>
{
  const resend = getResend();
  if (!resend)
  {
    console.warn("[email] RESEND_API_KEY missing, skipping email send.");
    return "skipped-no-provider";
  }

  try
  {
    const response = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject,
      html,
      text,
    });

    if (response && "error" in response && response.error)
    {
      console.error("[email] Resend API error", response.error);
      return "failed";
    }

    return "sent";
  }
  catch (error)
  {
    console.error("[email] Failed to send email", error);
    return "failed";
  }
}

function renderLayoutHtml (title: string, subtitle: string, bodyHtml: string, ctaLabel: string, ctaHref: string): string
{
  return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#07090d;padding:24px;color:#e5e7eb">
    <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.12);border-radius:16px;background:#10131a;padding:24px">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.18em;color:#9ca3af">1UpLabs</div>
      <h1 style="margin:10px 0 6px;font-size:26px;line-height:1.2;color:#fff">${escapeHtml(title)}</h1>
      <p style="margin:0 0 18px;color:#cbd5e1">${escapeHtml(subtitle)}</p>
      ${bodyHtml}
      <div style="margin-top:20px">
        <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:#10b981;color:#041014;text-decoration:none;padding:10px 16px;border-radius:9999px;font-weight:700">${escapeHtml(ctaLabel)}</a>
      </div>
    </div>
  </div>
  `.trim();
}

function renderItemsHtml (items: OrderEmailData["items"]): string
{
  const rows = items.map((item) => `
    <tr>
      <td style="padding:8px 0;color:#f8fafc">${escapeHtml(item.productName)} ${escapeHtml(item.productAmount)}</td>
      <td style="padding:8px 0;color:#cbd5e1;text-align:right">${item.qty} x ${escapeHtml(formatUsdFromCents(item.unitPriceCents))}</td>
      <td style="padding:8px 0;color:#f8fafc;text-align:right;font-weight:600">${escapeHtml(formatUsdFromCents(item.lineTotalCents))}</td>
    </tr>
  `).join("");

  return `
  <table style="width:100%;border-collapse:collapse;border:1px solid rgba(255,255,255,0.12);border-radius:12px;overflow:hidden;background:#0b0f16;padding:12px">
    <tbody>${rows}</tbody>
  </table>
  `.trim();
}

function renderPaymentMethodsHtml (orderId: string, totalCents: number): string
{
  const methods = getManualPaymentMethods(orderId, totalCents);
  const memo = orderIdToMemo(orderId);
  const methodRows = methods.map((method) =>
  {
    const link = method.paymentUrl
      ? `<div style="margin-top:4px"><a href="${escapeHtml(method.paymentUrl)}" style="color:#34d399;text-decoration:none">Open ${escapeHtml(method.title)} link</a></div>`
      : "";

    return `
      <div style="padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:#0b0f16;margin-top:10px">
        <div style="font-weight:700;color:#f8fafc">${escapeHtml(method.title)}</div>
        <div style="margin-top:4px;color:#cbd5e1">${escapeHtml(method.destinationLabel)}: ${escapeHtml(method.destinationValue)}</div>
        <div style="margin-top:4px;color:#94a3b8">${escapeHtml(method.note)}</div>
        ${link}
      </div>
    `;
  }).join("");

  return `
    <div style="margin-top:16px">
      <div style="color:#f8fafc;font-weight:700">Manual payment methods</div>
      ${methodRows}
      <div style="margin-top:12px;color:#cbd5e1">Memo to include: <strong style="color:#fff">${escapeHtml(memo)}</strong></div>
      <div style="margin-top:4px;color:#94a3b8">For Zelle, add your Order ID in the memo before sending.</div>
    </div>
  `.trim();
}

function buildReceiptText (data: OrderEmailData): string
{
  const orderUrl = `${getSiteUrl()}/orders/${data.order.id}/thank-you`;
  const orderNumber = getOrderNumber(data.order.id);
  const itemsText = data.items.map((item) =>
    `- ${item.productName} ${item.productAmount}: ${item.qty} x ${formatUsdFromCents(item.unitPriceCents)} = ${formatUsdFromCents(item.lineTotalCents)}`).join("\n");

  return [
    `Thanks for your order #${orderNumber}.`,
    "",
    `Order ID: ${data.order.id}`,
    `Total: ${formatUsdFromCents(data.order.totalCents)}`,
    `Status: ${statusDisplay(data.order.status)}`,
    `Order page: ${orderUrl}`,
    "",
    "Items:",
    itemsText,
    "",
    buildPaymentInstructionsText(data.order.id, data.order.totalCents),
  ].join("\n");
}

function buildReceiptHtml (data: OrderEmailData): string
{
  const orderNumber = getOrderNumber(data.order.id);
  const orderUrl = `${getSiteUrl()}/orders/${data.order.id}/thank-you`;
  const body = `
    <div style="color:#e2e8f0">
      <div style="margin-bottom:10px">Order number: <strong style="color:#fff">#${escapeHtml(orderNumber)}</strong></div>
      <div style="margin-bottom:10px">Order ID: <span style="color:#fff">${escapeHtml(data.order.id)}</span></div>
      <div style="margin-bottom:16px">Total: <strong style="color:#fff">${escapeHtml(formatUsdFromCents(data.order.totalCents))}</strong></div>
      ${renderItemsHtml(data.items)}
      ${renderPaymentMethodsHtml(data.order.id, data.order.totalCents)}
    </div>
  `.trim();

  return renderLayoutHtml("Thanks for your order", "Your order is now received and pending payment.", body, "Open your thank-you page", orderUrl);
}

function buildPaymentInstructionsTextMessage (data: OrderEmailData): string
{
  const orderUrl = `${getSiteUrl()}/orders/${data.order.id}/thank-you`;
  const orderNumber = getOrderNumber(data.order.id);
  return [
    `Payment instructions for order #${orderNumber}.`,
    "",
    `Order ID: ${data.order.id}`,
    `Total: ${formatUsdFromCents(data.order.totalCents)}`,
    `Order page: ${orderUrl}`,
    "",
    buildPaymentInstructionsText(data.order.id, data.order.totalCents),
  ].join("\n");
}

function buildPaymentInstructionsHtml (data: OrderEmailData): string
{
  const orderNumber = getOrderNumber(data.order.id);
  const orderUrl = `${getSiteUrl()}/orders/${data.order.id}/thank-you`;
  const body = `
    <div style="color:#e2e8f0">
      <div style="margin-bottom:10px">Order number: <strong style="color:#fff">#${escapeHtml(orderNumber)}</strong></div>
      <div style="margin-bottom:10px">Order ID: <span style="color:#fff">${escapeHtml(data.order.id)}</span></div>
      <div style="margin-bottom:16px">Total: <strong style="color:#fff">${escapeHtml(formatUsdFromCents(data.order.totalCents))}</strong></div>
      ${renderPaymentMethodsHtml(data.order.id, data.order.totalCents)}
    </div>
  `.trim();

  return renderLayoutHtml("Payment instructions", "Use any one of the methods below to complete your payment.", body, "Open your thank-you page", orderUrl);
}

function buildStatusTextMessage (data: OrderEmailData): string
{
  const orderNumber = getOrderNumber(data.order.id);
  const trackingLines = data.order.status === "shipped"
    ? [
      `Carrier: ${data.order.mailService ?? "n/a"}`,
      `Tracking number: ${data.order.trackingNumber ?? "n/a"}`,
    ]
    : [];

  const pendingReminder = data.order.status === "pending"
    ? [
      "",
      `Complete payment here: ${getSiteUrl()}/orders/${data.order.id}/thank-you`,
      `Amount: ${formatUsdFromCents(data.order.totalCents)}`,
      `Memo: ${orderIdToMemo(data.order.id)}`,
    ]
    : [];

  return [
    `Your order #${orderNumber} status changed.`,
    "",
    `Order ID: ${data.order.id}`,
    `New status: ${statusDisplay(data.order.status)}`,
    `Total: ${formatUsdFromCents(data.order.totalCents)}`,
    ...trackingLines,
    ...pendingReminder,
  ].join("\n");
}

function buildStatusHtml (data: OrderEmailData): string
{
  const orderNumber = getOrderNumber(data.order.id);
  const orderUrl = `${getSiteUrl()}/orders/${data.order.id}`;
  const shippingInfo = data.order.status === "shipped"
    ? `
      <div style="margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:#0b0f16">
        <div style="color:#f8fafc;font-weight:700">Shipping details</div>
        <div style="margin-top:4px;color:#cbd5e1">Carrier: ${escapeHtml(data.order.mailService ?? "n/a")}</div>
        <div style="margin-top:2px;color:#cbd5e1">Tracking number: ${escapeHtml(data.order.trackingNumber ?? "n/a")}</div>
      </div>
    `
    : "";

  const body = `
    <div style="color:#e2e8f0">
      <div style="margin-bottom:10px">Order number: <strong style="color:#fff">#${escapeHtml(orderNumber)}</strong></div>
      <div style="margin-bottom:10px">Order ID: <span style="color:#fff">${escapeHtml(data.order.id)}</span></div>
      <div style="margin-bottom:10px">Status: <strong style="color:#fff">${escapeHtml(statusDisplay(data.order.status))}</strong></div>
      <div style="margin-bottom:16px">Total: <strong style="color:#fff">${escapeHtml(formatUsdFromCents(data.order.totalCents))}</strong></div>
      ${shippingInfo}
    </div>
  `.trim();

  return renderLayoutHtml("Order status updated", "Your order status has changed.", body, "Open order details", orderUrl);
}

export async function sendOrderReceiptEmail (orderId: string): Promise<EmailSendResult>
{
  const data = await loadOrderEmailData(orderId);
  if (!data) return "failed";
  if (data.order.receiptEmailSentAt) return "already-sent";

  const orderNumber = getOrderNumber(data.order.id);
  const html = buildReceiptHtml(data);
  const text = buildReceiptText(data);
  const result = await sendEmail(data.order.email, `Receipt for order #${orderNumber}`, html, text);

  if (result === "sent")
  {
    await markEmailSentAt(orderId, "receipt");
  }

  return result;
}

export async function sendPaymentInstructionsEmail (orderId: string): Promise<EmailSendResult>
{
  const data = await loadOrderEmailData(orderId);
  if (!data) return "failed";
  if (data.order.paymentInstructionsEmailSentAt) return "already-sent";

  const orderNumber = getOrderNumber(data.order.id);
  const html = buildPaymentInstructionsHtml(data);
  const text = buildPaymentInstructionsTextMessage(data);
  const result = await sendEmail(data.order.email, `Payment instructions for order #${orderNumber}`, html, text);

  if (result === "sent")
  {
    await markEmailSentAt(orderId, "paymentInstructions");
  }

  return result;
}

export async function sendOrderStatusUpdateEmail (orderId: string): Promise<EmailSendResult>
{
  const data = await loadOrderEmailData(orderId);
  if (!data) return "failed";

  const orderNumber = getOrderNumber(data.order.id);
  const html = buildStatusHtml(data);
  const text = buildStatusTextMessage(data);
  const result = await sendEmail(data.order.email, `Order #${orderNumber} is now ${statusDisplay(data.order.status)}`, html, text);

  if (result === "sent")
  {
    await markEmailSentAt(orderId, "statusUpdate");
  }

  return result;
}

export async function getReceiptEmailAudit (orderId: string): Promise<{ sentAt: Date | null }>
{
  try
  {
    const rows = await db
      .select({ sentAt: orders.receiptEmailSentAt })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    return { sentAt: rows[0]?.sentAt ?? null };
  }
  catch
  {
    return { sentAt: null };
  }
}

export function formatOrderNumberFromId (orderId: string): string
{
  return getOrderNumber(orderId);
}

export function formatUsdForLink (cents: number): string
{
  return amountFromCents(cents);
}
