import { z } from "zod";

// Schema para dados de agendamento
export const bookingSchema = z.object({
  email: z
    .string()
    .min(1, "booking.validation.emailRequired")
    .email("booking.validation.emailInvalid"),
  name: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "booking.validation.nameMinLength",
    }),
  date: z.date({
    required_error: "booking.validation.dateRequired",
    invalid_type_error: "booking.validation.dateInvalid",
  }),
  time: z.string().min(1, "booking.validation.timeRequired"),
});

// Schema para PayPal
export const paypalSchema = z.object({
  email: z
    .string()
    .min(1, "payment.validation.paypalEmailRequired")
    .email("payment.validation.paypalEmailInvalid"),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
export type PaypalFormData = z.infer<typeof paypalSchema>;
