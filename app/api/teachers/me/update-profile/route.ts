import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateDataTeacher } from "@/modules/teacher";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { name, bio } = await request.json();

  try {
    const updatedTeacher = await updateDataTeacher(session.user.email, {
      name,
      description: bio,
    });

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
