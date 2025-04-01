import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload) {
  const { to, subject, html } = payload;
  const from = 'onboarding@resend.dev'; // Always use the default Resend testing email

  try {
    console.log('Attempting to send email with payload:', { to, subject, from });
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    console.log('Resend API response:', data);

    if (!data) {
      throw new Error('No response from Resend API');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Detailed error in sendEmail:', error);
    return { success: false, error };
  }
}  