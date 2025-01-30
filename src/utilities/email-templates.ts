import type { PayloadRequest } from 'payload'
import type { User } from '@/payload-types'

type EmailTemplate = {
  subject: string
  html: string
}

type TemplateArgs = {
  req: PayloadRequest
  token: string
  user: User
}

export const emailTemplates = {
  forgotPassword: ({ token, user }: TemplateArgs): EmailTemplate => ({
    subject: 'Reset Your Password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Hello ${user.name || user.email},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}">
        Reset Password
      </a>
    `,
  }),

  verifyEmail: ({ token, user }: TemplateArgs): EmailTemplate => ({
    subject: 'Verify Your Email',
    html: `
      <h1>Verify Your Email</h1>
      <p>Hello ${user.name || user.email},</p>
      <p>Click the link below to verify your email:</p>
      <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}">
        Verify Email
      </a>
    `,
  }),
}
