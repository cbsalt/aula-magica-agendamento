import { notFound } from "next/navigation";

import { PublicBookingPage } from "@/components";
import {
  findTeacherByPublicLink,
  findWorkScheduleByTeacherId,
  serializeTeacher,
} from "@/modules/teacher";

export default async function AppointmentPage(props) {
  const params = await props.params;
  const { id } = params;

  const teacher = await findTeacherByPublicLink(id, {
    paymentConfig: true,
  });

  const serializedTeacher = serializeTeacher(teacher);
  const workScheduleTeacher = await findWorkScheduleByTeacherId(teacher.id, {
    dayOfWeek: true,
  });

  if (!serializedTeacher) {
    notFound();
  }

  return (
    <PublicBookingPage
      teacher={serializedTeacher}
      workScheduleTeacher={workScheduleTeacher}
    />
  );
}
