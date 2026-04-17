"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { getParticipantByToken, type Participant } from "@/lib/participants"
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react"

type Step = "welcome" | "background" | "task" | "survey" | "done"

interface BackgroundAnswers {
  experience: string
  iso_familiarity: string
  audit_tools: string
}

interface SurveyAnswers {
  sus: Record<number, number>
  most_valuable: string
  improvements: string
  would_use: string
  would_use_reason: string
  ai_trust: string
  overall_rating: number
}

const SUS_ITEMS = [
  "I think that I would like to use this system frequently.",
  "I found the system unnecessarily complex.",
  "I thought the system was easy to use.",
  "I would need the support of a technical person to be able to use this system.",
  "I found the various functions in this system were well integrated.",
  "I thought there was too much inconsistency in this system.",
  "I would imagine that most people would learn to use this system very quickly.",
  "I found the system very cumbersome to use.",
  "I felt very confident using the system.",
  "I needed to learn a lot of things before I could get going with this system.",
]

function ProgressBar({ step }: { step: Step }) {
  const steps: Step[] = ["welcome", "background", "task", "survey", "done"]
  const idx = steps.indexOf(step)
  const pct = Math.round((idx / (steps.length - 1)) * 100)
  return (
    <div className="h-0.5 w-full bg-white/10">
      <div
        className="h-full bg-[#a78bfa] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function LikertRow({
  index,
  label,
  value,
  onChange,
}: {
  index: number
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <p className="text-sm leading-6 text-white/80">
        <span className="mr-2 font-mono text-xs text-white/35">{index + 1}.</span>
        {label}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-white/38">Strongly disagree</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                value === n
                  ? "bg-[#8b5cf6] text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                  : "bg-white/8 text-white/55 hover:bg-white/14"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-white/38">Strongly agree</span>
      </div>
    </div>
  )
}

