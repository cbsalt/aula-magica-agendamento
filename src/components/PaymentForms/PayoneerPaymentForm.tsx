
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { payoneerSchema, PayoneerFormData } from '@/lib/validation';

interface PayoneerPaymentFormProps {
  onValidationChange: (isValid: boolean, data?: PayoneerFormData) => void;
}

const PayoneerPaymentForm = ({ onValidationChange }: PayoneerPaymentFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors, isValid },
    watch
  } = useForm<PayoneerFormData>({
    resolver: zodResolver(payoneerSchema),
    mode: 'onChange'
  });

  const watchedData = watch();

  React.useEffect(() => {
    onValidationChange(isValid, isValid ? watchedData : undefined);
  }, [isValid, watchedData, onValidationChange]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-sm text-orange-800">
          {t('payment.payoneerMessage')}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="payoneerEmail">{t('payment.payoneerEmail')}</Label>
        <Input
          id="payoneerEmail"
          type="email"
          placeholder={t('payment.payoneerEmailPlaceholder')}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{t(errors.email.message || '')}</p>
        )}
      </div>
    </div>
  );
};

export default PayoneerPaymentForm;
