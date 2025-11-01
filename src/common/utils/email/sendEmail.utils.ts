import { BadRequestException } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface IEmailOptions extends Mail.Options {
  name: string;
  otp: string | number;
}

export const sendEmail = (data: IEmailOptions) => {
  if (!data.html && !data.text && !data.attachments?.length) {
    throw new BadRequestException('Email body is required');
  }
  const transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  > = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GOOGLE_APP_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
    },
  });

  transporter
    .sendMail({
      ...data,
      from: `"${process.env.APP_NAME}" <${process.env.GOOGLE_APP_EMAIL}>`,
    })
    .then(() => console.log('Message sent to: %s', data.to))
    .catch((error) => {
      console.log('Error sending email to: %s', data.to);
      console.log(error);
    });
};
