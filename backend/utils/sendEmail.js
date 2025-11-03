import nodemailer from "nodemailer";                      //Node.js library used to send emails

export async function sendEMail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
    /*Configuring host, port and secure for connecting to the smtp services. (Skipping since service: "gmail" autoconfigures it)
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",   //Boolean check with strings
    */
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    //Define the email options:
    const mailOptions = {
      from: `"Keepr Weight Tracker" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);             //Send the email
    console.log(`Email sent to ${to}`);
  }
  catch (err) {
    console.error("Error sending mail: ", err);
    throw new Error("Failed to send email");
  }
}