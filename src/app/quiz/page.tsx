'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

const basicQuestions = [
  { q: "What is the correct sentence?", options: ["She go to school.", "She goes to school.", "She going to school.", "She gone to school."], answer: 1 },
  { q: "Choose the correct word: I ___ a student.", options: ["am", "is", "are", "be"], answer: 0 },
  { q: "What does 'happy' mean?", options: ["Sad", "Tired", "Joyful", "Angry"], answer: 2 },
  { q: "Fill in the blank: The cat ___ on the mat.", options: ["sit", "sits", "sitting", "sat"], answer: 1 },
  { q: "Which word is a noun?", options: ["Run", "Quickly", "Beautiful", "Book"], answer: 3 },
]

const mediumQuestions = [
  { q: "Choose the correct tense: By tomorrow, I ___ the report.", options: ["finish", "finished", "will have finished", "am finishing"], answer: 2 },
  { q: "What is the meaning of 'reluctant'?", options: ["Eager", "Unwilling", "Confused", "Grateful"], answer: 1 },
  { q: "Fill in: Neither the students nor the teacher ___ ready.", options: ["were", "was", "are", "be"], answer: 1 },
  { q: "Which sentence uses the passive voice?", options: ["The dog bit the man.", "The man was bitten by the dog.", "The man bit the dog.", "The dog is biting the man."], answer: 1 },
  { q: "Choose the correct preposition: She is good ___ mathematics.", options: ["in", "on", "at", "for"], answer: 2 },
  { q: "What does 'ambiguous' mean?", options: ["Clear", "Dangerous", "Having more than one meaning", "Very large"], answer: 2 },
  { q: "Fill in: If I ___ rich, I would travel the world.", options: ["am", "was", "were", "be"], answer: 2 },
  { q: "Which is the correct spelling?", options: ["Recieve", "Receive", "Receve", "Receeve"], answer: 1 },
  { q: "Choose the right conjunction: I wanted to go out ___ it was raining.", options: ["because", "although", "so", "and"], answer: 1 },
  { q: "What is the plural of 'criterion'?", options: ["Criterions", "Criterias", "Criteria", "Criterium"], answer: 2 },
]

const advancedQuestions = [
  { q: "Identify the rhetorical device: 'The wind whispered through the trees.'", options: ["Metaphor", "Personification", "Simile", "Hyperbole"], answer: 1 },
  { q: "What does 'ephemeral' mean?", options: ["Eternal", "Short-lived", "Powerful", "Ancient"], answer: 1 },
  { q: "Fill in: The committee ___ its decision yesterday.", options: ["announced", "have announced", "announces", "announcing"], answer: 0 },
  { q: "Which sentence is grammatically correct?", options: ["Whom shall I say is calling?", "Who shall I say is calling?", "Who shall I say are calling?", "Whom shall I say are calling?"], answer: 1 },
  { q: "What is the subjunctive mood in: 'I suggest that he ___ on time.'", options: ["is", "be", "was", "will be"], answer: 1 },
  { q: "Choose the correct word: The data ___ inconclusive.", options: ["is", "are", "were", "have been"], answer: 1 },
  { q: "What does 'sycophant' mean?", options: ["A loud critic", "A flatterer who seeks favor", "An honest advisor", "A skilled debater"], answer: 1 },
  { q: "Fill in: ___ having studied hard, she failed the exam.", options: ["Although", "Despite", "However", "Because"], answer: 1 },
  { q: "Which is correct?", options: ["Less people came than expected.", "Fewer people came than expected.", "Lesser people came than expected.", "Little people came than expected."], answer: 1 },
  { q: "Identify the grammatical error: 'Between you and I, this is wrong.'", options: ["Between", "you", "I", "wrong"], answer: 2 },
  { q: "What does 'equivocate' mean?", options: ["To speak clearly", "To use vague language to mislead", "To translate accurately", "To argue strongly"], answer: 1 },
  { q: "Fill in: The phenomenon ___ widely debated among scholars.", options: ["has been", "have been", "had been being", "were"], answer: 0 },
  { q: "Which sentence uses a dangling modifier?", options: ["Running fast, he caught the bus.", "Running fast, the bus was caught.", "He ran fast to catch the bus.", "The bus was caught by the fast runner."], answer: 1 },
  { q: "What is an 'oxymoron'?", options: ["A very long word", "Two contradictory terms together", "A word with no meaning", "A figure of exaggeration"], answer: 1 },
  { q: "Choose the precise word: The treaty was ___ by both nations.", options: ["ratified", "accepted", "agreed", "passed"], answer: 0 },
]

type Stage = 'intro' | 'basic' | 'medium' | 'advanced' | 'result'

