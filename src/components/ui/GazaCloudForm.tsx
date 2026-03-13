'use client'
import React, { useState, useEffect } from "react"
import { Input } from "./input"
import { Label } from "./label"

export default function GazaCloudForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    userType: "🤝 A Volunteer",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle")
  const [isTyping, setIsTyping] = useState(false)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 })
  const [blink, setBlink] = useState(false)

  // Track mouse movement
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  // Calculate eye position based on cursor
  useEffect(() => {
    const offsetX = ((cursor.x / window.innerWidth) - 0.5) * 40
    const offsetY = ((cursor.y / window.innerHeight) - 0.5) * 20
    setEyePos({ x: offsetX, y: offsetY })
  }, [cursor])

  // Blinking every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")

    // Simulate form submission
    setTimeout(() => {
      setStatus("success")
      setFormData({ fullName: "", email: "", userType: "🤝 A Volunteer", message: "" })
      setTimeout(() => setStatus("idle"), 3000)
    }, 1500)
  }

  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(255, 253, 248, 1) 0%, rgba(250, 244, 228, 0.95) 40%, rgba(248, 241, 220, 0.9) 100%)",
        borderRadius: "24px",
        border: "1px solid rgba(192, 122, 26, 0.18)",
        boxShadow: "0 8px 40px rgba(192, 122, 26, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        padding: "2.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Cloud with eyes */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "280px",
          height: "160px",
          margin: "0 auto 2rem",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <img
          src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/cloud.jpg"
          alt="cloud"
          loading="lazy"
          decoding="async"
          width="280"
          height="160"
          style={{
            display: "block",
            margin: "0 auto",
            maxWidth: "100%",
            width: "180px",
            height: "auto",
            objectFit: "contain",
            filter: "hue-rotate(200deg) saturate(1.4) brightness(0.95)",
          }}
        />
        {/* Eyes */}
        {["left", "right"].map((side, idx) => (
          <div
            key={side}
            style={{
              position: "absolute",
              top: "60px",
              left: idx === 0 ? "80px" : "150px",
              width: "28px",
              height: isTyping ? "4px" : blink ? "6px" : "40px",
              borderRadius: isTyping || blink ? "2px" : "50% / 60%",
              backgroundColor: isTyping ? "black" : "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              overflow: "hidden",
              transition: "all 0.15s ease",
            }}
          >
            {!isTyping && (
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #E09030, #C07A1A)",
                  marginBottom: "4px",
                  transform: `translate(${eyePos.x}px, 0px)`,
                  transition: "all 0.1s ease",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--dark)", marginBottom: "0.5rem" }}>
            Full Name / <span style={{ fontFamily: "Noto Naskh Arabic" }}>الاسم الكامل</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            required
            placeholder="Ahmad Al-Rashid"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "1.5px solid rgba(192, 122, 26, 0.15)",
              background: "rgba(250, 246, 238, 0.8)",
              fontSize: "0.95rem",
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#C07A1A"
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192, 122, 26, 0.10)"
              e.currentTarget.style.background = "rgba(255, 253, 248, 1)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(192, 122, 26, 0.15)"
              e.currentTarget.style.boxShadow = "none"
              e.currentTarget.style.background = "rgba(250, 246, 238, 0.8)"
            }}
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#5C6B2E", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Email / <span style={{ fontFamily: "Noto Naskh Arabic" }}>البريد الإلكتروني</span>
          </Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="ahmad@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "1.5px solid rgba(192, 122, 26, 0.15)",
              background: "rgba(250, 246, 238, 0.8)",
              fontSize: "0.95rem",
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#C07A1A"
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192, 122, 26, 0.10)"
              e.currentTarget.style.background = "rgba(255, 253, 248, 1)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(192, 122, 26, 0.15)"
              e.currentTarget.style.boxShadow = "none"
              e.currentTarget.style.background = "rgba(250, 246, 238, 0.8)"
            }}
          />
        </div>

        {/* User Type */}
        <div>
          <Label htmlFor="userType" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#5C6B2E", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            I am a... / <span style={{ fontFamily: "Noto Naskh Arabic" }}>أنا...</span>
          </Label>
          <select
            id="userType"
            title="Select your user type"
            value={formData.userType}
            onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "1.5px solid rgba(192, 122, 26, 0.15)",
              background: "rgba(250, 246, 238, 0.8)",
              fontSize: "0.95rem",
              outline: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              setIsTyping(true)
              e.currentTarget.style.borderColor = "#C07A1A"
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192, 122, 26, 0.10)"
              e.currentTarget.style.background = "rgba(255, 253, 248, 1)"
            }}
            onBlur={(e) => {
              setIsTyping(false)
              e.currentTarget.style.borderColor = "rgba(192, 122, 26, 0.15)"
              e.currentTarget.style.boxShadow = "none"
              e.currentTarget.style.background = "rgba(250, 246, 238, 0.8)"
            }}
          >
            <option>🤝 A Volunteer</option>
            <option>🌟 Someone from Gaza who needs help</option>
            <option>🏢 An Organization</option>
            <option>📰 Press / Media</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="message" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#5C6B2E", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Message / <span style={{ fontFamily: "Noto Naskh Arabic" }}>الرسالة</span>
          </Label>
          <textarea
            id="message"
            required
            placeholder="Tell us how we can help or how you'd like to get involved..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "1.5px solid rgba(192, 122, 26, 0.15)",
              background: "rgba(250, 246, 238, 0.8)",
              fontSize: "0.95rem",
              outline: "none",
              resize: "vertical",
              fontFamily: "DM Sans, sans-serif",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#C07A1A"
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(192, 122, 26, 0.10)"
              e.currentTarget.style.background = "rgba(255, 253, 248, 1)"
              setIsTyping(true)
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(192, 122, 26, 0.15)"
              e.currentTarget.style.boxShadow = "none"
              e.currentTarget.style.background = "rgba(250, 246, 238, 0.8)"
              setIsTyping(false)
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === "sending" || status === "success"}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "12px",
            border: "none",
            background: status === "success" ? "#5C6B2E" : "linear-gradient(135deg, #C07A1A 0%, #E09030 100%)",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: status === "sending" || status === "success" ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            opacity: status === "sending" ? 0.7 : 1,
            boxShadow: status === "idle" ? "0 4px 16px rgba(192, 122, 26, 0.30)" : "none",
          }}
          onMouseEnter={(e) => {
            if (status === "idle") {
              e.currentTarget.style.background = "linear-gradient(135deg, #A86818 0%, #C07A1A 100%)"
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(192, 122, 26, 0.45)"
              e.currentTarget.style.transform = "translateY(-1px)"
            }
          }}
          onMouseLeave={(e) => {
            if (status === "idle") {
              e.currentTarget.style.background = "linear-gradient(135deg, #C07A1A 0%, #E09030 100%)"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(192, 122, 26, 0.30)"
              e.currentTarget.style.transform = "translateY(0)"
            }
          }}
        >
          {status === "sending"
            ? "Sending... / جارٍ الإرسال"
            : status === "success"
            ? "✓ Sent! / تم الإرسال!"
            : "Send Message →"}
        </button>
      </form>
    </div>
  )
}
