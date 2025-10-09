import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { StepsEnum } from "@/utils/enums";

interface Props {
  steps: string[];
  step: StepsEnum;
}

export function ProgressBar({ steps, step }: Props) {
  const { t } = useTranslation();
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
        {steps.map((s, index) => (
          <div
            key={s}
            className={`flex-1 text-center ${
              index === currentStepIndex ? "text-primary font-semibold" : ""
            }`}
          >
            {t(`publicBooking.stepLabels.${s}`)}
          </div>
        ))}
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-green-400 rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
