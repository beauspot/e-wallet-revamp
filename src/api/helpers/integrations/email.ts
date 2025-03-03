// import { Resend } from "resend";
// import { baseTemplate } from '@/templates/baseTemplate';
import { EmailJobData } from "@/interfaces/email.interface";
import { forgotPassword } from "@/templates/forgotPassword";
import { forgotTransactionPin } from "@/templates/forgotTransactionPin";
import { resetPassword } from "@/templates/resetPassword";
import { resetTransactionPin } from "@/templates/resetTransactionPin";
import { welcomeEmail } from "@/templates/welcomeEmail";

// this throws as error.
// const resend = new Resend(process.env.RESEND_API_KEY!)

const TEMPLATES = {
  resetPassword: {
    subject: "Password Reset Successful",
    from: "WalletHub Customer Support <donotreply@wallethub.com>",
    template: resetPassword
  },
  forgotPassword: {
    subject: "Reset Your Password",
    from: "WalletHub Customer Support <donotreply@wallethub.com>",
    template: forgotPassword
  },
  welcomeEmail: {
    subject: "Welcome to WalletHub",
    from: "WalletHub Customer Support <donotreply@wallethub.com>",
    template: welcomeEmail
  },
  forgotTransactionPin: {
    subject: "Forgot TransactionPin",
    from: "WalletHub Customer Support <donotreply@wallet.com>",
    template: forgotTransactionPin
  },
  resettransactionPin: {
    subject: "Transaction Pin Reset Successfully",
    from: "WalletHub Customer Support <donotreply@wallethub.com>",
    template: resetTransactionPin
  }
};

const sendEmail = async (job: EmailJobData) => {
  const { data, type } = job as EmailJobData;
  const options = TEMPLATES[type];

  log.info("job send email", job);
  log.info("options", options);
  try {
    // const dispatch = await resend.emails.send({
    //     from: options.from,
    //     to: data.to,
    //     subject: options.subject,
    //     html: options.template(data),
    // });

    log.info(`Resend api successfully delivered ${type} email to ${data.to}`);
    // return dispatch;
  } catch (error) {
    log.error(`Resend api failed to deliver ${type} email to ${data.to}` + error);
  }
};

export default {
  TEMPLATES,
  sendEmail
};
