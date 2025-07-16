import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en-US/translation.json";
import pt from "@/locales/pt-BR/translation.json";

i18n.use(initReactI18next).init({
  lng: "pt-BR",
  fallbackLng: "pt-BR",
  resources: {
    "pt-BR": { translation: pt },
    "en-US": { translation: en },
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
