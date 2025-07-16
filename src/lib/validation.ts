
import { z } from 'zod';

// Função para validar cartão de crédito usando algoritmo de Luhn
const luhnCheck = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '').split('').map(Number);
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Schema para dados de agendamento
export const bookingSchema = z.object({
  email: z
    .string()
    .min(1, 'booking.validation.emailRequired')
    .email('booking.validation.emailInvalid'),
  name: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: 'booking.validation.nameMinLength'
    }),
  date: z.date({
    required_error: 'booking.validation.dateRequired',
    invalid_type_error: 'booking.validation.dateInvalid'
  }),
  time: z
    .string()
    .min(1, 'booking.validation.timeRequired')
});

// Schema para dados de cartão de crédito
export const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'payment.validation.cardNumberRequired')
    .refine((val) => {
      const cleaned = val.replace(/\s/g, '');
      return cleaned.length >= 13 && cleaned.length <= 19;
    }, 'payment.validation.cardNumberLength')
    .refine((val) => {
      const cleaned = val.replace(/\s/g, '');
      return /^\d+$/.test(cleaned);
    }, 'payment.validation.cardNumberDigits')
    .refine((val) => {
      const cleaned = val.replace(/\s/g, '');
      return luhnCheck(cleaned);
    }, 'payment.validation.cardNumberInvalid'),
  expiryDate: z
    .string()
    .min(1, 'payment.validation.expiryRequired')
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'payment.validation.expiryFormat')
    .refine((val) => {
      const [month, year] = val.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      return year > currentYear || (year === currentYear && month >= currentMonth);
    }, 'payment.validation.expiryExpired'),
  cvv: z
    .string()
    .min(1, 'payment.validation.cvvRequired')
    .regex(/^\d{3,4}$/, 'payment.validation.cvvFormat'),
  cardName: z
    .string()
    .min(1, 'payment.validation.cardNameRequired')
    .min(2, 'payment.validation.cardNameMinLength')
});

// Schema para PayPal
export const paypalSchema = z.object({
  email: z
    .string()
    .min(1, 'payment.validation.paypalEmailRequired')
    .email('payment.validation.paypalEmailInvalid')
});

export type BookingFormData = z.infer<typeof bookingSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
export type PaypalFormData = z.infer<typeof paypalSchema>;
