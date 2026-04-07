import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton.jsx";

/**
 * Contact.jsx
 * Two-step flow:
 *  Step 1 — Fill form + click "Send" → OTP emailed to user
 *  Step 2 — Enter OTP → message saved to DB, confirmation email sent
 */

const API = "http://localhost:8080";

const CONTACTS = [
  { label: "Support", value: "support@farmconnect.com", icon: "🛡️" },
  { label: "Sales",   value: "sales@farmconnect.com",   icon: "💼" },
  { label: "Phone",   value: "1800-555-FARM",           icon: "📞" },
];

export default function Contact() {
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [otp, setOtp]         = useState("");
  const [step, setStep]       = useState(1);      // 1 = form, 2 = otp input
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr]         = useState("");

  // -------- VALIDATION --------
  function validate() {
    if (!form.name.trim() || form.name.trim().length < 2) return "Please enter your full name.";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return "Please enter a valid email address.";
    if (!form.message.trim() || form.message.trim().length < 8) return "Please write a slightly longer message.";
    return "";
  }

  // -------- STEP 1: REQUEST OTP --------
  async function handleSend(e) {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) { setErr(v); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/contact/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send code.");
      setStep(2);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // -------- STEP 2: VERIFY OTP + SUBMIT --------
  async function handleVerify(e) {
    e.preventDefault();
    setErr("");
    if (!otp.trim() || otp.trim().length < 4) {
      setErr("Please enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    form.name,
          email:   form.email,
          message: form.message,
          otp:     otp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed.");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setForm({ name: "", email: "", message: "" });
        setOtp("");
        setErr("");
      }, 3500);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // -------- RESEND OTP --------
  async function handleResend() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/contact/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code.");
      setErr("✅ New code sent! Check your inbox.");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#ecfffb] to-[#fffbe5] pt-14 pb-24 px-5">
      <motion.section
        className="max-w-4xl mx-auto bg-white/98 rounded-3xl shadow-2xl p-10 mb-12"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-4xl font-black text-green-900 mb-4 text-center">Contact Us</h2>

        <div className="flex flex-col md:flex-row gap-10 items-start">

          {/* ---- LEFT: Info + Map ---- */}
          <div className="flex-1">
            <div className="mb-7 text-green-900 font-bold">Reach out for help, support, or to join our network:</div>
            <div className="mb-6 flex flex-col gap-4">
              {CONTACTS.map(c => (
                <div key={c.label} className="flex items-center gap-3 bg-green-50 px-5 py-2.5 rounded-xl font-medium shadow">
                  <span className="text-2xl">{c.icon}</span>
                  <span className="font-bold">{c.label}:</span>
                  <span className="text-green-800">{c.value}</span>
                </div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-96 rounded-2xl overflow-hidden shadow-lg"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122103.71422743557!2d81.72395666393108!3d16.98728214373291!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37a3f2440c9fff%3A0x86b24503e305ca21!2sRajamahendravaram%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1762352964527!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </motion.div>
          </div>

          {/* ---- RIGHT: Form ---- */}
          <div className="flex-1 flex flex-col gap-4 bg-green-50/80 p-7 rounded-xl shadow-lg">

            <AnimatePresence mode="wait">

              {/* ======= STEP 1: CONTACT FORM ======= */}
              {step === 1 && !success && (
                <motion.form
                  key="step1"
                  onSubmit={handleSend}
                  className="flex flex-col gap-4"
                  aria-label="Contact form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <label>
                    Name
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full"
                      disabled={loading}
                      autoFocus
                      placeholder="Your full name"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      type="email"
                      className="w-full"
                      disabled={loading}
                      placeholder="you@email.com"
                    />
                  </label>
                  <label>
                    Your Message
                    <textarea
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full"
                      rows={4}
                      disabled={loading}
                      placeholder="How can we help you?"
                    />
                  </label>

                  {err && <div className="form-error">{err}</div>}

                  <AnimatedButton
                    type="submit"
                    color="secondary"
                    loading={loading}
                    disabled={loading}
                    label={loading ? "Sending Code…" : "Send"}
                  />

                  <p className="text-xs text-green-700 text-center mt-1">
                    📧 A verification code will be sent to your email before your message is saved.
                  </p>
                </motion.form>
              )}

              {/* ======= STEP 2: OTP VERIFICATION ======= */}
              {step === 2 && !success && (
                <motion.form
                  key="step2"
                  onSubmit={handleVerify}
                  className="flex flex-col gap-4"
                  aria-label="OTP verification form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📬</div>
                    <h3 className="text-xl font-bold text-green-900 mb-1">Check Your Inbox</h3>
                    <p className="text-sm text-green-700">
                      We sent a 6-digit code to <strong>{form.email}</strong>.<br />
                      Enter it below to verify and submit your message.
                    </p>
                  </div>

                  <label>
                    Verification Code
                    <input
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full text-center text-2xl font-bold tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      disabled={loading || success}
                      autoFocus
                      inputMode="numeric"
                    />
                  </label>

                  {err && (
                    <div className={err.startsWith("✅") ? "text-green-700 text-sm text-center" : "form-error"}>
                      {err}
                    </div>
                  )}

                  <AnimatedButton
                    type="submit"
                    color="secondary"
                    loading={loading}
                    disabled={loading || success}
                    label={loading ? "Verifying…" : "Verify & Submit"}
                  />

                  <div className="flex justify-between items-center text-xs text-green-700 mt-1">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setErr(""); setOtp(""); }}
                      className="underline hover:text-green-900"
                      disabled={loading}
                    >
                      ← Change details
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      className="underline hover:text-green-900"
                      disabled={loading}
                    >
                      Resend code
                    </button>
                  </div>
                </motion.form>
              )}

              {/* ======= SUCCESS STATE ======= */}
              {success && (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center gap-4 py-8 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="text-6xl">🎉</div>
                  <h3 className="text-2xl font-black text-green-900">Message Sent!</h3>
                  <p className="text-green-700 text-sm max-w-xs">
                    Your message has been saved and our team will get back to you at <strong>{form.email}</strong> soon.
                  </p>
                  <div className="text-xs text-green-500 mt-1">A confirmation email has been sent to your inbox.</div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
