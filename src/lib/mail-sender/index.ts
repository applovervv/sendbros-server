import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export class MailSender {
    private transporter: Mail;

    constructor(service: string | undefined = "Gmail", user:string, pass:string) {
        this.transporter = nodemailer.createTransport({
            service: service,
            auth: {
                user,
                pass
            }
      });
    };

    async sendMail(mailOptions: Mail.Options) {
        this.transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log(info);
            }
        });
    }
}

export const mailSender = new MailSender("Gmail", process.env.EMAIL_ACCOUNT_EMAIL!, process.env.EMAIL_ACCOUNT_PASSWORD!);


export const sendEmailVerificationMail = async (email: string, token: string, callback: ( error: Error | null) => void): Promise<void> => {
    try{

    const mailOptions = {
        to: email,
        subject: "이메일 확인",
        html: `이메일을 확인하려면 <a href="${process.env.ENDPOINT_URL}/api/v1/auth/email/verify/${token}">여기</a>를 클릭하세요.`,
      };

     await mailSender.sendMail(mailOptions);

     callback(null);
    } catch (error) {
     callback(error as Error);
    }
}

export const sendPasswordResetMail = async (email: string, token: string, callback: ( error: Error | null) => void): Promise<void> => {
    try{
      const mailOptions = {
        to: email,
        subject: "비밀번호 재설정",
        html: `비밀번호를 재설정하려면 <a href="${process.env.ENDPOINT_URL}/reset-password/${token}">여기</a>를 클릭하세요.`,
        };

        await mailSender.sendMail(mailOptions);

        callback(null);
    } catch (error) {
        callback(error as Error);
    }
}
