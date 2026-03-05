const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this to SendGrid, Mailgun, etc.
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: `Labloom App <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML version
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
