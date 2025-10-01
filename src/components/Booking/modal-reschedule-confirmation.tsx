import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";

import { useTranslation } from "react-i18next";

interface Props {
  isLoading: boolean;
  shouldReplaceSlot: boolean;
  setIsRescheduleModalOpen: Dispatch<SetStateAction<boolean>>;
  onHandleReplaceSlot: () => void;
  onConfirm: () => Promise<void>;
}

export function ModalRescheduleConfirmation({
  isLoading,
  shouldReplaceSlot,
  setIsRescheduleModalOpen,
  onHandleReplaceSlot,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {t("publicBooking.reschedule.modalTitle")}
        </h2>
        <p className="mb-6">{t("publicBooking.reschedule.modalMessage")}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsRescheduleModalOpen(false)}
          >
            {t("publicBooking.reschedule.cancelButton")}
          </Button>
          <Button
            disabled={isLoading}
            onClick={async () => {
              setIsRescheduleModalOpen(false);

              if (shouldReplaceSlot) {
                onHandleReplaceSlot?.();
                return;
              }

              if (onConfirm) {
                await onConfirm();
              }
            }}
          >
            {t("publicBooking.reschedule.confirmButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
