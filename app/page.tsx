"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  FileStack,
  FolderTree,
  Gavel,
  GitBranch,
  Lock,
  PanelRightOpen,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Waypoints,
  Workflow,
} from "lucide-react"

import { SiteLogo } from "@/components/site-logo"

type ReviewModeId = "citations" | "challenge" | "signoff"

const evidenceFolders = [
  "Board policies",
  "Security procedures",
  "Access logs",
  "Asset inventory",
  "Incident records",
  "Previous audits",
]

const featureCards = [
  {
    title: "Control map",
    description:
      "Start from the control itself: required evidence, testing procedures, and non-compliance indicators.",
    kind: "map" as const,
  },
  {
    title: "Coverage graph",
    description:
      "See how one policy, one log export, and one spreadsheet connect to the same finding before review.",
    kind: "graph" as const,
  },
  {
    title: "Caseboard",
    description:
      "Keep the audit plan, evidence, gaps, and next actions together so the reviewer is never reconstructing context.",
    kind: "board" as const,
  },
  {
    title: "Workflow toggles",
    description:
      "Turn on walkthrough intake, counterevidence, sign-off, and export flows without changing the core review surface.",
    kind: "toggles" as const,
  },
]

const reviewModes = [
  {
    id: "citations" as const,
    label: "Cited evidence",
    title: "Trace every conclusion.",
    description:
      "Jump from the final status into the retrieved excerpt, then back out to the full document in the same review flow.",
    accent: "Every finding should stay attached to its source.",
  },
  {
    id: "challenge" as const,
    label: "Challenge pass",
    title: "Challenge every finding.",
    description:
      "The defender looks for mitigating evidence before the judge finalizes the result, so the workflow exposes disagreement instead of hiding it.",
    accent: "This is decision support, not a single-model guess.",
  },
  {
    id: "signoff" as const,
    label: "Reviewer sign-off",
    title: "Keep humans in control.",
    description:
      "Auditors see the rationale, the open gaps, and the next actions in one place before they approve or escalate.",
    accent: "The handoff is part of the product, not an afterthought.",
  },
]

const workflowModules = [
  {
    id: "walkthrough",
    name: "Walkthrough intake",
    owner: "Planning",
    description: "Gather company context and generate a tailored audit plan.",
    enabled: true,
  },
  {
    id: "counterevidence",
    name: "Counterevidence pass",
    owner: "Defender",
    description: "Look for mitigating evidence before a final determination.",
    enabled: true,
  },
  {
    id: "signoff",
    name: "Reviewer sign-off",
    owner: "Human-in-loop",
    description: "Route cited findings into a final approval or escalation step.",
    enabled: true,
  },
  {
    id: "reporting",
    name: "Report export",
    owner: "Delivery",
    description: "Package executive summary, evidence trail, and open gaps.",
    enabled: false,
  },
]

const moatPoints = [
  {
    title: "Control-aware from the start",
    detail:
      "The system is anchored to audit controls, required evidence, and testing procedures. That is more specific than a generic agent wrapper.",
  },
  {
    title: "Structured disagreement",
    detail:
      "Auditor, Defender, and Judge create an explicit review trail, which is harder to replace with a single prompt and easier to defend in practice.",
  },
  {
    title: "Evidence-native review UX",
    detail:
      "The real product layer is the review surface: citations, highlighted chunks, gap extraction, and sign-off-ready output for a human auditor.",
  },
]

const reportPillars = [
  {
    title: "Evidence-backed summary",
    detail: "Lead with the final status, then show why it was reached.",
  },
  {
    title: "Gap-first handoff",
    detail: "Make missing evidence and next actions obvious to the reviewer.",
  },
  {
    title: "Source-linked trail",
    detail: "Keep excerpts, source files, and reasoning tied together for follow-up.",
  },
]

