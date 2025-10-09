"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { toast } from "react-hot-toast";
import Select from "react-select";
import useSWR from "swr";

import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, Button } from "../ui";
import {
  fetchBanks,
  getTeacherPaymentConfig,
  saveTeacherPaymentConfig,
} from "@/services/teacherService";
import { PaymentFormData, paymentSchema } from "@/lib/validation";

type Bank = {
  code: number;
  name: string;
  fullName: string;
};

export const PaymentsSection = ({ initialData }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoaded, setBanksLoaded] = useState(false);

  const { data: paymentConfig, mutate } = useSWR(
    "/api/teachers/me/payment-config",
    getTeacherPaymentConfig,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnMount: !initialData,
    }
  );

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
    control,
  } = methods;

  const receiveViaStripe = watch("receiveViaStripe");
  const receiveViaBank = watch("receiveViaBank");

  useEffect(() => {
    if (!paymentConfig) return;

    const fieldsToUpdate: Partial<PaymentFormData> = {
      receiveViaStripe: paymentConfig.receiveViaStripe ?? false,
      stripeAccountId: paymentConfig.stripeAccountId ?? "",
      receiveViaBank: paymentConfig.receiveViaBank ?? false,
      bankName: paymentConfig.bankName ?? "",
      bankAgency: paymentConfig.bankAgency ?? "",
      bankAccount: paymentConfig.bankAccount ?? "",
      accountHolder: paymentConfig.accountHolder ?? "",
      pixKey: paymentConfig.pixKey ?? "",
    };

    Object.entries(fieldsToUpdate).forEach(([key, value]) =>
      setValue(key as keyof PaymentFormData, value, { shouldValidate: false })
    );
  }, [paymentConfig, setValue]);

  const handleLoadBanks = async () => {
    if (banksLoaded) return;

    try {
      const data = await fetchBanks();

      setBanks(data);
      setBanksLoaded(true);
    } catch {
      toast.error(
        "Ocorreu um erro ao buscar os bancos. Por favor, tente mais tarde.",
        {
          position: "top-center",
        }
      );
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  const errorClass = "text-xs text-red-600 mt-1";

  const onSubmit = async (data: PaymentFormData) => {
    setIsSaving(true);
    try {
      await saveTeacherPaymentConfig(data);
      toast.success("Configuração de pagamento salva com sucesso!");
      await mutate();
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

  const options = banks.map((b) => ({
    value: `${b.code} - ${b.name}`,
    label: `${b.code} - ${b.name}`,
  }));

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
                    <Controller
                      name="bankName"
                      control={control}
                      rules={{ required: "Selecione um banco" }}
                      render={({ field }) => {
                        let selectedOption = options.find(
                          (opt) => opt.value === field.value
                        );

                        if (!selectedOption && paymentConfig?.bankName) {
                          selectedOption = {
                            value: paymentConfig.bankName,
                            label: paymentConfig.bankName,
                          };
                        }

                        return (
                          <Select
                            {...field}
                            value={selectedOption || null}
                            onMenuOpen={handleLoadBanks}
                            onChange={(selected) =>
                              field.onChange(selected?.value)
                            }
                            onBlur={field.onBlur}
                            options={options}
                            placeholder="Digite ou selecione um banco"
                            classNamePrefix="react-select"
                            classNames={{
                              control: ({ isFocused }) =>
                                [
                                  "w-full rounded-md border py-1",
                                  isFocused
                                    ? "border-blue-500 ring-2 ring-blue-300"
                                    : errors.bankName
                                    ? "border-red-500"
                                    : "border-gray-300",
                                ].join(" "),
                              menu: () =>
                                "bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-50",
                              option: ({ isFocused, isSelected }) =>
                                [
                                  "cursor-pointer px-3 py-2 text-sm",
                                  isSelected
                                    ? "bg-blue-500 text-white"
                                    : isFocused
                                    ? "bg-blue-100 text-blue-800"
                                    : "hover:bg-blue-50",
                                ].join(" "),
                              placeholder: () => "text-gray-400",
                              singleValue: () => "text-gray-800",
                            }}
                          />
                        );
                      }}
                    />
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