export default function QuizPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intro')
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [result, setResult] = useState<'Beginner' | 'Intermediate' | 'Advanced' | null>(null)
  const [saving, setSaving] = useState(false)
  const [fillAnswer, setFillAnswer] = useState('')

  const questions = stage === 'basic' ? basicQuestions : stage === 'medium' ? mediumQuestions : advancedQuestions
  const currentQ = questions[current]

  function startQuiz() { setStage('basic'); setCurrent(0); setScore(0); setSelected(null); setAnswered(false) }

  function handleAnswer(idx: number) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
  }

  function handleFillSubmit() {
    if (!fillAnswer.trim() || answered) return
    setAnswered(true)
  }

  function isFillQuestion(q: string) {
    return q.includes('Fill in')
  }

  function next() {
    const correct = selected === currentQ.answer
    const newScore = correct ? score + 1 : score

    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setScore(newScore)
      setSelected(null)
      setAnswered(false)
      setFillAnswer('')
      return
    }

    // End of stage
    const finalScore = newScore
    if (stage === 'basic') {
      if (finalScore < 3) { setResult('Beginner'); setStage('result') }
      else { setStage('medium'); setCurrent(0); setScore(0); setSelected(null); setAnswered(false) }
    } else if (stage === 'medium') {
      if (finalScore < 6) { setResult('Intermediate'); setStage('result') }
      else { setStage('advanced'); setCurrent(0); setScore(0); setSelected(null); setAnswered(false) }
    } else {
      setResult('Advanced'); setStage('result')
    }
  }

  async function saveResult() {
    if (!user || !result) return
    setSaving(true)
    await supabase.from('profiles').update({ english_level: result }).eq('id', user.id)
    setSaving(false)
    router.push('/dashboard')
  }

  const resultColors: Record<string, { bg: string; color: string; border: string }> = {
    Beginner: { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
    Intermediate: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
    Advanced: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  }
  const resultEmoji = { Beginner: '🌱', Intermediate: '📘', Advanced: '🏆' }

  const stageLabel = { basic: 'Stage 1 of 3 — Basic', medium: 'Stage 2 of 3 — Intermediate', advanced: 'Stage 3 of 3 — Advanced' }
  const stageColor = { basic: '#d97706', medium: '#1d4ed8', advanced: '#16a34a' }

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return null

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>

        {stage === 'intro' && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #fde68a', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📝</div>
            <h1 className="font-cormorant" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>English Level Quiz</h1>
            <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '8px' }}>This quiz will assess your English level and help volunteers match you better.</p>
            <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '32px', fontSize: '0.9rem' }}>The quiz is <strong>adaptive</strong> — it starts with basic questions. If you do well, it continues to harder stages. It takes about 5–10 minutes.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', textAlign: 'left', background: '#fffbeb', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span style={{ fontSize: '1.5rem' }}>🌱</span><div><strong>Beginner</strong> — Pass fewer than 3 basic questions</div></div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span style={{ fontSize: '1.5rem' }}>📘</span><div><strong>Intermediate</strong> — Pass basic but fewer than 6 medium questions</div></div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}><span style={{ fontSize: '1.5rem' }}>🏆</span><div><strong>Advanced</strong> — Complete all three stages</div></div>
            </div>
            <button onClick={startQuiz} style={{ padding: '14px 48px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Start Quiz →
            </button>
          </div>
        )}

        {(stage === 'basic' || stage === 'medium' || stage === 'advanced') && currentQ && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #fde68a', padding: '40px' }}>
            {/* Stage & progress */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: stageColor[stage], background: stage === 'basic' ? '#fef3c7' : stage === 'medium' ? '#dbeafe' : '#f0fdf4', padding: '4px 14px', borderRadius: '100px' }}>
                  {stageLabel[stage]}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Q{current + 1} / {questions.length}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#f3f4f6', borderRadius: '100px' }}>
                <div style={{ width: `${((current + 1) / questions.length) * 100}%`, height: '100%', background: stageColor[stage], borderRadius: '100px', transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* Question */}
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.5 }}>{currentQ.q}</h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {currentQ.options.map((opt, idx) => {
                let bg = '#fff', border = '1.5px solid #e5e7eb', color = '#374151'
                if (answered) {
                  if (idx === currentQ.answer) { bg = '#f0fdf4'; border = '2px solid #16a34a'; color = '#16a34a' }
                  else if (idx === selected && selected !== currentQ.answer) { bg = '#fef2f2'; border = '2px solid #ef4444'; color = '#ef4444' }
                } else if (selected === idx) {
                  bg = '#fffbeb'; border = '2px solid #d97706'; color = '#d97706'
                }
                return (
                  <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered}
                    style={{ padding: '14px 20px', borderRadius: '14px', background: bg, border, color, fontWeight: 500, fontSize: '0.9rem', cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                    <span style={{ marginRight: '10px', opacity: 0.5 }}>{String.fromCharCode(65 + idx)}.</span>{opt}
                  </button>
                )
              })}
            </div>

            {answered && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: selected === currentQ.answer ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                  {selected === currentQ.answer ? '✅ Correct!' : `❌ Correct answer: ${currentQ.options[currentQ.answer]}`}
                </span>
                <button onClick={next} style={{ padding: '10px 32px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {current + 1 === questions.length ? 'Finish Stage →' : 'Next →'}
                </button>
              </div>
            )}
          </div>
        )}

        {stage === 'result' && result && (
          <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #fde68a', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{resultEmoji[result]}</div>
            <h1 className="font-cormorant" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>Your English Level</h1>
            <div style={{ display: 'inline-block', padding: '12px 40px', borderRadius: '100px', background: resultColors[result].bg, color: resultColors[result].color, border: `2px solid ${resultColors[result].border}`, fontWeight: 700, fontSize: '1.3rem', marginBottom: '24px' }}>
              {result}
            </div>
            <p style={{ color: '#6b7280', marginBottom: '32px', lineHeight: 1.7 }}>
              {result === 'Beginner' && "You're just starting out — that's completely okay! Volunteers on GazaBridge can help you grow from here. 🌱"}
              {result === 'Intermediate' && "Great foundation! You can communicate well and are ready to level up with the right support. 📘"}
              {result === 'Advanced' && "Excellent English! You have strong language skills that will open many doors. 🏆"}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={saveResult} disabled={saving} style={{ padding: '14px 40px', borderRadius: '100px', background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : '💾 Save & Go to Dashboard'}
              </button>
              <button onClick={startQuiz} style={{ padding: '14px 32px', borderRadius: '100px', background: '#fff', color: '#6b7280', border: '1.5px solid #e5e7eb', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                🔄 Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
