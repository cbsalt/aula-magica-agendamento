import { handleFormatDate } from "@/utils";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";

export const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

export async function sendConfirmationEmail(
  toEmail: string,
  studentName: string,
  date: string,
  meetLink: string | null
) {
  const sender = new Sender(
    "no-reply@scheduleasier.com",
    "scheduleasier - agendamento de aulas"
  );
  const recipient = new Recipient(toEmail, studentName);

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

  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo([recipient])
    .setSubject("Confirmação de pagamento e agendamento da aula")
    .setHtml(html)
    .setText(text);

  await mailerSend.email.send(emailParams);
}

export async function sendBatchConfirmationEmail(
  toEmail: string,
  studentName: string,
  bookings: Array<{ date: string; time: string; meetingLink: string | null }>,
  totalAmount: number,
  currency: string
) {
  const sender = new Sender(
    "no-reply@scheduleasier.com",
    "scheduleasier - agendamento de aulas"
  );
  const recipient = new Recipient(toEmail, studentName);

  const bookingsHtml = bookings
    .map((booking, index) => {
      const formattedDate = handleFormatDate(booking);

      return `
      <div style="border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px; margin-bottom: 12px;">
        <h3 style="margin: 0 0 8px 0; color: #1a73e8;">Aula ${index + 1}</h3>
        <p style="margin: 0; font-size: 16px; background-color: #f1f6ff; padding: 8px; border-radius: 4px; text-align: center;">
          <strong>${formattedDate}</strong>
        </p>
        ${
          booking.meetingLink
            ? `<p style="margin: 8px 0 0 0;">Link: <a href="${booking.meetingLink}" style="color:#1a73e8; text-decoration:none;">${booking.meetingLink}</a></p>`
            : ""
        }
      </div>
    `;
    })
    .join("");

  const html = `
  <div style="font-family: Arial, sans-serif; color:#333; line-height:1.6; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:6px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.05);">
      <div style="background-color:#1a73e8; padding:16px 24px;">
        <h1 style="color:#ffffff; font-size:20px; margin:0;">Confirmação de Aulas</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin-top:0;">Olá <strong>${studentName}</strong>,</p>
        <p>Seu pagamento foi <strong>confirmado</strong> e suas aulas estão agendadas:</p>
        
        <div style="margin: 20px 0;">
          ${bookingsHtml}
        </div>

        <div style="background-color:#f8f9fa; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px 0; color: #1a73e8;">Resumo do Pagamento</h3>
          <p style="margin: 0; font-size: 18px; font-weight: bold;">
            Total: ${totalAmount.toFixed(2)} ${currency.toUpperCase()}
          </p>
          <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">
            ${bookings.length} ${
    bookings.length === 1 ? "aula" : "aulas"
  } agendadas
          </p>
        </div>

        <p>Obrigado por escolher nossos serviços!<br/>Desejamos ótimas aulas.</p>
      </div>
      <div style="background-color:#f5f5f5; padding:16px; font-size:12px; color:#777; text-align:center;">
        Este é um e-mail automático, por favor não responda.
      </div>
    </div>
  </div>
  `;

  const bookingsText = bookings
    .map((booking, index) => {
      const formattedDate = handleFormatDate(booking);

      return `Aula ${index + 1}: ${formattedDate}${
        booking.meetingLink ? `\nLink: ${booking.meetingLink}` : ""
      }`;
    })
    .join("\n\n");

  const text = `
Olá ${studentName},

Seu pagamento foi confirmado e suas aulas estão agendadas:

${bookingsText}

Resumo do Pagamento:
Total: ${totalAmount.toFixed(2)} ${currency}
${bookings.length} ${bookings.length === 1 ? "aula" : "aulas"} agendadas

Obrigado por escolher nossos serviços!
---
Este é um e-mail automático, por favor não responda.
  `;

  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo([recipient])
    .setSubject(
      `Confirmação de pagamento e agendamento de ${bookings.length} ${
        bookings.length === 1 ? "aula" : "aulas"
      }`
    )
    .setHtml(html)
    .setText(text);

  await mailerSend.email.send(emailParams);
}
