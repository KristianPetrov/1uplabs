import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";

export const paymentMethodEnum = pgEnum("payment_method", [
  "cashapp",
  "zelle",
  "venmo",
  "bitcoin",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "canceled",
]);

export const userRoleEnum = pgEnum("user_role", ["admin", "customer"]);

export const productOverrides = pgTable("product_overrides", {
  slug: text("slug").primaryKey(),
  priceCents: integer("price_cents"),
  inventory: integer("inventory"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shopSettings = pgTable("shop_settings", {
  id: text("id").primaryKey().default("default"),
  flatShippingCents: integer("flat_shipping_cents").notNull().default(1000),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("admin"),
  name: text("name"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customerAddresses = pgTable("customer_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  phone: text("phone"),
  address1: text("address_1").notNull(),
  address2: text("address_2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull().default("US"),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),

  customerId: uuid("customer_id").references(() => users.id, { onDelete: "set null" }),

  email: text("email").notNull(),
  phone: text("phone"),

  shippingName: text("shipping_name").notNull(),
  shippingAddress1: text("shipping_address_1").notNull(),
  shippingAddress2: text("shipping_address_2"),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  shippingCountry: text("shipping_country").notNull().default("US"),

  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  mailService: text("mail_service"),
  trackingNumber: text("tracking_number"),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),

  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  discountCents: integer("discount_cents").notNull().default(0),
  shippingDiscountCents: integer("shipping_discount_cents").notNull().default(0),
  promoCode: text("promo_code"),
  promoCodeId: uuid("promo_code_id").references((): AnyPgColumn => promoCodes.id, { onDelete: "set null" }),
  totalCents: integer("total_cents").notNull(),
  receiptEmailSentAt: timestamp("receipt_email_sent_at", { withTimezone: true }),
  paymentInstructionsEmailSentAt: timestamp("payment_instructions_email_sent_at", { withTimezone: true }),
  statusEmailSentAt: timestamp("status_email_sent_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  productAmount: text("product_amount").notNull(),

  qty: integer("qty").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
});

export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  discountType: text("discount_type").notNull().default("none"),
  percentOff: integer("percent_off"),
  amountOffCents: integer("amount_off_cents"),
  shippingMode: text("shipping_mode").notNull().default("none"),
  shippingAmountOffCents: integer("shipping_amount_off_cents"),
  productSlugs: text("product_slugs").array().notNull().default([]),
  minSubtotalCents: integer("min_subtotal_cents").notNull().default(0),
  maxDiscountCents: integer("max_discount_cents"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  perCustomerLimit: integer("per_customer_limit"),
  firstOrderOnly: boolean("first_order_only").notNull().default(false),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const promoRedemptions = pgTable("promo_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  promoCodeId: uuid("promo_code_id")
    .notNull()
    .references(() => promoCodes.id, { onDelete: "restrict" }),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" })
    .unique(),
  email: text("email").notNull(),
  merchandiseDiscountCents: integer("merchandise_discount_cents").notNull().default(0),
  shippingDiscountCents: integer("shipping_discount_cents").notNull().default(0),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  promoCode: one(promoCodes, {
    fields: [orders.promoCodeId],
    references: [promoCodes.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(customerAddresses),
}));

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  user: one(users, {
    fields: [customerAddresses.userId],
    references: [users.id],
  }),
}));

export const promoCodesRelations = relations(promoCodes, ({ many }) => ({
  redemptions: many(promoRedemptions),
  orders: many(orders),
}));

export const promoRedemptionsRelations = relations(promoRedemptions, ({ one }) => ({
  promoCode: one(promoCodes, {
    fields: [promoRedemptions.promoCodeId],
    references: [promoCodes.id],
  }),
  order: one(orders, {
    fields: [promoRedemptions.orderId],
    references: [orders.id],
  }),
}));


