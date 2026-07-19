/**
 * WhatsApp deep-link helpers. This white-label instance routes ordering through
 * WhatsApp (per the Golden Cakes add-on) by opening a `wa.me` link with a
 * pre-filled message — no WhatsApp Business API, just a redirect to a number.
 */

/** Digits-only phone (wa.me rejects +, spaces, dashes). */
function normalize(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

/** A `wa.me` link to a number with an optional pre-filled message. */
export function buildWaLink(phone: string, message?: string): string {
  const num = normalize(phone);
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Open a WhatsApp chat in a new tab/app. No-op if the number is empty. */
export function openWhatsApp(phone: string | null | undefined, message?: string): void {
  if (!phone) return;
  window.open(buildWaLink(phone, message), "_blank", "noopener");
}

/** A cart/order line rendered into a WhatsApp message line. */
export interface WaLineItem {
  name: string;
  variantLabel?: string | null;
  flavorName?: string | null;
  quantity: number;
  lineTotal: number;
  addons?: { name: string; quantity: number }[];
}

interface WaOrderContext {
  brandName: string;
  branchName?: string | null;
  items: WaLineItem[];
  subtotal: number;
  customerName?: string | null;
  customerPhone?: string | null;
}

const rupees = (n: number): string => `₹${n.toFixed(0)}`;

function renderItems(items: WaLineItem[]): string {
  return items
    .map((it) => {
      const opts = [it.variantLabel, it.flavorName].filter(Boolean).join(" · ");
      const addons =
        it.addons && it.addons.length
          ? `\n   + ${it.addons.map((a) => `${a.quantity}× ${a.name}`).join(", ")}`
          : "";
      return `• ${it.quantity}× ${it.name}${opts ? ` (${opts})` : ""} — ${rupees(it.lineTotal)}${addons}`;
    })
    .join("\n");
}

/**
 * Abandoned-cart alert: sent to the shop when a shopper adds to cart but hasn't
 * checked out. Phrased from the shop's perspective as a follow-up prompt.
 */
export function buildCartMessage(ctx: WaOrderContext): string {
  const who = ctx.customerName ? `\nCustomer: ${ctx.customerName}` : "";
  return (
    `🛒 *Cart update — not yet checked out*\n` +
    `${ctx.brandName}${ctx.branchName ? ` · ${ctx.branchName}` : ""}${who}\n\n` +
    `${renderItems(ctx.items)}\n\n` +
    `Subtotal: ${rupees(ctx.subtotal)}\n\n` +
    `I'd like to complete this order.`
  );
}

/** Checkout hand-off: the shopper confirms/completes the order over WhatsApp. */
export function buildOrderMessage(ctx: WaOrderContext): string {
  const contact = [ctx.customerName, ctx.customerPhone].filter(Boolean).join(" · ");
  return (
    `🎂 *New order*\n` +
    `${ctx.brandName}${ctx.branchName ? ` · ${ctx.branchName}` : ""}\n` +
    `${contact ? `${contact}\n` : ""}\n` +
    `${renderItems(ctx.items)}\n\n` +
    `*Total: ${rupees(ctx.subtotal)}*\n\n` +
    `Please confirm my order. Thank you!`
  );
}
