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

const pixRegex = /^(\d{11}|\d{14}|[^\s@]+@[^\s@]+\.[^\s@]+|\+?\d{10,15})$/;

export const paymentSchema = z
  .object({
    receiveViaStripe: z.boolean().default(false),
    stripeAccountId: z.string().optional(),
    receiveViaBank: z.boolean().default(false),
    bankName: z.string().optional(),
    bankAgency: z.string().optional(),
    bankAccount: z.string().optional(),
    accountHolder: z.string().optional(),
    pixKey: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.receiveViaStripe && !data.stripeAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stripe Account ID é obrigatório",
        path: ["stripeAccountId"],
      });
    }
    if (data.receiveViaBank) {
      if (!data.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Banco é obrigatório",
          path: ["bankName"],
        });
      }
      if (!data.bankAgency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Agência é obrigatória",
          path: ["bankAgency"],
        });
      }
      if (!data.bankAccount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Conta corrente é obrigatória",
          path: ["bankAccount"],
        });
      }
      if (!data.accountHolder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Titular da conta é obrigatório",
          path: ["accountHolder"],
        });
      }
      if (data.pixKey && !pixRegex.test(data.pixKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "PIX inválido",
          path: ["pixKey"],
        });
      }
    }
    if (!data.receiveViaStripe && !data.receiveViaBank) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione pelo menos uma forma de recebimento",
        path: ["receiveViaStripe"],
      });
    }
  });

export type PaymentFormData = z.infer<typeof paymentSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
