import { useTranslation } from "react-i18next";
import { SerializedTeacher } from "../interfaces";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface Props {
  teacher: SerializedTeacher;
  isRescheduleMode: boolean;
}

export function Header({ teacher, isRescheduleMode }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="mb-8 shadow-lg border border-gray-200">
      <CardHeader>
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 ring-2 ring-primary ring-offset-2">
            <AvatarImage src={teacher.photo} alt={teacher.name} />
            <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col justify-center">
            <CardTitle className="text-xl font-semibold text-gray-800">
              {teacher.name}
            </CardTitle>

            <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
              {teacher.description}
            </p>

            {!isRescheduleMode && (
              <div className="mt-2 inline-flex items-center text-sm font-medium text-green-600">
                <div className="text-gray-600 mr-1">
                  {t(`publicBooking.price`)}:
                </div>
                {teacher.price.toFixed(2)} {teacher.currency}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
