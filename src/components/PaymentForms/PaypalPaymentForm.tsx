
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paypalSchema, PaypalFormData } from '@/lib/validation';

interface PaypalPaymentFormProps {
  onValidationChange: (isValid: boolean, data?: PaypalFormData) => void;
}

const PaypalPaymentForm = ({ onValidationChange }: PaypalPaymentFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors, isValid },
    watch
  } = useForm<PaypalFormData>({
    resolver: zodResolver(paypalSchema),
    mode: 'onChange'
  });

  const watchedData = watch();

  React.useEffect(() => {
    onValidationChange(isValid, isValid ? watchedData : undefined);
  }, [isValid, watchedData, onValidationChange]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          {t('payment.paypalMessage')}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paypalEmail">{t('payment.paypalEmail')}</Label>
        <Input
          id="paypalEmail"
          type="email"
          placeholder={t('payment.paypalEmailPlaceholder')}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{t(errors.email.message || '')}</p>
        )}
      </div>
    </div>
  );
};

export default PaypalPaymentForm;
