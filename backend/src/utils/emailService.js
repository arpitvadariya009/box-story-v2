const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER || 'urmilanandvana@gmail.com';
  const pass = (process.env.SMTP_PASS || 'aruvaorcpfcubusw').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send an invitation / welcome email with generated credentials to a newly invited user
 *
 * @param {Object} options
 * @param {string} options.name - User's full name
 * @param {string} options.email - User's email address
 * @param {string} options.password - Generated temporary password
 * @param {string} options.role - Assigned role in the system
 * @param {string} [options.loginUrl] - Direct URL to login page
 * @returns {Promise<Object>}
 */
const sendUserInvitationEmail = async ({ name, email, password, role, loginUrl }) => {
  try {
    const transporter = createTransporter();
    const portalUrl = loginUrl || process.env.CLIENT_URL || 'http://localhost:5173';
    const fromAddress = `"${process.env.FROM_NAME || 'Box Stories'}" <${process.env.FROM_EMAIL || 'urmilanandvana@gmail.com'}>`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Box Stories</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 20px;
      color: #1e293b;
    }
    .email-container {
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .email-header {
      background: linear-gradient(135deg, #D90B37 0%, #881337 100%);
      padding: 32px 30px;
      text-align: center;
      color: #ffffff;
    }
    .email-header h1 {
      margin: 0 0 6px 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .email-header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .email-body {
      padding: 32px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #0f172a;
    }
    .intro-text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .credentials-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #D90B37;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 28px;
    }
    .cred-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .cred-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .cred-row:first-child {
      padding-top: 0;
    }
    .cred-label {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cred-value {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }
    .password-badge {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .role-badge {
      background: #f1f5f9;
      color: #334155;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0 20px 0;
    }
    .cta-button {
      display: inline-block;
      background: #D90B37;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 34px;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(217, 11, 55, 0.35);
      transition: background 0.2s ease;
    }
    .security-note {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12.5px;
      color: #92400e;
      line-height: 1.5;
      margin-top: 24px;
    }
    .email-footer {
      background: #f8fafc;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
    .email-footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Box Stories</h1>
      <p>B2B Corporate Gifting & Operations Portal</p>
    </div>
    
    <div class="email-body">
      <div class="greeting">Welcome aboard, ${name}! 👋</div>
      <p class="intro-text">
        You have been invited to access the <strong>Box Stories</strong> portal. An account has been created for you with the details below. You can now log in to your dashboard to manage and collaborate on corporate gifting operations.
      </p>

      <div class="credentials-card">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr style="border-bottom: 1px dashed #e2e8f0;">
            <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">EMAIL ADDRESS</td>
            <td style="padding: 10px 0; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">${email}</td>
          </tr>
          <tr style="border-bottom: 1px dashed #e2e8f0;">
            <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">TEMPORARY PASSWORD</td>
            <td style="padding: 10px 0; text-align: right;">
              <span class="password-badge">${password}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">ASSIGNED ROLE</td>
            <td style="padding: 10px 0; text-align: right;">
              <span class="role-badge">${role}</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="cta-container">
        <a href="${portalUrl}" class="cta-button" target="_blank">Login to Dashboard</a>
      </div>

      <div class="security-note">
        🔒 <strong>Security Tip:</strong> Please log in using these temporary credentials and change your password in your profile settings after your first sign-in.
      </div>
    </div>

    <div class="email-footer">
      <p>This is an automated invitation from Box Stories. Please do not reply directly to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Box Stories. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: `Welcome to Box Stories – Your Account Login Credentials`,
      text: `Hello ${name},\n\nYou have been invited to Box Stories portal as a ${role}.\n\nYour Login Credentials:\nEmail: ${email}\nPassword: ${password}\nLogin URL: ${portalUrl}\n\nPlease change your password after your first login.\n\nRegards,\nBox Stories Team`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Invitation email sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a password reset OTP email
 *
 * @param {Object} options
 * @param {string} options.name - User's full name
 * @param {string} options.email - User's email address
 * @param {string} options.otp - 6-digit numeric OTP
 * @returns {Promise<Object>}
 */
const sendPasswordResetOtpEmail = async ({ name, email, otp }) => {
  try {
    const transporter = createTransporter();
    const fromAddress = `"${process.env.FROM_NAME || 'Box Stories'}" <${process.env.FROM_EMAIL || 'urmilanandvana@gmail.com'}>`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP - Box Stories</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 20px;
      color: #1e293b;
    }
    .email-container {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }
    .email-header {
      background: linear-gradient(135deg, #D90B37 0%, #881337 100%);
      padding: 28px 24px;
      text-align: center;
      color: #ffffff;
    }
    .email-header h1 {
      margin: 0 0 4px 0;
      font-size: 22px;
      font-weight: 700;
    }
    .email-header p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .email-body {
      padding: 30px 28px;
      text-align: center;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #0f172a;
    }
    .intro-text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .otp-box {
      background-color: #f8fafc;
      border: 2px dashed #f87171;
      border-radius: 12px;
      padding: 18px 24px;
      display: inline-block;
      margin: 10px 0 24px 0;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 32px;
      font-weight: 800;
      color: #CE1C2B;
      letter-spacing: 6px;
      margin: 0;
    }
    .expiry-note {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .security-note {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12.5px;
      color: #92400e;
      line-height: 1.5;
      text-align: left;
    }
    .email-footer {
      background: #f8fafc;
      padding: 18px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Box Stories</h1>
      <p>Password Reset Verification</p>
    </div>
    
    <div class="email-body">
      <div class="greeting">Hello ${name || 'User'}!</div>
      <p class="intro-text">
        We received a request to reset your password. Use the verification OTP code below to set a new password:
      </p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
      </div>

      <p class="expiry-note">⏱️ This OTP is valid for <strong>10 minutes</strong>.</p>

      <div class="security-note">
        🔒 <strong>Security Warning:</strong> Never share this OTP with anyone. If you didn't request a password reset, you can safely ignore this email.
      </div>
    </div>

    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} Box Stories. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: `Your Password Reset OTP: ${otp} – Box Stories`,
      text: `Hello ${name || 'User'},\n\nYour OTP to reset your password is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBox Stories Team`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Password Reset OTP sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send OTP to ${email}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createTransporter,
  sendUserInvitationEmail,
  sendPasswordResetOtpEmail,
};

