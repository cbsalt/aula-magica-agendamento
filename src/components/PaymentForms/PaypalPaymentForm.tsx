import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaypalFormData } from "@/lib/validation";

const PaypalPaymentForm = () => {
  const { t } = useTranslation();

  const {
    register,
    formState: { errors },
  } = useFormContext<PaypalFormData>();

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">{t("payment.paypalMessage")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paypalEmail">{t("payment.paypalEmail")}</Label>
        <Input
          id="paypalEmail"
          type="email"
          placeholder={t("payment.paypalEmailPlaceholder")}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-600">
            {t(errors.email.message || "")}
          </p>
        )}
      </div>
    </div>
  );
};

export default PaypalPaymentForm;