export default function StudyPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [step, setStep] = useState<Step>("welcome")
  const [saving, setSaving] = useState(false)
  const [responseId, setResponseId] = useState<string | null>(null)

  const [bg, setBg] = useState<BackgroundAnswers>({
    experience: "",
    iso_familiarity: "",
    audit_tools: "",
  })

  const [survey, setSurvey] = useState<SurveyAnswers>({
    sus: {},
    most_valuable: "",
    improvements: "",
    would_use: "",
    would_use_reason: "",
    ai_trust: "",
    overall_rating: 0,
  })

  useEffect(() => {
    const p = getParticipantByToken(token)
    if (!p) { router.replace("/404"); return }
    setParticipant(p)
  }, [token, router])

  const upsert = useCallback(
    async (patch: Record<string, unknown>) => {
      setSaving(true)
      try {
        const res = await fetch("/api/save-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, response_id: responseId, ...patch }),
        })
        const json = await res.json()
        if (json.response_id && !responseId) setResponseId(json.response_id)
      } catch { /* silent — localStorage is the fallback */ }
      setSaving(false)
    },
    [token, responseId],
  )

  if (!participant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090d]">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    )
  }

  const firstName = participant.firstName.split(" ")[0]

  // ── Welcome ─────────────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <Shell step={step}>
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8b5cf6]/18 text-[#cbb4ff]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white">
            Hi {firstName}, welcome.
          </h1>
          <p className="mt-4 text-lg leading-8 text-white/62">
            You've been invited to participate in a study evaluating{" "}
            <span className="text-white">IntelliAudit</span> — an AI-assisted ISO 27001
            compliance review tool.
          </p>
          <div className="mt-8 space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-left text-sm text-white/65">
            <p className="font-medium text-white">What to expect</p>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a78bfa]" /> 2 quick background questions (~1 min)</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a78bfa]" /> Use the IntelliAudit workspace (~15–20 min)</li>
              <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a78bfa]" /> Post-task feedback survey (~5 min)</li>
            </ul>
          </div>
          <p className="mt-6 text-sm text-white/40">
            Participant: {participant.firstName} {participant.lastName} · {participant.org}
          </p>
          <button
            type="button"
            onClick={() => { setStep("background"); upsert({ step_reached: "background" }) }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-medium text-[#130f1e] transition-transform hover:-translate-y-0.5"
          >
            Begin
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Shell>
    )
  }

  // ── Background ───────────────────────────────────────────────────────────────
  if (step === "background") {
    const ready = bg.experience && bg.iso_familiarity && bg.audit_tools
    return (
      <Shell step={step}>
        <div className="mx-auto max-w-xl">
          <StepLabel>Background</StepLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">A little about you.</h2>
          <p className="mt-3 text-base text-white/55">This helps us interpret the results by experience level.</p>

          <div className="mt-8 space-y-6">
            <SelectQuestion
              label="Years of experience in audit, compliance, or information security?"
              value={bg.experience}
              options={["Less than 1 year", "1–2 years", "3–5 years", "6–10 years", "10+ years"]}
              onChange={(v) => setBg((b) => ({ ...b, experience: v }))}
            />
            <SelectQuestion
              label="How familiar are you with ISO 27001?"
              value={bg.iso_familiarity}
              options={["Not familiar", "Heard of it", "Basic understanding", "Used it in practice", "Expert"]}
              onChange={(v) => setBg((b) => ({ ...b, iso_familiarity: v }))}
            />
            <SelectQuestion
              label="Have you used AI-assisted tools for audit or compliance work before?"
              value={bg.audit_tools}
              options={["Never", "Once or twice", "Occasionally", "Regularly"]}
              onChange={(v) => setBg((b) => ({ ...b, audit_tools: v }))}
            />
          </div>

          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              setStep("task")
              upsert({ step_reached: "task", background: bg })
            }}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-medium text-[#130f1e] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Shell>
    )
  }

  // ── Task ─────────────────────────────────────────────────────────────────────
  if (step === "task") {
    return (
      <Shell step={step}>
        <div className="mx-auto max-w-xl">
          <StepLabel>Task</StepLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Use IntelliAudit.</h2>
          <p className="mt-3 text-base leading-7 text-white/58">
            Open the workspace in a new tab. Upload one or more evidence files (policies, logs,
            spreadsheets), select an ISO 27001 control, and run an analysis. Spend at least
            10–15 minutes exploring the tool.
          </p>

          <div className="mt-8 space-y-3 rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-sm text-white/60">
            <p className="font-medium text-white">Suggested task</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4">
              <li>Upload any relevant document (a policy, procedure, or log file).</li>
              <li>Select a control — try <span className="text-[#c4b5fd]">5.1 Policies for information security</span>.</li>
              <li>Run the analysis and review the Auditor → Defender → Judge output.</li>
              <li>Try a second control or a different piece of evidence.</li>
            </ol>
          </div>

          <a
            href="/workspace"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-medium text-[#130f1e] transition-transform hover:-translate-y-0.5"
          >
            Open workspace
            <ExternalLink className="h-4 w-4" />
          </a>

          <div className="mt-8 rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/8 p-5 text-sm text-[#d4bbff]">
            Once you're done exploring, come back here and click Continue to share your feedback.
          </div>

          <button
            type="button"
            onClick={() => { setStep("survey"); upsert({ step_reached: "survey" }) }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            I'm done — take me to the survey
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Shell>
    )
  }

  // ── Survey ────────────────────────────────────────────────────────────────────
  if (step === "survey") {
    const susComplete = Object.keys(survey.sus).length === SUS_ITEMS.length
    const ready = susComplete && survey.most_valuable && survey.would_use && survey.overall_rating > 0

    return (
      <Shell step={step}>
        <div className="mx-auto max-w-2xl">
          <StepLabel>Feedback survey</StepLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Your experience with IntelliAudit.</h2>
          <p className="mt-3 text-base text-white/55">Rate each statement from 1 (strongly disagree) to 5 (strongly agree).</p>

          <div className="mt-8 space-y-3">
            {SUS_ITEMS.map((item, i) => (
              <LikertRow
                key={i}
                index={i}
                label={item}
                value={survey.sus[i] ?? 0}
                onChange={(v) => setSurvey((s) => ({ ...s, sus: { ...s.sus, [i]: v } }))}
              />
            ))}
          </div>

          <div className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80">Overall, how would you rate IntelliAudit? <span className="text-white/38">(1 = poor, 5 = excellent)</span></label>
              <div className="mt-3 flex gap-3">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSurvey((s) => ({ ...s, overall_rating: n }))}
                    className={`h-11 w-11 rounded-xl text-sm font-semibold transition-all ${survey.overall_rating === n ? "bg-[#8b5cf6] text-white shadow-[0_0_14px_rgba(139,92,246,0.4)]" : "bg-white/8 text-white/55 hover:bg-white/14"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <TextAreaQuestion
              label="What did you find most valuable about IntelliAudit?"
              placeholder="e.g. The Auditor → Defender → Judge structure, the cited evidence, …"
              value={survey.most_valuable}
              onChange={(v) => setSurvey((s) => ({ ...s, most_valuable: v }))}
            />

            <TextAreaQuestion
              label="What would you improve or change?"
              placeholder="Any friction, missing features, confusing elements…"
              value={survey.improvements}
              onChange={(v) => setSurvey((s) => ({ ...s, improvements: v }))}
            />

            <div>
              <label className="block text-sm font-medium text-white/80">Would you use IntelliAudit in your real audit or compliance work?</label>
              <div className="mt-3 flex gap-3">
                {["Yes", "Maybe", "No"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSurvey((s) => ({ ...s, would_use: opt }))}
                    className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${survey.would_use === opt ? "bg-[#8b5cf6] text-white" : "bg-white/8 text-white/55 hover:bg-white/14"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <TextAreaQuestion
              label="Why or why not? (optional)"
              placeholder="Any concerns around AI trust, workflow fit, accuracy, …"
              value={survey.would_use_reason}
              onChange={(v) => setSurvey((s) => ({ ...s, would_use_reason: v }))}
            />

            <div>
              <label className="block text-sm font-medium text-white/80">
                How comfortable are you trusting AI-generated audit findings as a starting point?
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Not comfortable at all",
                  "Slightly comfortable",
                  "Moderately comfortable",
                  "Very comfortable",
                  "Fully comfortable",
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSurvey((s) => ({ ...s, ai_trust: opt }))}
                    className={`rounded-xl px-4 py-2 text-sm transition-all ${survey.ai_trust === opt ? "bg-[#8b5cf6] text-white" : "bg-white/8 text-white/55 hover:bg-white/14"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!ready || saving}
            onClick={async () => {
              await upsert({ step_reached: "done", survey_answers: survey, completed: true })
              setStep("done")
            }}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-medium text-[#130f1e] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Submit feedback
          </button>
          {!ready && (
            <p className="mt-3 text-xs text-white/35">
              Please complete all rating items, the "most valuable" field, and whether you would use it.
            </p>
          )}
        </div>
      </Shell>
    )
  }

  // ── Done ──────────────────────────────────────────────────────────────────────
  return (
    <Shell step={step}>
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#22c55e]/15 text-[#4ade80]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white">Thank you, {firstName}.</h1>
        <p className="mt-4 text-lg leading-8 text-white/60">
          Your responses have been saved. Your feedback directly shapes how IntelliAudit evolves — we genuinely appreciate your time.
        </p>
        <p className="mt-6 text-sm text-white/35">
          You can close this tab.
        </p>
      </div>
    </Shell>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Shell({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.12]" />
      </div>
      <ProgressBar step={step} />
      <div className="relative z-10 px-6 py-16 md:py-24">
        {children}
      </div>
    </div>
  )
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm uppercase tracking-[0.22em] text-[#b799ff]">{children}</p>
  )
}

function SelectQuestion({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-white/80">{label}</label>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-xl px-4 py-2 text-sm transition-all ${
              value === opt
                ? "bg-[#8b5cf6] text-white shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                : "bg-white/8 text-white/55 hover:bg-white/14"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function TextAreaQuestion({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-white/80">{label}</label>
      <textarea
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#8b5cf6]/50 focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]/30"
      />
    </div>
  )
}