function MeshGraphic() {
  return (
    <svg viewBox="0 0 260 180" className="h-full w-full">
      <g stroke="rgba(255,255,255,0.16)" strokeWidth="1.2">
        <line x1="32" y1="80" x2="86" y2="42" />
        <line x1="86" y1="42" x2="120" y2="72" />
        <line x1="120" y1="72" x2="156" y2="44" />
        <line x1="120" y1="72" x2="168" y2="108" />
        <line x1="168" y1="108" x2="214" y2="76" />
        <line x1="168" y1="108" x2="210" y2="144" />
        <line x1="86" y1="42" x2="92" y2="122" />
        <line x1="92" y1="122" x2="140" y2="136" />
        <line x1="140" y1="136" x2="210" y2="144" />
        <line x1="156" y1="44" x2="214" y2="76" />
        <line x1="32" y1="80" x2="92" y2="122" />
        <line x1="140" y1="136" x2="168" y2="108" />
      </g>
      {[
        { x: 32, y: 80, r: 4, fill: "#f5f5f5" },
        { x: 86, y: 42, r: 4, fill: "#22c55e" },
        { x: 120, y: 72, r: 4, fill: "#f5f5f5" },
        { x: 156, y: 44, r: 4, fill: "#f5f5f5" },
        { x: 168, y: 108, r: 6, fill: "#f5f5f5" },
        { x: 214, y: 76, r: 4, fill: "#a78bfa" },
        { x: 210, y: 144, r: 4, fill: "#f5f5f5" },
        { x: 92, y: 122, r: 4, fill: "#a78bfa" },
        { x: 140, y: 136, r: 4, fill: "#f5f5f5" },
      ].map((node, index) => (
        <circle key={index} cx={node.x} cy={node.y} r={node.r} fill={node.fill} />
      ))}
      <text x="54" y="28" fill="rgba(255,255,255,0.72)" fontSize="12">
        Control graph
      </text>
      <text x="176" y="166" fill="rgba(255,255,255,0.56)" fontSize="11">
        5.1
      </text>
    </svg>
  )
}

