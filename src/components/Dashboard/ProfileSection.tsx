"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export const ProfileSection = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "",
    price: "",
    currency: "BRL",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = () => {
    // Save profile data
    console.log("Saving profile:", formData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Dados do Perfil</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ""}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div>
              <h3 className="text-lg font-medium">{session?.user?.name}</h3>
              <p className="text-gray-600">{session?.user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Biografia
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Conte um pouco sobre você e sua experiência..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço por aula
              </label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Moeda
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BRL">BRL - Real</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>

          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
};
