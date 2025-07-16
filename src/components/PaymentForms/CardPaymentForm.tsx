import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cardSchema, CardFormData } from "@/lib/validation";

interface CardPaymentFormProps {
  onValidationChange: (isValid: boolean, data?: CardFormData) => void;
}

const CardPaymentForm = ({ onValidationChange }: CardPaymentFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    mode: "onChange",
  });

  const watchedData = watch();

  React.useEffect(() => {
    onValidationChange(isValid, isValid ? watchedData : undefined);
  }, [isValid, watchedData, onValidationChange]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardName">{t("payment.cardName")}</Label>
        <Input
          id="cardName"
          placeholder={t("payment.cardNamePlaceholder")}
          {...register("cardName")}
        />
        {errors.cardName && (
          <p className="text-sm text-red-600">
            {t(errors.cardName.message || "")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber">{t("payment.cardNumber")}</Label>
        <Input
          id="cardNumber"
          placeholder={t("payment.cardNumberPlaceholder")}
          {...register("cardNumber")}
          onChange={(e) => {
            const formatted = formatCardNumber(e.target.value);
            setValue("cardNumber", formatted);
          }}
          maxLength={19}
        />
        {errors.cardNumber && (
          <p className="text-sm text-red-600">
            {t(errors.cardNumber.message || "")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">{t("payment.expiryDate")}</Label>
          <Input
            id="expiryDate"
            placeholder={t("payment.expiryPlaceholder")}
            {...register("expiryDate")}
            onChange={(e) => {
              const formatted = formatExpiryDate(e.target.value);
              setValue("expiryDate", formatted);
            }}
            maxLength={5}
          />
          {errors.expiryDate && (
            <p className="text-sm text-red-600">
              {t(errors.expiryDate.message || "")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">{t("payment.cvv")}</Label>
          <Input
            id="cvv"
            placeholder={t("payment.cvvPlaceholder")}
            {...register("cvv")}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setValue("cvv", value);
            }}
            maxLength={4}
          />
          {errors.cvv && (
            <p className="text-sm text-red-600">
              {t(errors.cvv.message || "")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardPaymentForm;