function FlowSwitch({
  checked,
  onClick,
}: {
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-[#8b5cf6]" : "bg-white/20"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}

function ReviewMock({ mode }: { mode: ReviewModeId }) {
  if (mode === "citations") {
    return (
      <div className="grid h-full grid-cols-[0.95fr_1.05fr] overflow-hidden rounded-[30px] bg-[#fbfbfd] text-[#191724]">
        <div className="border-r border-[#e7e3f5] p-6">
          <p className="text-sm font-semibold">Retrieved excerpts</p>
          <div className="mt-5 space-y-3 text-sm">
            {[
              "InfoSec policy approved by leadership",
              "Review cadence documented annually",
              "Scope covers employees and contractors",
            ].map((line, index) => (
              <div
                key={line}
                className={`rounded-2xl px-4 py-3 ${
                  index === 1 ? "bg-[#efe8ff] text-[#5b33c7]" : "bg-[#f5f5fa]"
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6">
          <p className="font-mono text-xs text-[#7b748f]">policy_information_security.pdf</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[#433e56]">
            <p>
              The organization maintains an information security policy approved by
              executive leadership and reviewed on a scheduled basis.
            </p>
            <p className="rounded-xl bg-[#e8f7ea] px-3 py-2 text-[#327445]">
              + Control intent is stated clearly and ownership is defined.
            </p>
            <p className="rounded-xl bg-[#f3ebff] px-3 py-2 text-[#6e41d9]">
              + Review cadence is referenced in section 4.2.
            </p>
            <p className="text-[#8e88a3]">
              Reviewer can expand into the full file without leaving the case.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "challenge") {
    return (
      <div className="grid h-full grid-cols-2 overflow-hidden rounded-[30px] bg-[#fbfbfd] text-[#191724]">
        <div className="border-r border-[#e7e3f5] p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Scale className="h-4 w-4 text-[#8b5cf6]" />
            Auditor
          </div>
          <div className="mt-5 rounded-2xl bg-[#fff2df] p-4">
            <p className="text-sm font-semibold text-[#8a5b04]">PARTIAL</p>
            <p className="mt-2 text-sm text-[#5c4a20]">
              Policy exists, but explicit annual review evidence is weak.
            </p>
          </div>
          <div className="mt-4 rounded-2xl bg-[#f5f5fa] p-4 text-sm text-[#59516f]">
            Open gap: locate review record or board approval minutes.
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-[#8b5cf6]" />
            Defender → Judge
          </div>
          <div className="mt-5 rounded-2xl bg-[#e8f7ea] p-4">
            <p className="text-sm font-semibold text-[#327445]">Mitigating evidence found</p>
            <p className="mt-2 text-sm text-[#327445]">
              Board agenda and revision log both support the review cadence.
            </p>
          </div>
          <div className="mt-4 rounded-2xl bg-[#efe8ff] p-4">
            <p className="text-sm font-semibold text-[#5b33c7]">Judge decision</p>
            <p className="mt-2 text-sm text-[#5b33c7]">
              Final status remains defendable because the challenge pass surfaced missing context before sign-off.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-full grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[30px] bg-[#fbfbfd] text-[#191724]">
      <div className="border-r border-[#e7e3f5] p-6">
        <p className="text-sm font-semibold">Reviewer queue</p>
        <div className="mt-5 space-y-4 text-sm">
          {[
            ["Control 5.1", "Ready for sign-off"],
            ["Control 5.24", "Needs one more citation"],
            ["Control 5.11", "Escalate asset gap"],
          ].map(([label, state], index) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-[#f5f5fa] px-4 py-3">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-[#7b748f]">{state}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  index === 0 ? "bg-[#e8f7ea] text-[#327445]" : "bg-[#efe8ff] text-[#5b33c7]"
                }`}
              >
                {index === 0 ? "Ready" : "Review"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm font-semibold">Decision packet</p>
        <div className="mt-5 space-y-3">
          {[
            "Final status with cited rationale",
            "Open gaps and recommended next actions",
            "Agent narrative and source trail",
            "Reviewer decision log",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#f5f5fa] px-4 py-3 text-sm text-[#59516f]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8b5cf6]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeaturePreview({ kind, workflowState, onToggle }: { kind: (typeof featureCards)[number]["kind"]; workflowState: Record<string, boolean>; onToggle: (id: string) => void }) {
  if (kind === "map") {
    return (
      <div className="rounded-[24px] bg-[#121217] p-6">
        <p className="text-sm leading-7 text-white/75">
          In <span className="text-[#b799ff] underline underline-offset-4">Control 5.1</span>, the reviewer checks whether the policy is{" "}
          <span className="text-white">approved by leadership</span>, whether it is{" "}
          <span className="text-white">communicated</span>, and whether a{" "}
          <span className="text-[#b799ff] underline underline-offset-4">review cadence</span> is evident.
        </p>
        <div className="mt-6 w-fit rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/78 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="font-medium text-white">Required evidence</p>
          <p className="mt-2 text-white/58">Policy approval, ownership, review schedule</p>
        </div>
      </div>
    )
  }

  if (kind === "graph") {
    return (
      <div className="h-[280px] rounded-[24px] bg-[#121217] p-5">
        <MeshGraphic />
      </div>
    )
  }

  if (kind === "board") {
    return (
      <div className="grid h-[280px] grid-cols-[1fr_1.1fr] gap-4 rounded-[24px] bg-[#121217] p-5">
        <div className="space-y-3">
          <div className="rounded-2xl border border-[#26543c] bg-[#122317] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6fd192]">Audit plan</p>
            <p className="mt-2 text-sm text-white/80">Verify approval, scope, and review cadence for 5.1.</p>
          </div>
          <div className="rounded-2xl border border-[#6a4ab2] bg-[#1a1426] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c6b0ff]">Evidence</p>
            <p className="mt-2 text-sm text-white/80">Policy PDF, revision log, board agenda extract.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-[#4a3b67] bg-[#18161f] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Open questions</p>
          <div className="mt-3 space-y-3">
            {[
              "Is there explicit executive approval?",
              "Can the reviewer confirm annual review timing?",
              "Do contractors fall within policy scope?",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white/6 px-3 py-2 text-sm text-white/74">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[280px] rounded-[24px] bg-[#121217] p-6">
      <p className="text-sm font-semibold text-white">Workflow modules</p>
      <div className="mt-5 space-y-4">
        {workflowModules.map((module) => (
          <div
            key={module.id}
            className="flex items-center justify-between gap-3 border-b border-white/8 pb-4 last:border-b-0 last:pb-0"
          >
            <div>
              <p className="text-sm text-white">
                {module.name} <span className="text-white/45">by {module.owner}</span>
              </p>
              <p className="mt-1 text-sm text-white/58">{module.description}</p>
            </div>
            <FlowSwitch checked={workflowState[module.id]} onClick={() => onToggle(module.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [activeReview, setActiveReview] = useState<ReviewModeId>("citations")
  const [workflowState, setWorkflowState] = useState<Record<string, boolean>>(
    Object.fromEntries(workflowModules.map((module) => [module.id, module.enabled])),
  )

  const currentReview = reviewModes.find((mode) => mode.id === activeReview) ?? reviewModes[0]

  const toggleWorkflow = (id: string) => {
    setWorkflowState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#09090d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_58%)]" />
        <div className="absolute left-[-12%] top-[20%] h-[480px] w-[480px] rounded-full bg-[#6d28d9]/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[8%] h-[420px] w-[420px] rounded-full bg-[#8b5cf6]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.14]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#09090d]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <SiteLogo className="w-[170px] md:w-[210px]" imageClassName="block" priority />

          <nav className="hidden items-center gap-8 text-sm text-white/62 md:flex">
            <a href="#workflow" className="transition-colors hover:text-white">
              Workflow
            </a>
            <a href="#review" className="transition-colors hover:text-white">
              Review
            </a>
            <a href="#moat" className="transition-colors hover:text-white">
              Why it holds
            </a>
            <a href="#reports" className="transition-colors hover:text-white">
              Reports
            </a>
          </nav>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/84 transition-colors hover:bg-white/10"
          >
            Open demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#9f7aea]/20 bg-[#9f7aea]/10 px-4 py-2 text-sm text-[#d9c7ff]">
              <Sparkles className="h-4 w-4" />
              IntelliAudit turns evidence review into a product surface
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">
              Compress audit prep into cited decisions.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
              Upload policies, logs, spreadsheets, and text evidence. IntelliAudit maps them to an ISO 27001 control,
              runs an Auditor → Defender → Judge workflow, and keeps the source document in view before a human signs off.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-full bg-[#a78bfa] px-5 py-3 text-sm font-medium text-[#130f1e] transition-transform hover:-translate-y-0.5"
              >
                Open current workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#moat"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium text-white/84 transition-colors hover:bg-white/10"
              >
                What differentiates it
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/52">
              <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">PDF, DOCX, XLSX, CSV, TXT, LOG</span>
              <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">Control-based audit workflow</span>
              <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">Human-in-the-loop review</span>
            </div>
          </div>

          <div className="relative mt-16">
            <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#111116] shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
              <div className="flex items-center gap-2 border-b border-white/8 px-5 py-4">
                <span className="h-3 w-3 rounded-full bg-[#f87171]" />
                <span className="h-3 w-3 rounded-full bg-[#fbbf24]" />
                <span className="h-3 w-3 rounded-full bg-[#4ade80]" />
                <div className="ml-3 flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/45">
                  <FolderTree className="h-3.5 w-3.5" />
                  IntelliAudit workspace
                </div>
              </div>

              <div className="grid gap-px bg-white/8 lg:grid-cols-[220px_minmax(0,1.15fr)_340px]">
                <div className="bg-[#1a1a21] p-4">
                  <div className="mb-4 flex items-center justify-between text-white/42">
                    <span className="text-xs uppercase tracking-[0.2em]">Evidence</span>
                    <Search className="h-4 w-4" />
                  </div>
                  <div className="space-y-2">
                    {evidenceFolders.map((folder, index) => (
                      <div
                        key={folder}
                        className={`rounded-xl px-3 py-2 text-sm ${
                          index === 1 || index === 3
                            ? "bg-white/8 text-white"
                            : "text-white/58"
                        }`}
                      >
                        {folder}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/42">Selected control</p>
                    <p className="mt-2 text-sm font-medium text-white">5.1 Policies for information security</p>
                    <p className="mt-2 text-sm text-white/58">
                      Reviewer is validating approval, ownership, scope, and review cadence.
                    </p>
                  </div>
                </div>

                <div className="bg-[#15151b]">
                  <div className="flex gap-2 border-b border-white/8 px-4 pt-4">
                    <div className="rounded-t-2xl bg-white/6 px-4 py-2 text-sm text-white">
                      Policy review memo
                    </div>
                    <div className="rounded-t-2xl px-4 py-2 text-sm text-white/36">Revision log</div>
                    <div className="rounded-t-2xl px-4 py-2 text-sm text-white/36">Control notes</div>
                  </div>

                  <div className="p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-3 py-1 text-xs text-[#d7c3ff]">
                      <FileSearch className="h-3.5 w-3.5" />
                      Focus view
                    </div>
                    <h2 className="mt-5 text-3xl font-semibold tracking-tight">5.1 can be reviewed in one pass.</h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
                      IntelliAudit retrieves the policy sections, review logs, and supporting artifacts that matter to the control,
                      then keeps those excerpts attached to the decision.
                    </p>
                    <div className="mt-6 space-y-4 text-sm leading-7 text-white/72">
                      <p>
                        A <span className="font-medium text-white">sending artifact</span> for the auditor might be an information security
                        policy, a revision log, or a board approval note.
                      </p>
                      <div className="rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-4 text-[#eadfff]">
                        “Policy approved by executive leadership and reviewed annually in section 4.2.”
                      </div>
                      <p>
                        The product value is not only the answer. It is the path from control → evidence → challenge → sign-off.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative bg-[#111116] p-4">
                  <div className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.14),transparent_60%),#18181f] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white/78">Coverage graph</p>
                      <Waypoints className="h-4 w-4 text-white/44" />
                    </div>
                    <div className="mt-3 h-[260px] rounded-[22px] bg-[#13131a] p-3">
                      <MeshGraphic />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mx-auto -mt-8 flex max-w-md justify-end pr-3 lg:absolute lg:-bottom-6 lg:right-7 lg:mt-0 lg:max-w-none lg:pr-0">
              <div className="w-full max-w-[290px] rounded-[30px] border border-white/10 bg-[#0f0f14] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Audit run</p>
                  <Clock3 className="h-4 w-4 text-white/44" />
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Auditor", "Initial finding synthesized"],
                    ["Defender", "Mitigating evidence searched"],
                    ["Judge", "Final status queued for sign-off"],
                  ].map(([label, detail]) => (
                    <div key={label} className="rounded-2xl bg-white/6 px-4 py-3">
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="mt-1 text-sm text-white/55">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#b799ff]">Workflow</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Built around the actual audit motion.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/64">
              IntelliAudit is strongest when the product surface follows the work: control selection, evidence retrieval,
              structured challenge, and handoff-ready review.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[30px] border border-white/10 bg-[#17171d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.24)]"
              >
                <div className="max-w-xl">
                  <h3 className="text-3xl font-semibold tracking-tight">{card.title}</h3>
                  <p className="mt-4 text-lg leading-8 text-white/64">{card.description}</p>
                </div>
                <div className="mt-8">
                  <FeaturePreview kind={card.kind} workflowState={workflowState} onToggle={toggleWorkflow} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="review" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#b799ff]">Review</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
                Defend every conclusion.
              </h2>
              <p className="mt-5 max-w-xl text-xl leading-9 text-white/66">
                The real interface is the review loop: cited evidence, structured challenge, and a final sign-off screen
                that keeps the auditor in control.
              </p>

              <div className="mt-10 space-y-3">
                {reviewModes.map((mode) => {
                  const active = currentReview.id === mode.id
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setActiveReview(mode.id)}
                      onMouseEnter={() => setActiveReview(mode.id)}
                      className={`block w-full rounded-[22px] border px-5 py-4 text-left transition-all ${
                        active
                          ? "border-white/14 bg-white/8"
                          : "border-transparent bg-transparent text-white/74 hover:bg-white/4"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 rounded-xl p-2 ${active ? "bg-[#8b5cf6]/18 text-[#ceb8ff]" : "bg-white/6 text-white/54"}`}>
                          {mode.id === "citations" ? (
                            <Search className="h-4 w-4" />
                          ) : mode.id === "challenge" ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <BadgeCheck className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xl font-semibold tracking-tight text-white">{mode.label}</p>
                          <p className="mt-2 text-base leading-7 text-white/62">{mode.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[36px] bg-[linear-gradient(135deg,#8b5cf6,#b79dff)] p-4 shadow-[0_35px_120px_rgba(91,51,199,0.3)] md:p-6">
              <div className="overflow-hidden rounded-[32px] bg-[#0d0d12] p-6 md:p-8">
                <div className="max-w-xl">
                  <p className="text-sm uppercase tracking-[0.22em] text-white/52">{currentReview.label}</p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">{currentReview.title}</h3>
                  <p className="mt-4 text-lg leading-8 text-white/66">{currentReview.accent}</p>
                </div>
                <div className="mt-8 h-[360px] rounded-[32px]">
                  <ReviewMock mode={currentReview.id} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="moat" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="rounded-[36px] border border-white/10 bg-[#121218] px-6 py-8 md:px-10 md:py-10">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.24em] text-[#b799ff]">Why It Holds</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                The moat is not “we have agents.”
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/64">
                The agent architecture is reusable. The harder layer is the combination of control-aware workflow,
                evidence mapping, reviewer UX, and human feedback loops that make outputs usable in an audit setting.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {moatPoints.map((point) => (
                <div key={point.title} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8b5cf6]/12 text-[#cbb4ff]">
                    {point.title.includes("Control") ? (
                      <Workflow className="h-5 w-5" />
                    ) : point.title.includes("Structured") ? (
                      <GitBranch className="h-5 w-5" />
                    ) : (
                      <PanelRightOpen className="h-5 w-5" />
                    )}
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight">{point.title}</h3>
                  <p className="mt-4 text-base leading-8 text-white/64">{point.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="reports" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#b799ff]">Reports</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              Deliver handoff-ready reports.
            </h2>
            <p className="mt-5 text-xl leading-9 text-white/64">
              A useful product does not stop at reasoning. It packages the final status, supporting excerpts, open gaps,
              and next actions into something a reviewer can actually use.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {reportPillars.map((pillar) => (
              <div key={pillar.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8b5cf6]/12 text-[#cbb4ff]">
                  {pillar.title.includes("summary") ? (
                    <Bot className="h-5 w-5" />
                  ) : pillar.title.includes("Gap") ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <FileStack className="h-5 w-5" />
                  )}
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">{pillar.title}</h3>
                <p className="mt-3 text-lg leading-8 text-white/64">{pillar.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 overflow-hidden rounded-[34px] border border-white/10 bg-[#14141b] shadow-[0_25px_90px_rgba(0,0,0,0.3)]">
            <div className="grid gap-px bg-white/8 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="bg-[#111116] p-5">
                <div className="rounded-2xl bg-white/6 px-4 py-3 text-sm text-white">
                  Executive summary
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {["Final status", "Evidence trail", "Open gaps", "Next actions", "Reviewer log"].map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-2xl px-4 py-3 ${
                        index === 2 ? "bg-[#8b5cf6]/14 text-[#d9c7ff]" : "text-white/56"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#17171d] p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-3 py-1 text-xs text-[#d7c3ff]">
                    Audit packet
                  </span>
                  <span className="rounded-full border border-[#1d6f44]/20 bg-[#14311f] px-3 py-1 text-xs text-[#8de0ad]">
                    Final status: defensible with follow-up
                  </span>
                </div>
                <h3 className="mt-6 text-3xl font-semibold tracking-tight">Control 5.1 review summary</h3>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-white/66">
                  Evidence supports the presence of a documented information security policy and executive approval.
                  Review cadence is supported, but the reviewer should confirm downstream communication coverage.
                </p>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[26px] bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">Key supporting excerpts</p>
                    <div className="mt-4 space-y-3 text-sm text-white/64">
                      <div className="rounded-2xl bg-white/5 px-4 py-3">
                        Policy approved by executive leadership in section 1.0.
                      </div>
                      <div className="rounded-2xl bg-white/5 px-4 py-3">
                        Revision history shows annual review cadence in section 4.2.
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[26px] bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">Open gaps and next actions</p>
                    <div className="mt-4 space-y-3 text-sm text-white/64">
                      <div className="rounded-2xl bg-white/5 px-4 py-3">
                        Confirm policy communication evidence for contractors.
                      </div>
                      <div className="rounded-2xl bg-white/5 px-4 py-3">
                        Attach one reviewer sign-off note to close the packet.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight">IntelliAudit</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/52">
              Product direction for an evidence-backed audit workspace: control selection, cited reasoning, structured challenge, and reviewer sign-off.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#workflow"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/10"
            >
              See workflow
            </a>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-full bg-[#a78bfa] px-4 py-2 text-sm font-medium text-[#130f1e] transition-transform hover:-translate-y-0.5"
            >
              Open current demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
