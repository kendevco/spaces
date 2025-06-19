'use client'

import { track } from '@vercel/analytics'
import { Check, Copy, RefreshCw, Mail, Users, Link } from 'lucide-react'
import { useState } from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useModal } from '@/spaces/hooks/use-modal-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useOrigin } from '@/spaces/hooks/use-origin'
import { inviteService } from '@/spaces/services/invite'
import { ModalType, MemberRole } from '@/spaces/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

// Email invite schema
const emailInviteSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  role: z.nativeEnum(MemberRole),
  message: z.string().optional(),
})

export const InviteModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal()
  const origin = useOrigin()

  const isModalOpen = isOpen && type === ModalType.INVITE

  const { space } = data

  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  const inviteUrl = `${origin}/invite/${space?.inviteCode}`

  // Form for email invites
  const emailForm = useForm<z.infer<typeof emailInviteSchema>>({
    resolver: zodResolver(emailInviteSchema),
    defaultValues: {
      email: '',
      role: MemberRole.GUEST,
      message: '',
    },
  })

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  const onNew = async () => {
    try {
      setIsLoading(true)
      if (!space?.id) throw new Error('Space ID required')

      const updatedSpace = await inviteService.generateNewInviteCode(space.id)
      if (updatedSpace) {
        onOpen(ModalType.INVITE, { space: updatedSpace })
      }
    } catch (error) {
      console.error('[INVITE_MODAL]', error)
      toast.error('Failed to generate new invite link')
    } finally {
      setIsLoading(false)
    }
  }

  const onEmailInvite = async (values: z.infer<typeof emailInviteSchema>) => {
    try {
      setEmailSending(true)
      if (!space?.id) throw new Error('Space ID required')

      // Call email invite service
      const response = await fetch('/api/invites/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          email: values.email,
          role: values.role,
          message: values.message,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send invite')
      }

      emailForm.reset()
      toast.success(`Invite sent to ${values.email}`)
      track('Email Invite Sent', { spaceId: space.id, role: values.role })
    } catch (error) {
      console.error('[EMAIL_INVITE]', error)
      toast.error('Failed to send email invite')
    } finally {
      setEmailSending(false)
    }
  }

  const handleClose = () => {
    track('Invite Modal Closed')
    emailForm.reset()
    onClose()
  }

  const handleCopy = () => {
    if (space?.id) {
      track('Invite Link Copied', { spaceId: space.id })
    }
    onCopy()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] p-0 overflow-hidden max-w-md">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold text-zinc-200">
            Invite to {space?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-700/50">
              <TabsTrigger
                value="link"
                className="data-[state=active]:bg-[#7364c0] data-[state=active]:text-white text-zinc-300"
              >
                <Link className="h-4 w-4 mr-2" />
                Invite Link
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="data-[state=active]:bg-[#7364c0] data-[state=active]:text-white text-zinc-300"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Invite
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 mt-4">
              <Card className="bg-black/20 border-zinc-600">
                <CardHeader>
                  <CardTitle className="text-zinc-200 text-lg">Share Invite Link</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Anyone with this link can join your space
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-x-2">
                    <Input
                      disabled={isLoading}
                      className="bg-zinc-700/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0"
                      value={inviteUrl}
                      readOnly
                    />
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                      className="bg-zinc-700/50 border-zinc-600 hover:bg-zinc-600"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-zinc-300" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={onNew}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Generate a new link
                    <RefreshCw className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <Card className="bg-black/20 border-zinc-600">
                <CardHeader>
                  <CardTitle className="text-zinc-200 text-lg">Send Email Invitation</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Send a personalized invite to a specific email address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailInvite)} className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Email Address</FormLabel>
                            <FormControl>
                              <Input
                                disabled={emailSending}
                                className="bg-zinc-700/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0 placeholder:text-zinc-400"
                                placeholder="Enter email address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Initial Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-zinc-700/50 border-0 focus:ring-0 text-zinc-200 ring-offset-0 focus:ring-offset-0">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={MemberRole.GUEST}>Guest</SelectItem>
                                <SelectItem value={MemberRole.MEMBER}>Member</SelectItem>
                                <SelectItem value={MemberRole.MODERATOR}>Moderator</SelectItem>
                                <SelectItem value={MemberRole.ADMIN}>Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">
                              Personal Message (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled={emailSending}
                                className="bg-zinc-700/50 border-0 focus-visible:ring-0 text-zinc-200 focus-visible:ring-offset-0 placeholder:text-zinc-400"
                                placeholder="Add a personal message..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={emailSending}
                        className="w-full bg-[#7364c0] hover:bg-[#6356a8] text-white"
                      >
                        {emailSending ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
