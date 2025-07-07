
export interface Teacher {
  id: string;
  name: string;
  email: string;
  photo?: string;
  description?: string;
  price: number;
  currency: string;
  googleCalendarId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  zoomApiKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAvailability {
  teacherId: string;
  date: string;
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface BookingRequest {
  teacherId: string;
  studentEmail: string;
  studentName?: string;
  date: string;
  timeSlot: TimeSlot;
  paymentMethod: 'card' | 'paypal' | 'payoneer';
  paymentData: any;
}

export interface Booking {
  id: string;
  teacherId: string;
  studentEmail: string;
  studentName?: string;
  date: string;
  timeSlot: TimeSlot;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  zoomLink?: string;
  createdAt: string;
}
