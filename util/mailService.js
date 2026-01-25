const nodemailer = require("nodemailer");

const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

const emailLayout = (otp, subject) => {
    const isReset = subject === "Password Reset Request";

    const heading = isReset ? "Reset Your Password" : "Welcome to MyStore";
    const message = isReset 
        ? "We received a request to reset your password. Use the code below to complete the process. If you did not request this, please ignore this email." 
        : "Thank you for joining MyStore! We are excited to have you. Please use the code below to verify your email address.";

    const colorPrimary = "#6A1B1A"; 
    const colorBackground = "#f4f4f4";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: ${colorBackground}; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background-color: ${colorPrimary}; padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
            .otp-box { background-color: #f8f9fa; border: 2px dashed ${colorPrimary}; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: ${colorPrimary}; margin: 0; }
            .footer { background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #888888; }
            .footer p { margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${heading}</h1>
            </div>

            <div class="content">
                <p>Hello,</p>
                <p>${message}</p>
                
                <div class="otp-box">
                    <p style="margin-bottom: 10px; font-size: 14px; color: #666; text-transform: uppercase;">Your Verification Code</p>
                    <p class="otp-code">${otp}</p>
                </div>

                <p>This code will expire in 5 minutes.</p>
                <p>Best Regards,<br>The MyStore Team</p>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} MyStore. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>`;
}

const sendEmail = async(email, otp, subject = "Email Verification") => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: {
            name: "MyStore App", // Custom Sender Name
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: subject,
        html: emailLayout(otp, subject),
    };

    try {
        const emailSend = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
        return { success: true, messageId: emailSend.messageId };
    } catch(e) {
        console.log("Error while sending email", e);
        throw new Error("Email sending failed");
    }
}

module.exports = sendEmail;