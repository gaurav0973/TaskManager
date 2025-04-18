import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Initialize mailgen instance
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanager.app",
    },
  })

  // palin text email if not supported html
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Generate HTML email 
  const emailHtml = mailGenerator.generate(options.mailgenContent);

 //nodemailer transporter => responsible to send a mail
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  })

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email, // receiver's mail
    subject: options.subject, // mail subject
    text: emailTextual, // mailgen content textual variant
    html: emailHtml, // mailgen content html variant
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file",
    )
    console.error("Error: ", error)
  }
};


const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
        body: {
          name: username,
          intro: "Welcome to our app! We're very excited to have you on board.",
          action: {
            instructions:
              "To verify your email please click on the following button:",
            button: {
              color: "#22BC66", 
              text: "Verify your email",
              link: verificationUrl,
            },
          },
          outro:
            "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};


const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset your password",
      action: {
        instructions: "To reset your password click on the following button:",
        button: {
          color: "#22BC66",
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "If you didn't request this password reset, you can safely ignore this email.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};











