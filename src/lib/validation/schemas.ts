import { z } from "zod";

/** Bangladeshi mobile: 11 digits starting 01[3-9] (optionally +880 / 880 prefix). */
export const bdPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+?880/, "0"))
  .pipe(z.string().regex(/^01[3-9]\d{8}$/, "Please enter a valid phone number (01XXXXXXXXX)"));

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || z.email().safeParse(v).success, "Please enter a valid email address");

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  phone: bdPhone,
  email: optionalEmail,
  address: z.string().trim().min(10, "Please enter your full address (house, road, area, district)"),
  deliveryArea: z.enum(["inside-dhaka", "outside-dhaka"]),
  paymentMethod: z.enum(["cod", "bkash", "online"]),
  note: z.string().trim().max(300).optional(),
  agree: z.literal(true, { error: "Please accept the Terms & Conditions" }),
});
export type CheckoutValues = z.input<typeof checkoutSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: bdPhone,
  email: optionalEmail,
  subject: z.string().trim().optional(),
  message: z.string().trim().min(10, "Please write a short message (at least 10 characters)"),
});
export type ContactValues = z.input<typeof contactSchema>;

/** Track by order ID OR phone number — at least one is required. */
export const trackSchema = z
  .object({
    orderId: z
      .string()
      .trim()
      .refine((v) => v === "" || /^#?PF-?\d{4,}$/i.test(v), "Order ID looks like PF-000000"),
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || /^01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, "").replace(/^\+?88/, "")), "Please enter a valid phone number (01XXXXXXXXX)"),
  })
  .refine((v) => v.orderId !== "" || v.phone !== "", { message: "Enter your order ID or phone number", path: ["orderId"] });
export type TrackValues = z.input<typeof trackSchema>;

export const newsletterSchema = z.object({ email: z.email("Please enter a valid email address") });

/** Customer login: phone or email + password */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .refine((v) => /^01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, "")) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter your phone number or email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginValues = z.input<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name"),
    phone: bdPhone,
    email: optionalEmail,
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don’t match", path: ["confirm"] });
export type RegisterValues = z.input<typeof registerSchema>;
