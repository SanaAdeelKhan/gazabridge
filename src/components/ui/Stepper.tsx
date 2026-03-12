'use client'
import React, { useState } from 'react'

export interface StepProps {
  children: React.ReactNode
}

export interface StepperProps {
  children: React.ReactNode[]
  activeColor?: string
  completeColor?: string
  backButtonText?: string
  nextButtonText?: string
}

export function Step({ children }: StepProps) {
  return <>{children}</>
}

export function Stepper({ 
  children, 
  activeColor = '#C07A1A', 
  completeColor = '#5C6B2E',
  backButtonText = 'السابق / Back',
  nextButtonText = 'التالي / Next'
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = React.Children.toArray(children)
  const totalSteps = steps.length

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Determine if volunteer or need help based on activeColor
  const isVolunteer = activeColor === '#5C6B2E'
  const borderAccent = isVolunteer ? 'rgba(92,107,46,0.4)' : 'rgba(192,122,26,0.4)'

  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(192,122,26,0.15)',
      borderLeft: `3px solid ${borderAccent}`,
      borderRadius: '20px',
      boxShadow: '0 4px 24px rgba(192,122,26,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
      overflow: 'hidden',
      maxWidth: '680px',
      margin: '0 auto',
    }}>
      {/* Step Indicator Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '1.5rem 2rem 1rem 2rem',
      }}>
        {steps.map((_, idx) => (
          <React.Fragment key={idx}>
            {/* Step Circle */}
            <button
              type="button"
              onClick={() => setCurrentStep(idx)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: idx > currentStep ? '1.5px solid #D4CFC4' : 'none',
                background: idx === currentStep 
                  ? `linear-gradient(135deg, ${activeColor}, ${isVolunteer ? '#7A8B3E' : '#E09030'})`
                  : idx < currentStep
                  ? activeColor
                  : '#F0EDE6',
                color: idx <= currentStep ? 'white' : '#8A8572',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: idx === currentStep ? `0 2px 8px ${activeColor}66` : 'none',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Go to step ${idx + 1}`}
            >
              {idx < currentStep ? '✓' : idx + 1}
            </button>
            
            {/* Connecting Line */}
            {idx < totalSteps - 1 && (
              <div style={{
                height: '1.5px',
                flex: 1,
                margin: '0 8px',
                background: idx < currentStep ? activeColor : '#D4CFC4',
                transition: 'all 0.3s ease',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content Area */}
      <div style={{
        padding: '1.5rem 2rem',
      }}>
        {steps[currentStep]}
      </div>

      {/* Footer Row - Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: currentStep === 0 ? 'flex-end' : 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem 1.5rem',
      }}>
        {/* Back button */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handlePrevious}
            style={{
              background: 'transparent',
              border: '1.5px solid #D4CFC4',
              color: '#5C6B2E',
              borderRadius: '50px',
              padding: '0.5rem 1.5rem',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F0EDE6'
              e.currentTarget.style.borderColor = '#5C6B2E'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = '#D4CFC4'
            }}
          >
            ← {backButtonText}
          </button>
        )}

        {/* Next button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentStep === totalSteps - 1}
          style={{
            background: currentStep === totalSteps - 1 
              ? '#D4CFC4' 
              : `linear-gradient(135deg, ${activeColor}, ${isVolunteer ? '#7A8B3E' : '#E09030'})`,
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '0.6rem 1.8rem',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1rem',
            fontWeight: 700,
            cursor: currentStep === totalSteps - 1 ? 'not-allowed' : 'pointer',
            boxShadow: currentStep === totalSteps - 1 
              ? 'none' 
              : `0 4px 14px ${activeColor}59`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (currentStep !== totalSteps - 1) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = `0 6px 20px ${activeColor}70`
            }
          }}
          onMouseLeave={(e) => {
            if (currentStep !== totalSteps - 1) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 4px 14px ${activeColor}59`
            }
          }}
        >
          {nextButtonText} →
        </button>
      </div>
    </div>
  )
}
