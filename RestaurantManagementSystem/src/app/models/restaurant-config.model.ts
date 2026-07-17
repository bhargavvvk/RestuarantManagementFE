export interface RestaurantConfig {
  id: number;
  restaurantName: string;
  description: string | null;
  address: string | null;
  phoneNumber: string | null;
  email: string | null;
  openingTime: string | null;   // "HH:mm"
  closingTime: string | null;   // "HH:mm"
  about: string | null;
  knowledgeBase: Record<string, unknown> | unknown[] | null;
  lastUpdatedAt: string;
}

export interface UpdateRestaurantDetailsRequest {
  restaurantName: string;       // required, max 100
  description?: string | null;  // max 500
  address?: string | null;      // max 500
  phoneNumber?: string | null;  // max 20
  email?: string | null;        // valid email
  openingTime?: string | null;  // HH:mm
  closingTime?: string | null;  // HH:mm
  about?: string | null;        // max 2000
}

export interface UpdateKnowledgeBaseRequest {
  value: Record<string, unknown> | unknown[] | null;
}
