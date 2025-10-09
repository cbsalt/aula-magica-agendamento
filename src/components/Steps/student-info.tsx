import { useForm } from "react-hook-form";
import z from "zod";
import { t } from "i18next";
import { User } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
} from "@/components/ui";

interface StudentInfoStepProps {
  onSubmit: (data: StudentInfoFormData) => void;
}

const formSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export type StudentInfoFormData = z.infer<typeof formSchema>;

export function StudentInfoStep({ onSubmit }: StudentInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<StudentInfoFormData>({
    mode: "onChange",
  });

  return (
    <Card className="rounded-lg border border-gray-200 w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
          <User className="mr-2 h-5 w-5 text-primary" />
          {t("publicBooking.yourData")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-gray-700">
              {t("publicBooking.name")}
            </Label>
            <Input
              id="name"
              {...register("name", {
                required: t("publicBooking.errors.name"),
              })}
              placeholder={t("publicBooking.namePlaceholder")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-700">
              {t("publicBooking.email")}
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: t("publicBooking.errors.email.isRequired"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("publicBooking.errors.email.validEmail"),
                },
              })}
              placeholder={t("publicBooking.emailPlaceholder")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={!isValid}>
            {t("publicBooking.continueToPayment")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
