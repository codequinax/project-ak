const nodemailer = require("nodemailer")

// Reuse the same transporter for all mails
const transporter = nodemailer.createTransport({
    host:   process.env.MAIL_HOST,
    port:   parseInt(process.env.MAIL_PORT) || 587,
    secure: false,   // true for port 465, false for 587
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
})

// ── Welcome email — sent on first ever Google sign-in ─────────────────────────
async function sendWelcomeMail(toEmail, firstName) {
    await transporter.sendMail({
        from:    `"AKTU PYQs" <${process.env.MAIL_USER}>`,
        to:      toEmail,
        subject: `Welcome to AKTU PYQs, ${firstName}! 🎓`,
        html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #0b0f1a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
            <div style="height: 4px; background: linear-gradient(90deg, #6366f1, #38bdf8, #6366f1);"></div>
            <div style="padding: 40px 36px;">
                <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 8px; color: #f1f5f9;">
                    Hey ${firstName}! 👋
                </h1>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                    Welcome to <strong style="color: #818cf8;">AKTU PYQs</strong> — your go-to platform for AKTU previous year questions.
                </p>
                <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
                    <p style="font-size: 13px; color: #64748b; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">What you unlocked</p>
                    <ul style="margin: 0; padding: 0; list-style: none;">
                        <li style="padding: 6px 0; font-size: 14px; color: #cbd5e1;"><span style="color: #818cf8;">✦</span> All unit-wise PYQs with solutions</li>
                        <li style="padding: 6px 0; font-size: 14px; color: #cbd5e1;"><span style="color: #818cf8;">✦</span> Progress tracking per subject & unit</li>
                        <li style="padding: 6px 0; font-size: 14px; color: #cbd5e1;"><span style="color: #818cf8;">✦</span> Synced across all your devices</li>
                    </ul>
                </div>
                <a href="${process.env.CLIENT_URL || "http://localhost:5173"}"
                   style="display: inline-block; background: #6366f1; color: white; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 10px;">
                    Start practicing →
                </a>
                <p style="color: #475569; font-size: 12px; margin-top: 32px;">
                    Good luck with your exams! 🚀<br/>— The AKTU PYQs Team
                </p>
            </div>
        </div>
        `,
    })
}

// ── Report notification — sent to admin when a report is submitted ─────────────
async function sendReportNotification(report) {
    await transporter.sendMail({
        from:    `"AKTU PYQs Reports" <${process.env.MAIL_USER}>`,
        to:      process.env.ADMIN_EMAIL,
        subject: `[Report] ${report.reason} — ${report.subject} / ${report.unit}`,
        html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #0b0f1a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
            <div style="height: 4px; background: linear-gradient(90deg, #ef4444, #f97316);"></div>
            <div style="padding: 32px;">
                <h2 style="font-size: 18px; font-weight: 700; color: #f87171; margin: 0 0 16px;">🚩 New Question Report</h2>
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                    <tr><td style="color: #64748b; padding: 6px 0; width: 120px;">Reason</td>      <td style="color: #f1f5f9; font-weight: 600;">${report.reason}</td></tr>
                    <tr><td style="color: #64748b; padding: 6px 0;">Subject</td>     <td style="color: #f1f5f9;">${report.subject}</td></tr>
                    <tr><td style="color: #64748b; padding: 6px 0;">Unit</td>        <td style="color: #f1f5f9;">${report.unit}</td></tr>
                    <tr><td style="color: #64748b; padding: 6px 0;">Year</td>        <td style="color: #f1f5f9;">${report.year}</td></tr>
                    <tr><td style="color: #64748b; padding: 6px 0;">Question ID</td> <td style="color: #94a3b8; font-size: 11px;">${report.questionId}</td></tr>
                    <tr><td style="color: #64748b; padding: 6px 0;">Reported by</td> <td style="color: #f1f5f9;">${report.reportedBy}</td></tr>
                </table>
                ${report.questionText ? `
                <div style="background: #1e293b; border-radius: 10px; padding: 14px; margin-top: 16px;">
                    <p style="font-size: 11px; color: #64748b; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.05em;">Question</p>
                    <p style="font-size: 13px; color: #cbd5e1; margin: 0; line-height: 1.5;">${report.questionText}</p>
                </div>` : ""}
                ${report.details ? `
                <div style="background: #1e293b; border-radius: 10px; padding: 14px; margin-top: 12px;">
                    <p style="font-size: 11px; color: #64748b; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.05em;">Extra details</p>
                    <p style="font-size: 13px; color: #cbd5e1; margin: 0; line-height: 1.5;">${report.details}</p>
                </div>` : ""}
                <p style="color: #475569; font-size: 12px; margin-top: 24px;">
                    Submitted at ${new Date(report.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
        `,
    })
}

module.exports = { sendWelcomeMail, sendReportNotification }
