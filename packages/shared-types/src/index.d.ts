// ─────────────────────────────────────────────────────────────────────────────
// @celebs/shared-types — type declarations
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "active" | "on_trial" | "past_due" | "paused"
  | "cancelled" | "expired" | "unknown";

export interface Subscription {
  status:           SubscriptionStatus;
  variantId:        string;
  subscriptionId:   string;
  customerId:       string;
  currentPeriodEnd: string | null;
}

// ─── Comparison API ──────────────────────────────────────────────────────────
export interface GenerateComparisonRequest {
  comparisonId:    string;
  base64Image:     string;
  embeddings?:     number[];
  describePicture?: boolean;
  enrich?:          boolean;
}

export interface CelebrityImageData {
  url:        string;
  age:        string | number | null;
  gender:     string | null;
  ethnicity:  string | null;
  emotion:    string | null;
}

export interface CelebrityMatch {
  name:         string;
  score:        number; // 0-100
  celebrityId:  string;
  comparisonId: string;
  imageData:    CelebrityImageData;
}

export interface GenerateComparisonResponse {
  matches: CelebrityMatch[];
}

// ─── Checkout API ────────────────────────────────────────────────────────────
export interface CreateCheckoutRequest  { variantId: string; }
export interface CreateCheckoutResponse { url:       string; }

// ─── Web-side normalised match (used by ResultsPage / MorphSlider / cards) ──
export interface NormalisedMatch {
  name:         string;
  pct:          number;            // Math.round(score)
  img:          string | null;
  color:        string;
  celebrityId:  string;
  comparisonId: string;
  age:          string | number | null;
  gender:       string | null;
  ethnicity:    string | null;
  emotion:      string | null;
}

export const PREMIUM_STATUSES:        readonly SubscriptionStatus[];
export const SUBSCRIPTION_STATUSES:   readonly SubscriptionStatus[];
export const HANDLED_LS_EVENTS:       readonly string[];
