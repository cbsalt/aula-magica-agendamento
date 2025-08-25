export interface ITeacher {
  id: string;
  email: string;
  name: string;
  photo?: string | null;
  description?: string | null;
  price: number | null;
  currency: string | null;
  slug: string;
  isActive: boolean;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  googleCalendarId: string | null;
  zoomAccessToken: string | null;
  zoomRefreshToken: string | null;
  zoomConnected: boolean;
  hasPublicLink: boolean;
  publicLinkId: string | null;
  createdAt: string;
  updatedAt: string;
  paymentConfig?: any | null;
}
