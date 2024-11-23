const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email provider
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

// Function to send emails
exports.sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.BASE_URL}/api/users/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verify Your Email Address",
    html: `<p>Click the link below to verify your email:</p>
           <a href="${verificationLink}">${verificationLink}</a>`,
  };

  await transporter.sendMail(mailOptions);
};
