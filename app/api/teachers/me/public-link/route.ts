import { z } from "zod";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { findTeacherByEmail, updateDataTeacherById } from "@/modules/teacher";

const generateLinkSchema = z.object({
  price: z.number().positive(),
  currency: z.string().default("BRL"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const teacher = await findTeacherByEmail(session.user.email, {
      paymentConfig: true,
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { price, currency } = generateLinkSchema.parse(body);
    const publicLinkId = randomUUID();

    // Update teacher with new price and enable public link
    const data = {
      price,
      currency,
      hasPublicLink: true,
      publicLinkId,
    };

    const updatedTeacher = await updateDataTeacherById(teacher.id, data, {
      paymentConfig: true,
    });

    const publicUrl = `${process.env.NEXTAUTH_URL}/appointment/${publicLinkId}`;

    return NextResponse.json({
      success: true,
      publicUrl,
      teacher: {
        id: updatedTeacher.id,
        name: updatedTeacher.name,
        price: updatedTeacher.price,
        currency: updatedTeacher.currency,
        hasPublicLink: updatedTeacher.hasPublicLink,
        publicLink: updatedTeacher.publicLinkId,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar link público:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const teacher = await findTeacherByEmail(session.user.email, {
      paymentConfig: true,
    });

    if (!teacher || !teacher.hasPublicLink) {
      return NextResponse.json(
        { error: "Link público não encontrado" },
        { status: 404 }
      );
    }

    const publicUrl = `${process.env.NEXTAUTH_URL}/appointment/${teacher.publicLinkId}`;

    return NextResponse.json({
      success: true,
      publicUrl,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        price: teacher.price,
        currency: teacher.currency,
        hasPublicLink: teacher.hasPublicLink,
        publicLink: teacher.publicLinkId,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar link público:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
