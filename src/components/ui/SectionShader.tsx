"use client"
import React from "react"

export default function SectionShader({
  children,
  className = "",
  variant = "light",
  animationDuration = "12s",
}: {
  children: React.ReactNode
  className?: string
  variant?: "light" | "dark"
  animationDuration?: string
}) {
  const gradients =
    variant === "dark"
      ? `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(92, 107, 46, 0.15) 0%, transparent 60%),
         radial-gradient(ellipse 60% 80% at 80% 70%, rgba(192, 122, 26, 0.13) 0%, transparent 60%),
         radial-gradient(ellipse 50% 50% at 50% 50%, rgba(122, 139, 62, 0.10) 0%, transparent 70%)`
      : `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(92, 107, 46, 0.08) 0%, transparent 60%),
         radial-gradient(ellipse 60% 80% at 80% 70%, rgba(192, 122, 26, 0.07) 0%, transparent 60%),
         radial-gradient(ellipse 50% 50% at 50% 50%, rgba(122, 139, 62, 0.05) 0%, transparent 70%)`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shader layer — sits behind all content */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: gradients,
          animation: `shaderShift ${animationDuration} ease-in-out infinite alternate`,
          willChange: "background-position",
          backgroundSize: "200% 200%",
          pointerEvents: "none",
        }}
      />
      {/* Content sits above shader */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  )
}
