import { Resend } from 'resend'

// Lazy load Resend client to avoid build-time initialization
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey || apiKey === 'your-resend-api-key-here') {
      console.warn('Resend API key not configured. Email functionality will be disabled.')
      // Return a mock client for development/build time
      return {
        emails: {
          send: async () => {
            console.log('Email sending is disabled - no API key configured')
            return { id: 'mock-email-id' }
          }
        }
      } as { emails: { send: () => Promise<{ id: string }> } }
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  /**
   * Send family invitation email
   */
  static async sendFamilyInvitation(
    to: string,
    familyName: string,
    inviterName: string,
    role: string,
    inviteUrl: string
  ): Promise<void> {
    const subject = `You've been invited to join ${familyName} on PAM`
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Invitation - PAM</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #7D0820 0%, #F9B1BC 100%);
      border-radius: 12px;
      color: white;
    }
    .content {
      background: #fff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: #7D0820;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #F9B1BC;
      color: #7D0820;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 30px;
    }
    .features {
      margin: 20px 0;
      padding: 20px;
      background: #FFFBF8;
      border-radius: 8px;
      border-left: 4px solid #7D0820;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PAM</h1>
    <p>Parent Admin Manager</p>
  </div>
  
  <div class="content">
    <h2>You've been invited to join a family!</h2>
    
    <p>Hi there!</p>
    
    <p><strong>${inviterName}</strong> has invited you to join <strong>${familyName}</strong> on PAM (Parent Admin Manager) as a <span class="role-badge">${role}</span>.</p>
    
    <div class="features">
      <h3>What you'll be able to do:</h3>
      <ul>
        <li>Track daily activities (feeding, sleep, nappies)</li>
        <li>View growth measurements and milestones</li>
        <li>Access family calendar and appointments</li>
        <li>Share healthcare information</li>
        <li>View analytics and patterns</li>
        ${role === 'owner' || role === 'partner' ? '<li>Invite other family members</li>' : ''}
      </ul>
    </div>
    
    <p>PAM helps Australian families with children aged 0-3 years track their little one's development, manage healthcare appointments, and stay organised.</p>
    
    <div style="text-align: center;">
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </div>
    
    <p><strong>This invitation expires in 7 days.</strong></p>
    
    <p>If you have any questions, just reply to this email or contact the family member who invited you.</p>
    
    <p>Welcome to the PAM family!</p>
  </div>
  
  <div class="footer">
    <p>This invitation was sent by ${inviterName} through PAM.</p>
    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #7D0820;">Visit PAM</a> | 
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #7D0820;">Support</a>
    </p>
  </div>
</body>
</html>
    `

    const text = `
You've been invited to join ${familyName} on PAM!

${inviterName} has invited you to join ${familyName} on PAM (Parent Admin Manager) as a ${role}.

PAM helps Australian families with children aged 0-3 years track their little one's development, manage healthcare appointments, and stay organised.

Accept your invitation: ${inviteUrl}

This invitation expires in 7 days.

If you have any questions, just reply to this email or contact the family member who invited you.

Welcome to the PAM family!

---
This invitation was sent by ${inviterName} through PAM.
If you didn't expect this invitation, you can safely ignore this email.
    `

    await this.sendEmail({
      to,
      subject,
      html,
      text
    })
  }

  /**
   * Send reminder email for notifications
   */
  static async sendReminderEmail(
    to: string,
    childName: string,
    reminderType: string,
    reminderDetails: string,
    dueTime: string
  ): Promise<void> {
    const subject = `PAM Reminder: ${reminderType} for ${childName}`
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PAM Reminder</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #7D0820 0%, #F9B1BC 100%);
      border-radius: 12px;
      color: white;
    }
    .content {
      background: #fff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .reminder-box {
      background: #FFFBF8;
      border: 2px solid #F9B1BC;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: #7D0820;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PAM Reminder</h1>
  </div>
  
  <div class="content">
    <h2>Reminder for ${childName}</h2>
    
    <div class="reminder-box">
      <h3>${reminderType}</h3>
      <p><strong>Due: ${dueTime}</strong></p>
      <p>${reminderDetails}</p>
    </div>
    
    <p>This is a friendly reminder from PAM to help you stay on top of your little one's care.</p>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Open PAM</a>
    </div>
    
    <p>You can manage your reminder preferences in the PAM app settings.</p>
  </div>
  
  <div class="footer">
    <p>Sent by PAM - Parent Admin Manager</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #7D0820;">Visit PAM</a> | 
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #7D0820;">Manage Settings</a>
    </p>
  </div>
</body>
</html>
    `

    const text = `
PAM Reminder for ${childName}

${reminderType}
Due: ${dueTime}

${reminderDetails}

This is a friendly reminder from PAM to help you stay on top of your little one's care.

Open PAM: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

You can manage your reminder preferences in the PAM app settings.

---
Sent by PAM - Parent Admin Manager
    `

    await this.sendEmail({
      to,
      subject,
      html,
      text
    })
  }

  /**
   * Generic email sending method
   */
  private static async sendEmail({ to, subject, html, text }: EmailTemplate): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - email not sent')
      console.log(`Would send email to: ${to}`)
      console.log(`Subject: ${subject}`)
      return
    }

    try {
      const { error } = await getResendClient().emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'PAM <noreply@pam.app>',
        to,
        subject,
        html,
        text
      })

      if (error) {
        console.error('Error sending email:', error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log(`Email sent successfully to ${to}`)
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  }

  /**
   * Test email configuration
   */
  static async testConfiguration(): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('Email service not configured (missing RESEND_API_KEY)')
        return false
      }

      // Test with a simple email
      await this.sendEmail({
        to: 'test@example.com',
        subject: 'PAM Email Test',
        html: '<p>This is a test email from PAM.</p>',
        text: 'This is a test email from PAM.'
      })

      return true
    } catch (error) {
      console.error('Email configuration test failed:', error)
      return false
    }
  }
}