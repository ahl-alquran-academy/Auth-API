const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "elmourchiditest@gmail.com",
    pass: "12345678Hr@#$",
  },
});

function sendMail(email, subject, code) {
  let mailOptions = {
    from: "elmourchiditest@gmail.com",
    to: email,
    subject: subject,
    text: `${code}`,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, data) => {
      if (error) reject("cannot send Mail");
    });
    resolve("Mail Sent");
  });
}

module.exports = sendMail;
