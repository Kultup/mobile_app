// Common types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// User types
export interface User {
  _id: string;
  full_name: string;
  city: string | {_id: string; name: string};
  position: string | {_id: string; name: string};
  total_score: number;
  points_balance: number;
  current_streak: number;
  longest_streak: number;
  tests_completed: number;
  created_at: string;
  avatar_id?: string | {_id: string; name: string; image_url?: string};
  profile_frame_id?: string | {_id: string; name: string; image_url?: string};
  active_badges?: string[] | Array<{_id: string; name: string; image_url?: string}>;
}

// Auth types
export interface LoginCredentials {
  full_name: string;
  city: string;
  position: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  // Same structure as LoginCredentials for now
}

export type RegisterData = LoginCredentials;

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Test types
export interface Question {
  _id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  media_type: 'none' | 'image' | 'video';
  image_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  answers: Answer[];
  explanation?: string;
  knowledge_base_article_id?: string;
}

export interface Answer {
  answer_text: string;
  is_correct: boolean;
  sort_order?: number;
}

export interface DailyTest {
  _id: string;
  test_date: string;
  questions: Question[];
  is_completed: boolean;
  deadline: string;
}

// Knowledge Base types
export interface KnowledgeArticle {
  _id: string;
  title: string;
  content: string;
  category_id?: string | {_id: string; name: string};
  image_url?: string;
  pdf_url?: string;
  views_count: number;
  is_active: boolean;
  created_at: string;
}

// Rating types
export interface RatingUser {
  position: number;
  user: {
    id: string;
    full_name: string;
    city?: string | {_id: string; name: string};
    position?: string | {_id: string; name: string};
  };
  total_score: number;
  tests_completed: number;
  current_streak: number;
}

export interface RatingsResponse {
  data: RatingUser[];
  current_user_position?: number;
  meta?: {
    current_page: number;
    total_pages: number;
    total: number;
  };
}

// Video quality types
export type VideoQuality = '1080p' | '720p' | '480p' | '360p';

// Survey types
export interface Survey {
  _id: string;
  title: string;
  description?: string;
  survey_type: 'rating' | 'text' | 'multiple_choice';
  options?: string[]; // For multiple_choice
  is_completed: boolean;
  is_active: boolean;
  created_at: string;
}

// Feedback types
export interface SuggestQuestionData {
  question_text: string;
  suggested_answers?: string[];
  category_id?: string;
  comment?: string;
}

export interface ReportErrorData {
  question_id?: string;
  description: string;
  screenshot_url?: string;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
  progress: number;
  condition_value: number;
  is_completed: boolean;
  completed_at?: string | null;
  reward_points: number;
}

export interface AchievementsResponse {
  total_achievements: number;
  completed: number;
  in_progress: number;
  locked: number;
  achievements: Achievement[];
}

// Shop types
export interface ShopProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  product_type: 'avatar' | 'profile_frame' | 'badge' | 'theme' | 'customization' | 'gift';
  category_id?: string | {_id: string; name: string};
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserPurchase {
  _id: string;
  product_id: string | ShopProduct;
  price_paid: number;
  purchased_at: string;
  is_applied: boolean;
  applied_at?: string;
}

export interface PurchaseResponse {
  purchase_id: string;
  product: {
    id: string;
    name: string;
  };
  price_paid: number;
  balance_after: number;
  message: string;
}

