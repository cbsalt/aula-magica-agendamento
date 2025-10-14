export interface BookingResponseDto {
  id: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  meetLink?: string | null;
  notes?: string | null;
  paymentId?: string | null;
  paypalOrderId?: string | null;
  googleEventId?: string | null;
}

export interface BookingsListResponseDto {
  bookings: BookingResponseDto[];
}
