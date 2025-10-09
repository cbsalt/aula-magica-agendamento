"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormProvider, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import Image from "next/image";
import useSWR from "swr";
import { User } from "lucide-react";

import {
  getTeacherProfile,
  updateTeacherProfile,
} from "@/services/teacherService";
import { InputText, Textarea } from "../Form/";
import { Card, CardContent, Button } from "../ui";

export const ProfileSection = ({ teacherProfile }) => {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: teacher,
    mutate,
    isLoading,
  } = useSWR("/api/teachers/me", getTeacherProfile, {
    fallbackData: teacherProfile,
    revalidateOnMount: false,
  });

  const methods = useForm({
    defaultValues: useMemo(
      () => ({
        name: teacher?.name || "",
        email: teacher?.email || "",
        bio: teacher?.description || "",
        photo: teacher?.photo || "",
      }),
      [teacher]
    ),
  });

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      await updateTeacherProfile({ ...formData });
      toast.success("Informações salvas com sucesso!", {
        position: "top-center",
      });

      await mutate();
    } catch (error) {
      toast.error(error.message || "Erro ao salvar as informações", {
        position: "top-center",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const avatarSrc = teacher?.image || session?.user?.image || null;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Dados do Perfil</h2>
        <div className="space-y-6">
          <FormProvider {...methods}>
            <div className="flex items-center space-x-4 bg-gray-100 px-3 py-2 rounded-lg">
              <div className="relative w-14 h-14">
                {!isLoading && (
                  <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse" />
                )}

                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={teacher?.name || session?.user?.name || "Avatar"}
                    fill
                    sizes="56px"
                    className={`rounded-full object-cover transition-opacity duration-200 ${
                      !isLoading ? "opacity-100" : "opacity-0"
                    }`}
                    priority
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="text-gray-500 w-7 h-7" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-medium">{teacher?.name}</h3>
                <p className="text-gray-600">{teacher?.email}</p>
              </div>
            </div>

            <form onSubmit={methods.handleSubmit(handleSave)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <InputText name="name" label="Nome" />
                <InputText name="email" label="E-mail" disabled />
              </div>

              <Textarea
                name="bio"
                label="Biografia"
                placeholder="Conte um pouco sobre você e sua experiência..."
              />

              <Button type="submit" className="mt-4" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </CardContent>
    </Card>
  );
};
