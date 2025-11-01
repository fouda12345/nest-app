import EventEmitter from 'node:events';
import { IEmailOptions, sendEmail } from '../utils/email/sendEmail.utils';
import { generateHtml } from '../utils/email/generateHtml.utils';

export const emailEvent = new EventEmitter();

emailEvent.on('confirmEmail', async (data: IEmailOptions) => {
  data.subject = 'Please confirm your email';
  data.html = generateHtml(data);
  sendEmail(data);
});

emailEvent.on('resetPassword', async (data: IEmailOptions) => {
  data.subject = 'Password reset request';
  data.html = generateHtml(data);
  sendEmail(data);
});
