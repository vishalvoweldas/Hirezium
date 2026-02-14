import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
})

const from = process.env.EMAIL_FROM || '"Hirezium" <noreply@hirezium.com>'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendApplicationReceivedEmail(to: string, name: string, jobTitle: string, companyName: string) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #124A59;">Application Received!</h2>
            <p>Hi ${name},</p>
            <p>Thanks for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> through Hirezium.</p>
            <p>The recruitment team has received your application and will review it soon. You can track your application status on your dashboard.</p>
            <a href="${appUrl}/dashboard/candidate" style="display: inline-block; padding: 10px 20px; background-color: #124A59; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
            <p style="margin-top: 20px; font-size: 0.8em; color: #666;">Best regards,<br>The Hirezium Team</p>
        </div>
    `

    return transporter.sendMail({
        from,
        to,
        subject: `Application Received: ${jobTitle} at ${companyName}`,
        html,
    })
}

export async function sendStageProgressionEmail(to: string, name: string, jobTitle: string, currentStage: number, totalStages: number) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #124A59;">Great News! You've moved to the next stage</h2>
            <p>Hi ${name},</p>
            <p>We're excited to inform you that you've progressed to <strong>Stage ${currentStage}</strong> for the <strong>${jobTitle}</strong> position.</p>
            <p>There are ${totalStages} stages in total. Good luck with the next step!</p>
            <a href="${appUrl}/dashboard/candidate" style="display: inline-block; padding: 10px 20px; background-color: #124A59; color: white; text-decoration: none; border-radius: 5px;">Track Progress</a>
            <p style="margin-top: 20px; font-size: 0.8em; color: #666;">Best regards,<br>The Hirezium Team</p>
        </div>
    `

    return transporter.sendMail({
        from,
        to,
        subject: `Stage Update: ${jobTitle}`,
        html,
    })
}

export async function sendRejectionEmail(to: string, name: string, jobTitle: string, stage: number) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333 text-align: center;">Application Update</h2>
            <p>Hi ${name},</p>
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> position and for the time you invested in the recruitment process.</p>
            <p>After careful consideration of your profile after Stage ${stage}, we regret to inform you that we won't be moving forward with your application at this time.</p>
            <p>We'll keep your profile in our database for future opportunities that match your skills.</p>
            <p>We wish you the best of luck in your job search.</p>
            <p style="margin-top: 20px; font-size: 0.8em; color: #666;">Best regards,<br>The Recruitment Team</p>
        </div>
    `

    return transporter.sendMail({
        from,
        to,
        subject: `Update regarding your application for ${jobTitle}`,
        html,
    })
}

export async function sendSelectionEmail(to: string, name: string, jobTitle: string) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #124A59; padding: 20px; border-radius: 10px;">
            <h1 style="color: #124A59; text-align: center;">Congratulations! 🎉</h1>
            <p>Hi ${name},</p>
            <p>We are thrilled to inform you that you have been <strong>SELECTED</strong> for the <strong>${jobTitle}</strong> position!</p>
            <p>The recruitment team will reach out to you shortly with the next steps and offer details.</p>
            <p>We're excited to have you on board!</p>
            <p style="margin-top: 20px; font-size: 0.8em; color: #666;">Best regards,<br>The Recruitment Team</p>
        </div>
    `

    return transporter.sendMail({
        from,
        to,
        subject: `Congratulations! You're Hired for ${jobTitle}`,
        html,
    })
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #124A59; text-align: center; margin-bottom: 24px;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your Hirezium account. Click the button below to choose a new password:</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="background-color: #124A59; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">This link will expire in 30 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="color: #94A3B8; font-size: 12px; text-align: center;">Best regards,<br>The Hirezium Team</p>
        </div>
    `

    return transporter.sendMail({
        from,
        to,
        subject: 'Reset your Hirezium password',
        html,
    })
}
