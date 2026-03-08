import { supabase } from '@/lib/supabase'

const ADMIN_ID = 'c7990cfb-25a6-4f4c-bf32-ac23900b12f6'

export async function sendWelcomeMessageIfNew(userId: string) {
  const key = `welcome_sent_${userId}`
  if (typeof window !== 'undefined' && localStorage.getItem(key)) return

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(volunteer_id.eq.${ADMIN_ID},seeker_id.eq.${userId}),and(volunteer_id.eq.${userId},seeker_id.eq.${ADMIN_ID})`)
    .limit(1)
    .maybeSingle()

  if (existing) {
    if (typeof window !== 'undefined') localStorage.setItem(key, 'true')
    return
  }

  const { data: convo, error: convoErr } = await supabase
    .from('conversations')
    .insert({ volunteer_id: ADMIN_ID, seeker_id: userId })
    .select()
    .single()

  if (convoErr || !convo) return

  await supabase.from('messages').insert({
    sender_id: ADMIN_ID,
    receiver_id: userId,
    conversation_id: convo.id,
    content: `🕊️ Welcome to GazaBridge!\n\nWe're so glad you're here. This platform was built to connect people in Gaza with volunteers around the world who want to share their skills, knowledge, and time.\n\nHere's how to get started:\n• Browse volunteers at /volunteers\n• Post a need at /needs\n• Update your profile at /dashboard\n\nIf you ever need help, just reply to this message. We're rooting for you. 💛\n\n— Sana & the GazaBridge Team`,
  })

  if (typeof window !== 'undefined') localStorage.setItem(key, 'true')
}
