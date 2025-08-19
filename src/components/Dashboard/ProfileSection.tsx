"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { InputText } from "../Form/InputText";
import { Textarea } from "../Form/Textarea";
import { Dropdown } from "../Form/Dropdown";

export const ProfileSection = () => {
  const { data: session } = useSession();
  const methods = useForm({
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      price: "",
      currency: "BRL",
    },
  });

  useEffect(() => {
    if (session?.user) {
      methods.reset({
        name: session.user.name,
        email: session.user.email,
      });
    }
  }, [session, methods]);

  const handleSave = (formData) => {
    console.log("Saving profile:", formData);
  };

  const loadingProfile = session?.user?.name;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Dados do Perfil</h2>
        <div className="space-y-6">
          <FormProvider {...methods}>
            <div className="flex items-center space-x-4 bg-gray-100 px-3 py-2 rounded-lg">
              {loadingProfile ? (
                <div className="px-3 py-2 rounded-lg w-full flex flex-row align-items-center justify-content-center gap-4">
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{session.user.name}</h3>
                    <p className="text-gray-600">{session.user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-lg w-full flex flex-row align-items-center justify-content-center gap-4">
                  <div className="h-14 w-14 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex flex-col gap-[0.5] w-full justify-center">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={methods.handleSubmit(handleSave)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <InputText name="name" label="Nome" />
                <InputText name="email" label="E-mail" />
              </div>

              <Textarea
                name="bio"
                label="Biografia"
                placeholder="Conte um pouco sobre você e sua experiência..."
              />

              <Button type="submit" className="mt-4">
                Salvar Alterações
              </Button>
            </form>
          </FormProvider>
        </div>
      </CardContent>
    </Card>
  );
};
