'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function HowItWorks() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const ar = lang === 'ar'

  const t = {
    title: ar ? 'كيف يعمل GazaBridge؟' : 'How GazaBridge Works',
    subtitle: ar ? 'منصة مجانية تربط المتطوعين المهرة حول العالم بأهل غزة الذين يحتاجون إلى الدعم' : 'A free platform connecting skilled volunteers worldwide with people in Gaza who need support.',
    volTitle: ar ? '🙌 للمتطوعين' : '🙌 For Volunteers',
    gazaTitle: ar ? '🌟 لأهل غزة' : '🌟 For People in Gaza',
    faqTitle: ar ? '❓ الأسئلة الشائعة' : '❓ Frequently Asked Questions',
    ctaTitle: ar ? 'هل أنت مستعد للبدء؟' : 'Ready to get started?',
    joinVol: ar ? '🙌 انضم كمتطوع' : '🙌 Join as Volunteer',
    getHelp: ar ? '🌟 احصل على مساعدة' : '🌟 Get Help',
  }

  const volSteps = ar ? [
    'أنشئ حساباً مجانياً باستخدام Google أو البريد الإلكتروني',
    'أكمل ملفك الشخصي — أضف مهاراتك ولغاتك وأوقات توفرك، وبشكل اختياري LinkedIn و WhatsApp',
    'انشر عرضاً يصف ما يمكنك تعليمه أو المساعدة فيه (مثل دروس اللغة الإنجليزية، البرمجة، مساعدة في السيرة الذاتية)',
    'تصفح "الاحتياجات" للعثور على أشخاص في غزة يحتاجون إلى مهاراتك وتواصل معهم مباشرة',
    'تواصل عبر رسائل المنصة أو واتساب أو ادعوهم إلى مجموعة واتساب الخاصة بك',
  ] : [
    'Create a free account using Google or email',
    'Complete your profile — add your skills, languages, availability and optionally your LinkedIn and WhatsApp',
    'Post an offer describing what you can teach or help with (e.g. English lessons, coding, CV help)',
    'Browse "Needs" to find people in Gaza who need your skills and message them directly',
    'Connect via platform messages, WhatsApp chat, or invite them to your WhatsApp group',
  ]

  const gazaSteps = ar ? [
    'أنشئ حساباً مجانياً باستخدام Google أو البريد الإلكتروني',
    'أكمل ملفك الشخصي — أضف موقعك ولغاتك ومعلومات التواصل (واتساب أو تيليغرام)',
    'انشر طلباً يصف المساعدة التي تحتاجها (مثل "أريد تعلم الإنجليزية"، "أحتاج مساعدة في سيرتي الذاتية")',
    'تصفح "المتطوعين" للعثور على شخص لديه المهارات التي تحتاجها وتواصل معه مباشرة',
    'كل شيء مجاني تماماً — المتطوعون هنا للمساعدة دون أي تكلفة عليك',
  ] : [
    'Create a free account using Google or email',
    'Complete your profile — add your location, languages and contact info (WhatsApp or Telegram)',
    'Post a request describing what help you need (e.g. "I want to learn English", "I need help with my CV")',
    'Browse "Volunteers" to find someone with the skills you need and message them directly',
    'Everything is completely free — volunteers are here to help with no cost to you',
  ]

  const faqs = ar ? [
    { q: 'هل GazaBridge مجاني؟', a: 'نعم، مجاني تماماً للجميع — للمتطوعين وأهل غزة على حد سواء.' },
    { q: 'كيف أتواصل مع متطوع؟', a: 'انقر على "رسالة" في بطاقة أي متطوع لإرسال رسالة مباشرة. يمكنك أيضاً استخدام رقم واتساب الخاص بهم أو الانضمام إلى مجموعة واتساب الخاصة بهم إن وجدت.' },
    { q: 'هل يمكنني أن أكون متطوعاً وأطلب المساعدة في نفس الوقت؟', a: 'نعم! عند إكمال ملفك الشخصي يمكنك اختيار كلا الدورين. كثير من الناس يعلمون مهارة بينما يتعلمون مهارة أخرى.' },
    { q: 'ما اللغات المدعومة؟', a: 'تدعم المنصة جميع اللغات. يمكنك كتابة عروضك وطلباتك باللغة العربية أو الإنجليزية أو أي لغة أخرى.' },
    { q: 'هل معلوماتي الشخصية آمنة؟', a: 'ملفك الشخصي مرئي فقط للمستخدمين المسجلين. أنت تتحكم في معلومات الاتصال التي تشاركها.' },
  ] : [
    { q: 'Is GazaBridge free?', a: 'Yes, completely free for everyone — volunteers and Gaza residents alike.' },
    { q: 'How do I contact a volunteer?', a: 'Click "Message" on any volunteer card to send them a message directly. You can also use their WhatsApp number or join their WhatsApp group if they have added one.' },
    { q: 'Can I be both a volunteer and seek help?', a: 'Yes! When completing your profile you can select both roles. Many people teach one skill while learning another.' },
    { q: 'What languages are supported?', a: 'The platform supports all languages. You can write your offers and requests in Arabic, English, or any other language.' },
    { q: 'Is my personal information safe?', a: 'Your profile is only visible to logged-in users. You control what contact information you share.' },
  ]

  const stepColor = (type: 'vol' | 'gaza') => type === 'vol' ? '#d97706' : '#16a34a'

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px', fontFamily: 'inherit', direction: ar ? 'rtl' : 'ltr' }}>

      {/* Language toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '100px', padding: '4px', gap: '4px' }}>
          <button onClick={() => setLang('en')} style={{
            padding: '8px 20px', borderRadius: '100px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', border: 'none',
            background: lang === 'en' ? '#d97706' : 'transparent',
            color: lang === 'en' ? '#fff' : '#6b7280',
            transition: 'all 0.2s',
          }}>English</button>
          <button onClick={() => setLang('ar')} style={{
            padding: '8px 20px', borderRadius: '100px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', border: 'none',
            background: lang === 'ar' ? '#d97706' : 'transparent',
            color: lang === 'ar' ? '#fff' : '#6b7280',
            transition: 'all 0.2s',
          }}>العربية</button>
        </div>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="font-cormorant" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>{t.title}</h1>
        <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>{t.subtitle}</p>
      </div>

      {/* For Volunteers */}
      <div style={{ background: '#fffbeb', borderRadius: '24px', border: '1px solid #fde68a', padding: '36px', marginBottom: '24px' }}>
        <h2 className="font-cormorant" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px', color: '#b45309' }}>{t.volTitle}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {volSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexDirection: ar ? 'row-reverse' : 'row' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: stepColor('vol'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#374151', lineHeight: 1.7 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* For Gaza Residents */}
      <div style={{ background: '#f0fdf4', borderRadius: '24px', border: '1px solid #bbf7d0', padding: '36px', marginBottom: '24px' }}>
        <h2 className="font-cormorant" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px', color: '#16a34a' }}>{t.gazaTitle}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {gazaSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexDirection: ar ? 'row-reverse' : 'row' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: stepColor('gaza'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#374151', lineHeight: 1.7 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e5e7eb', padding: '36px', marginBottom: '32px' }}>
        <h2 className="font-cormorant" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px' }}>{t.faqTitle}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', marginBottom: '8px' }}>
                {ar ? '❓' : 'Q:'} {faq.q}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderRadius: '24px' }}>
        <h2 className="font-cormorant" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '24px' }}>{t.ctaTitle}</h2>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/help" style={{ padding: '14px 32px', borderRadius: '100px', background: '#16a34a', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
            {t.getHelp}
          </Link>
        </div>
      </div>

    </div>
  )
}
