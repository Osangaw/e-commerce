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

const emailLayout = (otp) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello,</h1>
    <p>Welcome to my app.</p>
    <p>Thank you for signing up!</p>
    <p>Your verification code is: ${otp}</p>   
</body>
</html>`;
}

const sendEmail = async(email,otp)=>{
    const transporter = createTransporter();
    const mailOptions = {
        from: {name:"e-commerce App",
        address: process.env.EMAIL_USER},
        to: email,
        subject: "Email Verification",
        html: emailLayout(otp),
    };
    try{
        const emailSend = await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully");
        return{ success: true, messageId: emailSend.messageId };
    }catch(e){
        console.log("Error while sending email", e);
    }
}

module.exports = sendEmail;