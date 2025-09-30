"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { toast } from "react-hot-toast";
import { saveTeacherPaymentConfig } from "@/services/teacherService";
import { PaymentFormData, paymentSchema } from "@/lib/validation";

export const PaymentsSection = ({ initialData }) => {
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<PaymentFormData>({
    mode: "onChange",
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      receiveViaStripe: initialData?.receiveViaStripe || false,
      stripeAccountId: initialData?.stripeAccountId || "",
      receiveViaBank: initialData?.receiveViaBank || false,
      bankName: initialData?.bankName || "",
      bankAgency: initialData?.bankAgency || "",
      bankAccount: initialData?.bankAccount || "",
      accountHolder: initialData?.accountHolder || "",
      pixKey: initialData?.pixKey || "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = methods;

  const receiveViaStripe = watch("receiveViaStripe");
  const receiveViaBank = watch("receiveViaBank");

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  const errorClass = "text-xs text-red-600 mt-1";

  const onSubmit = async (data: PaymentFormData) => {
    setIsSaving(true);
    try {
      await saveTeacherPaymentConfig(data);
      toast.success("Configuração de pagamento salva com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Erro ao salvar configuração", {
        position: "top-center",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckboxChange = async (
    field: "receiveViaStripe" | "receiveViaBank",
    checked: boolean
  ) => {
    setValue(field, checked, { shouldValidate: false });
    if (!checked) {
      await handleCloseOption(field);
    }
  };

  const handleCloseOption = async (
    option: "receiveViaStripe" | "receiveViaBank"
  ) => {
    if (option === "receiveViaStripe") {
      setValue("receiveViaStripe", false, { shouldValidate: true });
      setValue("stripeAccountId", "", { shouldValidate: true });
    } else if (option === "receiveViaBank") {
      setValue("receiveViaBank", false, { shouldValidate: true });
      [
        "bankName",
        "bankAgency",
        "bankAccount",
        "accountHolder",
        "pixKey",
      ].forEach((field) =>
        setValue(field as keyof PaymentFormData, "", { shouldValidate: true })
      );
    }
    await trigger();
  };

  const isAtLeastOneOptionSelected = receiveViaStripe || receiveViaBank;
  const isSubmitDisabled = isSaving || !isValid || !isAtLeastOneOptionSelected;

  return (
    <FormProvider {...methods}>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            Configuração de Recebimento
          </h2>
          <p className="text-gray-600 mb-6">
            Configure como deseja receber os pagamentos dos alunos. A plataforma
            processará os pagamentos e repassará os valores automaticamente.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Stripe */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  {...register("receiveViaStripe")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleCheckboxChange("receiveViaStripe", true);
                    } else {
                      handleCloseOption("receiveViaStripe");
                    }
                  }}
                  checked={receiveViaStripe}
                  className="mr-3"
                />
                <div>
                  <h3 className="font-medium">Receber via Stripe Connect</h3>
                  <p className="text-sm text-gray-600">
                    Receba diretamente na sua conta Stripe
                  </p>
                </div>
              </div>

              {receiveViaStripe && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stripe Account ID
                  </label>
                  <input
                    {...register("stripeAccountId")}
                    placeholder="acct_xxxxxxxxxx"
                    className={inputClass}
                  />
                  {errors.stripeAccountId?.message && (
                    <p className={errorClass}>
                      {errors.stripeAccountId.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Banco / PIX */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  {...register("receiveViaBank")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleCheckboxChange("receiveViaBank", true);
                    } else {
                      handleCloseOption("receiveViaBank");
                    }
                  }}
                  checked={receiveViaBank}
                  className="mr-3"
                />
                <div>
                  <h3 className="font-medium">
                    Receber via Transferência Bancária / PIX
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receba diretamente em sua conta bancária ou via PIX
                  </p>
                </div>
              </div>

              {receiveViaBank && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banco
                    </label>
                    <input {...register("bankName")} className={inputClass} />
                    {errors.bankName?.message && (
                      <p className={errorClass}>{errors.bankName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agência
                      </label>
                      <input
                        {...register("bankAgency")}
                        className={inputClass}
                      />
                      {errors.bankAgency?.message && (
                        <p className={errorClass}>
                          {errors.bankAgency.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conta Corrente
                      </label>
                      <input
                        {...register("bankAccount")}
                        className={inputClass}
                      />
                      {errors.bankAccount?.message && (
                        <p className={errorClass}>
                          {errors.bankAccount.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titular da Conta
                    </label>
                    <input
                      {...register("accountHolder")}
                      className={inputClass}
                    />
                    {errors.accountHolder?.message && (
                      <p className={errorClass}>
                        {errors.accountHolder.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PIX (CPF, CNPJ ou e-mail)
                    </label>
                    <input {...register("pixKey")} className={inputClass} />
                    {errors.pixKey?.message && (
                      <p className={errorClass}>{errors.pixKey.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full"
            >
              {isSaving ? "Salvando..." : "Salvar Configuração"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};
