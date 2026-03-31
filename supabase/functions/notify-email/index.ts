import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'GazaBridge <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  })
  return res.json()
}

serve(async (req) => {
  const payload = await req.json()
  const { type, record, table } = payload

  if (type === 'INSERT' && table === 'messages') {
    const { data: senderData } = await supabase
      .from('profiles').select('name').eq('id', record.sender_id).single()
    const { data: receiverAuth } = await supabase.auth.admin.getUserById(record.receiver_id)

    if (receiverAuth?.user?.email) {
      await sendEmail(
        receiverAuth.user.email,
        `💬 New message from ${senderData?.name} on GazaBridge`,
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <img src="https://gazabridge.vercel.app/gazabridge-logo.png" height="48" style="margin-bottom: 16px;" />
          <h2 style="color: #b45309;">You have a new message 🕊️</h2>
          <p><strong>${senderData?.name}</strong> sent you a message on GazaBridge:</p>
          <blockquote style="background: #fffbeb; padding: 16px; border-left: 4px solid #b45309; border-radius: 4px; margin: 16px 0;">
            ${record.content}
          </blockquote>
          <a href="https://gazabridge.vercel.app/messages" 
             style="display: inline-block; padding: 12px 24px; background: #b45309; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reply on GazaBridge →
          </a>
          <p style="color: #888; font-size: 12px; margin-top: 32px;">GazaBridge — Where skills meet those who need them</p>
        </div>
        `
      )
    }
  }

  if (type === 'INSERT' && table === 'conversations') {
    const { data: volunteer } = await supabase
      .from('profiles').select('name').eq('id', record.volunteer_id).single()
    const { data: seeker } = await supabase
      .from('profiles').select('name').eq('id', record.seeker_id).single()
    const { data: volAuth } = await supabase.auth.admin.getUserById(record.volunteer_id)
    const { data: seekAuth } = await supabase.auth.admin.getUserById(record.seeker_id)

    const matchEmail = (toEmail: string, toName: string, otherName: string) => sendEmail(
      toEmail,
      `🤝 You have a new match on GazaBridge!`,
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <img src="https://gazabridge.vercel.app/gazabridge-logo.png" height="48" style="margin-bottom: 16px;" />
        <h2 style="color: #b45309;">You have a new match! 🕊️</h2>
        <p>Hi <strong>${toName}</strong>! You have been connected with <strong>${otherName}</strong> on GazaBridge.</p>
        <p>Start a conversation and make a difference together.</p>
        <a href="https://gazabridge.vercel.app/messages" 
           style="display: inline-block; padding: 12px 24px; background: #b45309; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Start Chatting →
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">GazaBridge — Where skills meet those who need them</p>
      </div>
      `
    )

    if (volAuth?.user?.email) await matchEmail(volAuth.user.email, volunteer?.name, seeker?.name)
    if (seekAuth?.user?.email) await matchEmail(seekAuth.user.email, seeker?.name, volunteer?.name)
  }

  return new Response('ok', { status: 200 })
})
