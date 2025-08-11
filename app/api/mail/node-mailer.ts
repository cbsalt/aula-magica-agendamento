import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST, // ex: "smtp.mailtrap.io"
  port: Number(process.env.MAILTRAP_PORT), // ex: 2525
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendTestEmail(
  toEmail: string,
  studentName: string,
  date: string,
  meetLink: string | null
) {
  const html = `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:6px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05);">
      <div style="background-color:#1a73e8; padding:16px 24px;">
        <h1 style="color:#ffffff; font-size:20px; margin:0;">Confirmação de Aula</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin-top:0;">Olá <strong>${studentName}</strong>,</p>
        <p>Seu pagamento foi <strong>confirmado</strong> e sua aula está agendada para:</p>
        <p style="font-size:16px; background-color:#f1f6ff; padding:12px; border-radius:4px; text-align:center;">
          <strong>${date}</strong>
        </p>
        ${
          meetLink
            ? `<p>Link para a reunião: <a href="${meetLink}" style="color:#1a73e8; text-decoration:none;">${meetLink}</a></p>`
            : ""
        }
        <p>Obrigado por escolher nossos serviços!<br/>Desejamos uma ótima aula.</p>
      </div>
      <div style="background-color:#f5f5f5; padding:16px; font-size:12px; color:#777; text-align:center;">
        Este é um e-mail automático, por favor não responda.
      </div>
    </div>
  </div>
  `;

  const text = `
Olá ${studentName},

Seu pagamento foi confirmado e sua aula está agendada para ${date}.
${meetLink ? `Link para a reunião: ${meetLink}` : ""}

Obrigado por escolher nossos serviços!
---
Este é um e-mail automático, por favor não responda.
  `;

  const mailOptions = {
    from: '"Sua Plataforma" <no-reply@seusite.com>',
    to: toEmail,
    subject: "Confirmação de pagamento e agendamento da aula",
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email enviado: %s", info.messageId);
}
