import nodemailer from "nodemailer"
import "dotenv/config"

// async..await is not allowed in global scope, must use a wrapper
export const sendMail = async (receiver, subject, content) => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASS, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Roast Testing 👻" <roast.testing@gmail.com>', // sender address
    to: `${receiver}, tdorobantu95@gmail.com`, // list of receivers
    subject: subject, // Subject line
    html: `<p>${content}</p>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
}
