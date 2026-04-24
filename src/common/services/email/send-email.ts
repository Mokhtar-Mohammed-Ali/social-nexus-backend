import nodemailer from "nodemailer";
import { EMAIL_APP_PASS, EMAIL_USER } from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer";
import { BadRequestExpetions } from "../../exptions";

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  attachments,
  html,
}: Mail.Options): Promise<void> => {
  if (!(html as string)?.length && !attachments?.length)
    throw new BadRequestExpetions("html content is required to send email");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASS,
    },
  });

  // Send an email using async/await

  const info = await transporter.sendMail({
    from: `"Social Media App By Mokhtar Mohammed" <${EMAIL_USER}>`,
    to,
    cc,
    bcc,
    subject,
    attachments,
    html,
  });

  console.log("Message sent:", info.messageId);
};
