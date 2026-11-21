/** MOCK POLICY CONTENT — outline only. Final legal text must be supplied and reviewed by the business. */
export type Policy = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

export const policies: Policy[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    updated: "DD Mon YYYY",
    intro:
      "This page explains how Potato First collects, uses and protects your information when you order from our website. [Final policy text to be provided and reviewed by the business.]",
    sections: [
      { heading: "1. Information we collect", body: "Name, phone number, delivery address and (optionally) email — only what we need to deliver your order." },
      { heading: "2. How we use it", body: "To confirm, pack and deliver your order, and to contact you about it. We do not sell your data." },
      { heading: "3. Payments", body: "Cash on Delivery or payments processed by trusted gateways. We do not store card details." },
      { heading: "4. Contact", body: "Questions about this policy? Call 01XXX-XXXXXX or email hello@yourdomain.com." },
    ],
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    updated: "DD Mon YYYY",
    intro: "These terms apply to all orders placed on the Potato First website. [Final text to be provided and reviewed by the business.]",
    sections: [
      { heading: "1. Orders", body: "An order is confirmed after our team calls or messages you to verify the details." },
      { heading: "2. Prices", body: "Prices are shown in Bangladeshi Taka (৳) and may change without notice. The price at the time of order applies." },
      { heading: "3. Delivery", body: "Delivery times are estimates. See Delivery Information for current charges." },
    ],
  },
  {
    slug: "returns",
    title: "Return & Refund Policy",
    updated: "DD Mon YYYY",
    intro: "We want every pack to arrive in perfect condition. [Final text to be provided and reviewed by the business.]",
    sections: [
      { heading: "Check at delivery", body: "Please check the pack in front of the delivery person." },
      { heading: "Damaged or wrong item?", body: "Tell us within [X] hours with a photo — we will replace or refund." },
      { heading: "Food safety", body: "Opened food packs can’t be returned unless faulty." },
    ],
  },
  {
    slug: "delivery",
    title: "Delivery Information",
    updated: "DD Mon YYYY",
    intro: "We deliver across Bangladesh. Charges are added at checkout based on your area.",
    sections: [
      { heading: "Inside Dhaka", body: "৳ [00] · 1–2 days" },
      { heading: "Outside Dhaka", body: "৳ [00] · 2–4 days" },
      { heading: "Cash on Delivery", body: "Available everywhere. We call to confirm before dispatch." },
    ],
  },
  {
    slug: "faq",
    title: "FAQs",
    updated: "DD Mon YYYY",
    intro: "Quick answers to the questions we hear most.",
    sections: [],
  },
];

export const faqs = [
  { q: "Do I need an account to order?", a: "No. You can order as a guest with just your name, phone number and address." },
  { q: "How much is delivery?", a: "Delivery charge depends on your area (Inside or Outside Dhaka) and is shown at checkout." },
  { q: "Which payment methods do you accept?", a: "Cash on Delivery, bKash and online card payment." },
  { q: "Can I order on WhatsApp?", a: "Yes — tap “Order via WhatsApp” on any product or in your cart and send us the message." },
  { q: "How do I track my order?", a: "Use the Track Order page with your order ID and phone number." },
];
