import { prisma } from "@/lib/prisma";
import { PaymentConfig, Teacher, TeacherWorkSchedule } from "@prisma/client";

type TeacherWithInclude = Teacher & {
  paymentConfig?: PaymentConfig;
  teacherWorkSchedules?: TeacherWorkSchedule[];
};

export function findTeacherByEmail(
  value,
  include = {}
): Promise<TeacherWithInclude> {
  return prisma.teacher.findUnique({
    where: { email: value },
    include,
  });
}

export function findTeacherById(
  value,
  include = {}
): Promise<TeacherWithInclude> {
  return prisma.teacher.findUnique({
    where: { id: value },
    include,
  });
}

export function findTeacherByPublicLink(
  value,
  include = {}
): Promise<TeacherWithInclude> {
  return prisma.teacher.findUnique({
    where: { publicLinkId: value },
    include,
  });
}

export function removeOldSchedule(teacherId) {
  return prisma.teacherWorkSchedule.deleteMany({
    where: { teacherId },
  });
}

export function createSchedule(teacherId, disponibility) {
  return prisma.teacherWorkSchedule.createMany({
    data: disponibility.map((item) => ({
      teacherId,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
    })),
  });
}

export function updateDataTeacher(email, data, include = {}) {
  return prisma.teacher.update({
    where: { email },
    data,
    include,
  });
}

export function updateDataTeacherById(id, data, include = {}) {
  return prisma.teacher.update({
    where: { id },
    data,
    include,
  });
}
