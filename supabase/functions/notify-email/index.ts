import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('Function started')
    console.log('BREVO_API_KEY exists:', !!BREVO_API_KEY)
    console.log('SUPABASE_URL exists:', !!SUPABASE_URL)
    console.log('SUPABASE_SERVICE_KEY exists:', !!SUPABASE_SERVICE_KEY)

    if (!BREVO_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Missing environment variables!')
      return new Response('Missing env vars', { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const payload = await req.json()
    console.log('Payload received:', JSON.stringify(payload))
    const { type, record, table } = payload

    async function sendEmail(to: string, subject: string, html: string) {
      console.log('Sending email to:', to)
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': BREVO_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'GazaBridge', email: 'sanaadeel493@gmail.com' },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          }),
        })
        const data = await res.json()
        console.log('Brevo response status:', res.status)
        console.log('Brevo response body:', JSON.stringify(data))
        return data
      } catch (emailError) {
        console.error('Email send failed:', emailError)
      }
    }

    if (type === 'INSERT' && table === 'messages') {
      console.log('Processing message notification for:', record.id)

      const { data: senderData, error: senderError } = await supabase
        .from('profiles').select('name').eq('id', record.sender_id).single()
      console.log('Sender data:', JSON.stringify(senderData), 'Error:', JSON.stringify(senderError))

      const { data: receiverAuth, error: receiverError } = await supabase.auth.admin.getUserById(record.receiver_id)
      console.log('Receiver auth:', receiverAuth?.user?.email, 'Error:', JSON.stringify(receiverError))

      if (receiverAuth?.user?.email) {
        await sendEmail(
          receiverAuth.user.email,
          `💬 New message from ${senderData?.name ?? 'Someone'} on GazaBridge`,
          `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #b45309;">You have a new message 🕊️</h2>
            <p><strong>${senderData?.name ?? 'Someone'}</strong> sent you a message on GazaBridge:</p>
            <blockquote style="background: #fffbeb; padding: 16px; border-left: 4px solid #b45309; border-radius: 4px; margin: 16px 0;">
              ${record.content}
            </blockquote>
            <a href="https://gazabridge.netlify.app/messages" 
               style="display: inline-block; padding: 12px 24px; background: #b45309; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Reply on GazaBridge →
            </a>
            <p style="color: #888; font-size: 12px; margin-top: 32px;">GazaBridge — Where skills meet those who need them</p>
          </div>
          `
        )
      } else {
        console.log('No receiver email found, skipping email send')
      }
    }

    if (type === 'INSERT' && table === 'conversations') {
      console.log('Processing conversation notification for:', record.id)

      const { data: volunteer } = await supabase
        .from('profiles').select('name').eq('id', record.volunteer_id).single()
      const { data: seeker } = await supabase
        .from('profiles').select('name').eq('id', record.seeker_id).single()
      const { data: volAuth } = await supabase.auth.admin.getUserById(record.volunteer_id)
      const { data: seekAuth } = await supabase.auth.admin.getUserById(record.seeker_id)

      console.log('Volunteer:', volunteer?.name, volAuth?.user?.email)
      console.log('Seeker:', seeker?.name, seekAuth?.user?.email)

      const matchEmailHtml = (toName: string, otherName: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #b45309;">You have a new match! 🕊️</h2>
          <p>Hi <strong>${toName ?? 'there'}</strong>! You have been connected with <strong>${otherName ?? 'someone'}</strong> on GazaBridge.</p>
          <a href="https://gazabridge.netlify.app/messages" 
             style="display: inline-block; padding: 12px 24px; background: #b45309; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Start Chatting →
          </a>
          <p style="color: #888; font-size: 12px; margin-top: 32px;">GazaBridge — Where skills meet those who need them</p>
        </div>
      `

      if (volAuth?.user?.email) {
        await sendEmail(
          volAuth.user.email,
          `🤝 You have a new match on GazaBridge!`,
          matchEmailHtml(volunteer?.name, seeker?.name)
        )
      }

      if (seekAuth?.user?.email) {
        await sendEmail(
          seekAuth.user.email,
          `🤝 You have a new match on GazaBridge!`,
          matchEmailHtml(seeker?.name, volunteer?.name)
        )
      }
    }

    console.log('Function completed successfully')
    return new Response('ok', { status: 200 })

  } catch (error) {
    console.error('Function error:', String(error))
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
})
