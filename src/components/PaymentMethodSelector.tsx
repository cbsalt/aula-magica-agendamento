
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Mail } from 'lucide-react';

export type PaymentMethod = 'card' | 'paypal';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}

const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => {
  const { t } = useTranslation();

  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      name: t('payment.methods.card'),
      icon: <CreditCard className="h-5 w-5" />,
      description: t('payment.methods.cardDescription')
    },
    {
      id: 'paypal' as PaymentMethod,
      name: t('payment.methods.paypal'),
      icon: <Mail className="h-5 w-5" />,
      description: t('payment.methods.paypalDescription')
    },

  ];

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{t('payment.selectMethod')}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value={method.id} id={method.id} />
            <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
              {method.icon}
              <div>
                <div className="font-medium">{method.name}</div>
                <div className="text-sm text-gray-500">{method.description}</div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
