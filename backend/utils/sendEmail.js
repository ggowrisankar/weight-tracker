import nodemailer from "nodemailer";                      //Node.js library used to send emails
import fetch from "node-fetch"; 

export async function sendEMail(to, subject, html) {
  try {
    /* [Skipping since backend can’t connect directly to Gmail’s SMTP server from Render]
    const transporter = nodemailer.createTransport({
    //Configuring host, port and secure for connecting to the smtp services. (Skipping since service: "gmail" autoconfigures it)
      //host: process.env.SMTP_HOST,
      //port: process.env.SMTP_PORT,
      //secure: process.env.SMTP_SECURE === "true",   //Boolean check with strings
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
    */
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "Keepr Weight Tracker", email: process.env.SMTP_USER },
        to: [{ email: to }],
        subject,
        htmlContent: html
      })
    });

    if(!response.ok) {
      const errorText = await response.text();
      throw new Error(`Email send failed: ${errorText}`);
    }

    console.log(`Email sent to ${to}`);
  }
  catch (err) {
    console.error("Error sending mail: ", err);
    throw new Error("Failed to send email");
  }
}