/**
 * Review submission (mock). Phase 2: POST multipart to Laravel
 * `/api/reviews` (fields below + media[]), stored as "pending" until an
 * admin approves it in the dashboard.
 */
export type ReviewSubmission = {
  name: string;
  phone?: string;
  productId?: string;
  rating: number;
  comment: string;
  media: File[];
};

export const REVIEW_LIMITS = { maxFiles: 5, maxImageMB: 5, maxVideoMB: 50 };

export async function submitReview(data: ReviewSubmission): Promise<{ id: string; status: "pending" }> {
  await new Promise((r) => setTimeout(r, 700));
  void data;
  return { id: `RV-${Date.now().toString(36).toUpperCase()}`, status: "pending" };
}
