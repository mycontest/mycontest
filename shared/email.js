const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const { dbQueryMany } = require("./mysql");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to, subject, template_name, data) {
  try {
    const template_path = path.join(__dirname, `../views/emails/${template_name}.ejs`);

    // Render EJS template
    const html_content = await ejs.renderFile(template_path, data);

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"MyContest" <noreply@mycontest.uz>',
      to: to,
      subject: subject,
      html: html_content,
    });

    console.log("Email sent: %s", info.messageId);

    // Log to DB
    await dbQueryMany("INSERT INTO email_logs (recipient_email, template_name, status) VALUES (?, ?, ?)", [to, template_name, "sent"]);

    return true;
  } catch (error) {
    console.error("Email sending failed:", error);

    // Log error to DB
    await dbQueryMany("INSERT INTO email_logs (recipient_email, template_name, status, error_message) VALUES (?, ?, ?, ?)", [to, template_name, "failed", error.message]);

    return false;
  }
}

async function sendBulkEmails(recipients, subject, template_name, common_data, custom_data_fn = null) {
  let sent = 0;
  let failed = 0;

  for (const email of recipients) {
    const data = custom_data_fn ? { ...common_data, ...custom_data_fn(email) } : common_data;
    const success = await sendEmail(email, subject, template_name, data);
    if (success) sent++;
    else failed++;

    // Small delay to avoid overwhelming SMTP server
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { sent, failed };
}

async function sendVerificationEmail(user, verification_token) {
  const verification_link = `http://${process.env.DOMAIN}/verify?token=${verification_token}`;
  return await sendEmail(user.email, "Email Verification - MyContest", "verification", {
    full_name: user.full_name,
    verification_link: verification_link,
  });
}

async function sendContestNotification(users, contest) {
  const emails = users.map((u) => u.email).filter((e) => e);
  const contest_link = `http://${process.env.DOMAIN}/contest/${contest.contest_id}`;

  return await sendBulkEmails(
    emails,
    `New Contest: ${contest.name}`,
    "notification",
    {
      contest_name: contest.name,
      start_date: new Date(contest.start_date).toLocaleString(),
      end_date: new Date(contest.end_date).toLocaleString(),
      contest_description: contest.content || "No description available",
      contest_link: contest_link,
    },
    (email) => {
      const user = users.find((u) => u.email === email);
      return { full_name: user?.full_name || "User" };
    }
  );
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendVerificationEmail,
  sendContestNotification,
};
