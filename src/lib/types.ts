export type Category = {
  id: number;
  slug: string;
  name: string;
  group_name: string;
  kind: "service" | "employment" | "both";
};

export type JobPost = {
  id: string;
  author_id: string;
  category_id: number;
  kind: "service" | "employment";
  title: string;
  description: string;
  province: string;
  locality: string;
  zone_reference?: string | null;
  desired_date?: string | null;
  urgency: "normal" | "soon" | "urgent" | "scheduled";
  budget_mode: "open" | "fixed" | "range" | "hourly" | "daily" | "monthly";
  budget_min?: number | null;
  budget_max?: number | null;
  currency: string;
  status: "draft" | "open" | "assigned" | "completed" | "cancelled";
  published_at: string;
  created_at: string;
  assigned_proposal_id?: string | null;
  is_wall_visible?: boolean;
  schedule_text?: string | null;
  expires_at?: string | null;
  categories?: Pick<Category, "name" | "group_name" | "slug"> | null;
};

export type Proposal = {
  id: string;
  post_id: string;
  proposer_id: string;
  amount?: number | null;
  amount_unit: "total" | "hour" | "day" | "month" | "open";
  message: string;
  includes_text?: string | null;
  availability_text?: string | null;
  estimated_time_text?: string | null;
  warranty_text?: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
};

export type ContextualAd = {
  campaign_id: string;
  business_id: string;
  business_name: string;
  business_logo_url?: string | null;
  business_verified: boolean;
  placement: string;
  title: string;
  body?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_url: string;
  coupon_code?: string | null;
  category_id?: number | null;
  group_name?: string | null;
  locality?: string | null;
  province?: string | null;
  relevance_score: number;
};
