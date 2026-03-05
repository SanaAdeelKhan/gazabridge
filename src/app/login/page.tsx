'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'volunteer'

  const [role, setRole] = useState<'volunteer' | 'seeker'>(defaultRole as 'volunteer' | 'seeker')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', password: '', country: '', contact: '',
    category: '', description: '', availability: '', languages: [] as string[],
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const toggleLang = (lang: string) => {
    setForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('No user ID returned')

      // 2. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        name: form.name,
        role,
        country: form.country,
        contact: form.contact,
        languages: form.languages,
      })
      if (profileError) throw profileError

      // 3. Create offer or request
      if (role === 'volunteer') {
        const { error: offerError } = await supabase.from('offers').insert({
          user_id: userId,
          category: form.category,
          description: form.description,
          availability: form.availability,
          tags: [],
        })
        if (offerError) throw offerError
      } else {
        const { error: reqError } = await supabase.from('requests').insert({
          user_id: userId,
          category: form.category,
          description: form.description,
          tags: [],
        })
        if (reqError) throw reqError
      }

      router.push(role === 'volunteer' ? '/volunteers' : '/needs')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const langs = ['English', 'Arabic / العربية', 'French', 'Urdu', 'Turkish', 'German']
  const categories = role === 'volunteer'
    ? ['📚 Teaching / Language', '💻 Tech / Coding / AI', '💼 Career / Mentorship', '🫂 Mental Health', '🎨 Creative / Design', '📖 Academic Tutoring']
    : ['📚 Learn a language', '💻 Learn tech / AI skills', '💼 Career / CV help', '🫂 Mental health support', '📖 Academic tutoring', '🎨 Creative skills']

  return (
    <div className="max-w-lg mx-auto px-6 py-16">

      {/* Role toggle */}
      <div className="text-center mb-10">
        <h1 className="font-playfair text-4xl font-black mb-2">Join GazaBridge</h1>
        <p className="text-gray-400 mb-8">Free · Takes 2 minutes</p>
        <div className="grid grid-cols-2 gap-3">
          {(['volunteer', 'seeker'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`p-5 rounded-2xl border-2 transition text-left ${role === r ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-200'}`}>
              <div className="text-3xl mb-2">{r === 'volunteer' ? '🙌' : '🌟'}</div>
              <div className="font-semibold capitalize">{r === 'volunteer' ? 'I want to help' : 'I need support'}</div>
              <div className="text-xs text-gray-400 mt-1">{r === 'volunteer' ? 'Offer your skills for free' : 'Get help from volunteers'}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Step 1 — Account */}
        <div className="bg-white rounded-2xl border border-amber-100 p-6 space-y-4">
          <h2 className="font-semibold text-lg">1. Your account</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
              placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
              placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
              placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {role === 'volunteer' ? 'Country' : 'Location (optional)'}
            </label>
            <input value={form.country} onChange={e => set('country', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
              placeholder={role === 'volunteer' ? 'Where are you based?' : 'e.g. Gaza City'} />
          </div>
          {role === 'seeker' && (
            <div>
              <label className="block text-sm font-medium mb-1">Contact (WhatsApp / Telegram)</label>
              <input value={form.contact} onChange={e => set('contact', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm"
                placeholder="How can volunteers reach you?" />
            </div>
          )}
        </div>

        {/* Step 2 — Offer/Need */}
        <div className="bg-white rounded-2xl border border-amber-100 p-6 space-y-4">
          <h2 className="font-semibold text-lg">2. {role === 'volunteer' ? 'Your offer' : 'Your request'}</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm bg-white">
              <option value="">Select a category</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {role === 'volunteer' ? 'Describe what you can offer' : 'Describe what you need'}
              <span className="font-arabic text-gray-400 text-xs mr-2"> — يمكنك الكتابة بالعربية</span>
            </label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm resize-none"
              rows={4}
              placeholder={role === 'volunteer'
                ? 'e.g. I can teach 10 people English via weekly Zoom sessions...'
                : 'e.g. أريد تعلم اللغة الإنجليزية للدراسة في الخارج...'} />
          </div>
          {role === 'volunteer' && (
            <div>
              <label className="block text-sm font-medium mb-1">Availability per week</label>
              <select value={form.availability} onChange={e => set('availability', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none text-sm bg-white">
                <option value="">Select availability</option>
                <option>1–2 hours/week</option>
                <option>3–5 hours/week</option>
                <option>5–10 hours/week</option>
                <option>10+ hours/week</option>
              </select>
            </div>
          )}
        </div>

        {/* Step 3 — Languages */}
        <div className="bg-white rounded-2xl border border-amber-100 p-6">
          <h2 className="font-semibold text-lg mb-4">3. Languages</h2>
          <div className="flex flex-wrap gap-2">
            {langs.map(l => (
              <button key={l} onClick={() => toggleLang(l)}
                className={`px-4 py-2 rounded-full text-sm border transition ${form.languages.includes(l) ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-200 hover:border-amber-300'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition disabled:opacity-60 text-base">
          {loading ? 'Creating your account...' : `Join as ${role === 'volunteer' ? 'Volunteer 🙌' : 'Member 🌟'}`}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
        <JoinForm />
      </Suspense>
    </>
  )
}
