import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findTeacherByEmail } from "@/modules/teacher";

const paymentConfigSchema = z.object({
  receiveViaStripe: z.boolean(),
  stripeAccountId: z.string().optional(),
  receiveViaPayPal: z.boolean(),
  paypalEmail: z.string().email().optional(),
  isActive: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const configData = paymentConfigSchema.parse(body);

    // Validate configuration
    if (!configData.receiveViaStripe && !configData.receiveViaPayPal) {
      return NextResponse.json(
        { error: "Selecione pelo menos uma forma de recebimento" },
        { status: 400 }
      );
    }

    if (configData.receiveViaStripe && !configData.stripeAccountId) {
      return NextResponse.json(
        { error: "Stripe Account ID é obrigatório" },
        { status: 400 }
      );
    }

    if (configData.receiveViaPayPal && !configData.paypalEmail) {
      return NextResponse.json(
        { error: "E-mail do PayPal é obrigatório" },
        { status: 400 }
      );
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

    // Update or create payment config
    const updatedConfig = await prisma.paymentConfig.upsert({
      where: { teacherId: teacher.id },
      update: {
        receiveViaStripe: configData.receiveViaStripe,
        stripeAccountId: configData.stripeAccountId || null,
        receiveViaPayPal: configData.receiveViaPayPal,
        paypalEmail: configData.paypalEmail || null,
        isActive: configData.isActive,
      },
      create: {
        teacherId: teacher.id,
        receiveViaStripe: configData.receiveViaStripe,
        stripeAccountId: configData.stripeAccountId || null,
        receiveViaPayPal: configData.receiveViaPayPal,
        paypalEmail: configData.paypalEmail || null,
        isActive: configData.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      config: updatedConfig,
    });
  } catch (error) {
    console.error("Erro ao salvar configuração de pagamento:", error);
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

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      config: teacher.paymentConfig,
    });
  } catch (error) {
    console.error("Erro ao buscar configuração de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
