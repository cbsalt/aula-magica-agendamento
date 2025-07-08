import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const storedState = sessionStorage.getItem("oauth_state");

      if (!code || state !== storedState) {
        alert("Erro de autenticação com Google");
        return;
      }

      try {
        const tokenResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              code,
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
              redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
              grant_type: "authorization_code",
            }),
          }
        );

        const tokenData = await tokenResponse.json();

        if (tokenData.access_token) {
          localStorage.setItem("google_access_token", tokenData.access_token);

          const userInfoRes = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
              },
            }
          );

          const user = await userInfoRes.json();

          localStorage.setItem("user", JSON.stringify(user));

          navigate("/dashboard");
        } else {
          console.error("Token inválido:", tokenData);
        }
      } catch (err) {
        console.error("Erro ao trocar código por token:", err);
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
