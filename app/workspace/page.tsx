"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Upload, FileText, ImageIcon, Video, Database, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SiteLogo } from "@/components/site-logo"

type ComplianceStatus = "compliant" | "partially-compliant" | "non-compliant" | "processing" | "error"

interface ControlOption {
  id: string
  title: string
  category: string
}

interface ControlReference {
  controlId?: string
  title?: string
  category?: string
  objective?: string
  description?: string
  evidenceRequired?: string[]
  testingProcedures?: string[]
  complianceCriteria?: Record<string, unknown>
  nonComplianceCriteria?: Record<string, unknown>
}

interface AuditorPayload {
  status?: string
  confidence?: string
  summary?: string
  details?: string
  error?: string
  gaps?: string[]
  recommendations?: string[]
  evidenceFound?: string[]
}

interface DefenderPayload {
  suggestedStatus?: string
  confidence?: string
  summary?: string
  evidenceSupport?: string[]
  residualGaps?: string[]
  recommendations?: string[]
  details?: string
  error?: string
}

interface JudgePayload {
  finalStatus?: string
  confidence?: string
  summary?: string
  agreementWith?: string
  keyFactors?: string[]
  residualConcerns?: string[]
  recommendations?: string[]
  detailedReasoning?: string
}

interface EvidenceCitation {
  fileName: string
  excerpt: string
  score?: number
}

interface AuditAnalysis {
  controlReference?: ControlReference
  auditor?: AuditorPayload
  defender?: DefenderPayload
  judge?: JudgePayload
  evidenceCitations?: EvidenceCitation[]
}

type DocumentPreviewKind = "text" | "pdf" | "binary"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  status: "uploading" | "processing" | "completed"
  progress: number
  isoControl?: string
  complianceStatus?: ComplianceStatus
  agentDebate?: string[]
  error?: string
  analysis?: AuditAnalysis
  sourceFileId?: string
  workflowProfile?: string
  workflowLabel?: string
  workflowModel?: string
  localObjectUrl?: string
  previewKind?: DocumentPreviewKind
  textPreview?: string
  textPreviewTruncated?: boolean
  previewError?: string
}

interface FocusInsight {
  id: string
  title: string
  detail: string
  emphasis: "support" | "risk" | "neutral"
}

interface EvidenceAnchor {
  id: string
  citation: EvidenceCitation
  startLine: number
  endLine: number
  fragments: string[]
}

const NOISE_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "were",
  "when",
  "what",
  "have",
  "has",
  "been",
  "into",
  "their",
  "they",
  "them",
  "than",
  "then",
  "will",
  "would",
  "should",
  "could",
  "about",
  "across",
  "while",
  "under",
  "based",
  "using",
  "used",
  "which",
  "within",
  "evidence",
  "compliance",
  "control",
  "controls",
  "status",
  "judge",
  "auditor",
  "defender",
  "explanation",
  "explanations",
  "detail",
  "details",
  "agent",
  "note",
  "notes",
  "focus",
  "view",
  "required",
  "recommendation",
  "recommended",
  "action",
  "actions",
  "gap",
  "gaps",
  "unable",
  "determine",
  "parsing",
  "error",
  "errors",
  "retry",
  "review",
  "analyze",
  "analysis",
  "synthesize",
  "due",
  "iso",
  "txt",
])

const TEXT_PREVIEW_CHAR_LIMIT = 200_000
const TEXT_PREVIEW_EXTENSIONS = new Set(["txt", "md", "csv", "log", "json", "yaml", "yml", "xml", "ini", "conf", "cfg"])
const WORKFLOW_PROFILE_OPTIONS = [
  {
    id: "current",
    label: "Current workflow",
    detail: "Uses the backend default audit model stack.",
  },
  {
    id: "gemma4",
    label: "Gemma 4",
    detail: "Runs the same audit flow through the Gemma 4 profile.",
  },
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toOptionalText(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (Array.isArray(value)) {
    const joined = uniqueStrings(value).join("\n")
    return joined || undefined
  }
  return undefined
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const parsed = Number(toOptionalText(value))
  return Number.isFinite(parsed) ? parsed : undefined
}

function tryParseJsonString(value: string): unknown {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (!(trimmed.startsWith("[") || trimmed.startsWith("{") || trimmed.startsWith('"'))) return undefined
  try {
    return JSON.parse(trimmed)
  } catch {
    return undefined
  }
}

function splitListLikeString(value: string): string[] {
  const trimmed = value.trim()
  if (!trimmed) return []

  const lineItems = trimmed
    .split(/\r?\n+/)
    .map((item) => item.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean)
  if (lineItems.length > 1) return lineItems

  if (trimmed.includes(" • ")) {
    return trimmed
      .split(/\s*•\s*/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (trimmed.includes(";")) {
    return trimmed
      .split(/\s*;\s*/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return [trimmed]
}

function uniqueStrings(...groups: unknown[]): string[] {
  const s = new Set<string>()

  const visit = (value: unknown) => {
    if (value == null) return

    if (Array.isArray(value)) {
      for (const item of value) visit(item)
      return
    }

    if (typeof value === "string") {
      const parsed = tryParseJsonString(value)
      if (parsed !== undefined) {
        visit(parsed)
        return
      }

      for (const item of splitListLikeString(value)) {
        const trimmed = item.trim()
        if (trimmed) s.add(trimmed)
      }
      return
    }

    if (typeof value === "number" || typeof value === "boolean") {
      s.add(String(value))
      return
    }

    if (isRecord(value)) {
      if ("criteria" in value) {
        visit(value.criteria)
        return
      }
      if ("items" in value) {
        visit(value.items)
      }
    }
  }

  for (const group of groups) visit(group)
  return [...s]
}

function splitCriteriaString(value: string): string[] {
  const basic = splitListLikeString(value)
  if (basic.length > 1) return basic

  const source = value.trim()
  if (!source.includes(",")) return basic

  const parts: string[] = []
  let depth = 0
  let start = 0

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (char === "(") depth += 1
    if (char === ")" && depth > 0) depth -= 1
    if (char !== "," || depth > 0) continue

    const ahead = source.slice(index + 1).trim()
    const aheadPreview = ahead.split(/\s+/).slice(0, 8).join(" ")
    if (!/\b(is|are|has|have|lacks|includes|references|exists|documented|approved|published|accessible|reviewed|followed|defined|maintained|current)\b/i.test(aheadPreview)) {
      continue
    }

    parts.push(source.slice(start, index).trim())
    start = index + 1
  }

  parts.push(source.slice(start).trim())
  return parts.map((item) => item.trim()).filter(Boolean)
}

function humanizeKey(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function humanizeStatus(value?: string): string {
  if (!value) return "Not returned"
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusTone(value?: string): string {
  const normalized = (value || "").toLowerCase()
  if (normalized.includes("non")) return "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300"
  if (normalized.includes("partial") || normalized.includes("insufficient") || normalized.includes("error")) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
  if (normalized.includes("compliant")) return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  return "border-border bg-muted/60 text-muted-foreground"
}

function isReadableListEntry(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (/^[A-Za-z0-9]$/.test(trimmed)) return false
  if (!/\s/.test(trimmed) && /^[A-Za-z0-9_-]+$/.test(trimmed) && trimmed.length > 12) return false
  return true
}

function normalizeCriteriaRecord(value: unknown): Record<string, unknown> | undefined {
  if (isRecord(value)) return value
  const items = uniqueStrings(value)
  if (!items.length) return undefined
  return {
    criteria: items,
    num_criteria: items.length,
  }
}

function normalizeControlReference(raw: unknown): ControlReference | undefined {
  if (!isRecord(raw)) return undefined
  return {
    controlId: toOptionalText(raw.controlId ?? raw.control_id),
    title: toOptionalText(raw.title),
    category: toOptionalText(raw.category),
    objective: toOptionalText(raw.objective),
    description: toOptionalText(raw.description),
    evidenceRequired: uniqueStrings(raw.evidenceRequired ?? raw.evidence_required),
    testingProcedures: uniqueStrings(raw.testingProcedures ?? raw.testing_procedures),
    complianceCriteria: normalizeCriteriaRecord(raw.complianceCriteria ?? raw.compliance_criteria),
    nonComplianceCriteria: normalizeCriteriaRecord(raw.nonComplianceCriteria ?? raw.non_compliance_criteria),
  }
}

function normalizeAuditorPayload(raw: unknown): AuditorPayload | undefined {
  if (!isRecord(raw)) return undefined
  return {
    status: toOptionalText(raw.status),
    confidence: toOptionalText(raw.confidence),
    summary: toOptionalText(raw.summary),
    details: toOptionalText(raw.details),
    error: toOptionalText(raw.error),
    gaps: uniqueStrings(raw.gaps),
    recommendations: uniqueStrings(raw.recommendations),
    evidenceFound: uniqueStrings(raw.evidenceFound ?? raw.evidence_found).filter(isReadableListEntry),
  }
}

function normalizeDefenderPayload(raw: unknown): DefenderPayload | undefined {
  if (!isRecord(raw)) return undefined
  return {
    suggestedStatus: toOptionalText(raw.suggestedStatus ?? raw.suggested_status),
    confidence: toOptionalText(raw.confidence),
    summary: toOptionalText(raw.summary),
    evidenceSupport: uniqueStrings(raw.evidenceSupport ?? raw.evidence_support).filter(isReadableListEntry),
    residualGaps: uniqueStrings(raw.residualGaps ?? raw.residual_gaps),
    recommendations: uniqueStrings(raw.recommendations),
    details: toOptionalText(raw.details),
    error: toOptionalText(raw.error),
  }
}

function normalizeJudgePayload(raw: unknown): JudgePayload | undefined {
  if (!isRecord(raw)) return undefined
  return {
    finalStatus: toOptionalText(raw.finalStatus ?? raw.final_status),
    confidence: toOptionalText(raw.confidence),
    summary: toOptionalText(raw.summary),
    agreementWith: toOptionalText(raw.agreementWith ?? raw.agreement_with),
    keyFactors: uniqueStrings(raw.keyFactors ?? raw.key_factors).filter(isReadableListEntry),
    residualConcerns: uniqueStrings(raw.residualConcerns ?? raw.residual_concerns),
    recommendations: uniqueStrings(raw.recommendations),
    detailedReasoning: toOptionalText(raw.detailedReasoning ?? raw.detailed_reasoning),
  }
}

function normalizeEvidenceCitations(raw: unknown): EvidenceCitation[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!isRecord(item)) return null
      const fileName = toOptionalText(item.fileName ?? item.file_name)
      const excerpt = toOptionalText(item.excerpt ?? item.content)
      if (!fileName || !excerpt) return null
      const citation: EvidenceCitation = {
        fileName,
        excerpt,
      }
      const score = toOptionalNumber(item.score)
      if (score !== undefined) citation.score = score
      return citation
    })
    .filter((item): item is EvidenceCitation => Boolean(item))
}

function normalizeAuditAnalysis(raw: Record<string, unknown>): AuditAnalysis {
  return {
    controlReference: normalizeControlReference(raw.controlReference ?? raw.control_reference),
    auditor: normalizeAuditorPayload(raw.auditor),
    defender: normalizeDefenderPayload(raw.defender),
    judge: normalizeJudgePayload(raw.judge),
    evidenceCitations: normalizeEvidenceCitations(raw.evidenceCitations ?? raw.evidence_citations),
  }
}

function getFileExtension(name: string): string {
  const normalized = (name || "").toLowerCase()
  const dot = normalized.lastIndexOf(".")
  if (dot < 0 || dot === normalized.length - 1) return ""
  return normalized.slice(dot + 1)
}

function detectPreviewKind(type: string, name: string): DocumentPreviewKind {
  const ext = getFileExtension(name)
  if (type === "application/pdf" || ext === "pdf") return "pdf"
  if (type.startsWith("text/") || TEXT_PREVIEW_EXTENSIONS.has(ext)) return "text"
  return "binary"
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function extractKeywords(...inputs: (string | undefined)[]): string[] {
  const seen = new Set<string>()
  for (const input of inputs) {
    for (const token of (input || "").toLowerCase().match(/[a-z0-9][a-z0-9-]{2,}/g) || []) {
      if (NOISE_WORDS.has(token)) continue
      if (/^\d+(?:[.-]\d+)*$/.test(token)) continue
      if (seen.size >= 8) break
      seen.add(token)
    }
  }
  return [...seen]
}

function extractPhrases(...inputs: (string | undefined)[]): string[] {
  const phrases = new Set<string>()

  for (const input of inputs) {
    const tokens = (input || "")
      .toLowerCase()
      .match(/[a-z0-9][a-z0-9-]{2,}/g)
      ?.filter((token) => !NOISE_WORDS.has(token) && !/^\d+(?:[.-]\d+)*$/.test(token))

    if (!tokens?.length) continue

    for (let size = 2; size <= 3; size += 1) {
      for (let index = 0; index <= tokens.length - size; index += 1) {
        const phrase = tokens.slice(index, index + size).join(" ").trim()
        if (phrase.length < 12) continue
        phrases.add(phrase)
        if (phrases.size >= 8) return [...phrases]
      }
    }
  }

  return [...phrases]
}

function normalizeForDocumentMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/…/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractCitationFragments(excerpt: string): string[] {
  const lines = excerpt
    .replace(/…/g, "")
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter((line) => line.length >= 18 || line.split(/\s+/).length >= 4)

  if (lines.length > 0) return lines.slice(0, 4)

  const fallback = excerpt
    .replace(/…/g, "")
    .split(/\s+/)
    .slice(0, 12)
    .join(" ")
    .trim()

  return fallback.length >= 18 ? [fallback] : []
}

function buildFragmentCandidates(fragment: string): string[] {
  const cleaned = fragment.replace(/…/g, "").trim()
  if (!cleaned) return []

  const words = cleaned.split(/\s+/)
  const out = [cleaned]

  if (words.length > 10) out.push(words.slice(0, 10).join(" "))
  if (words.length > 10) out.push(words.slice(-10).join(" "))

  return [...new Set(out.filter((candidate) => normalizeForDocumentMatch(candidate).length >= 18))]
}

function buildTermPattern(term: string): string {
  const escaped = escapeRegex(term)
  if (/^[a-z0-9-]+$/i.test(term)) return `\\b${escaped}\\b`
  return escaped
}

function highlightText(text: string, terms: string[]): React.ReactNode {
  const cleaned = terms.filter((x) => x.trim().length >= 3)
  if (!text || cleaned.length === 0) return text

  const pattern = new RegExp(`(${cleaned.sort((a, b) => b.length - a.length).map(buildTermPattern).join("|")})`, "gi")
  const parts = text.split(pattern)

  if (parts.length === 1) return text

  return parts.map((part, idx) => {
    const isMatch = cleaned.some((term) => part.toLowerCase() === term.toLowerCase())
    if (!isMatch) return <span key={idx}>{part}</span>
    return (
      <mark key={idx} className="rounded bg-amber-300/70 px-0.5 text-foreground">
        {part}
      </mark>
    )
  })
}

function countCitationMatches(citation: EvidenceCitation, signals: string[]): number {
  if (!signals.length) return 0
  const haystack = `${citation.fileName} ${citation.excerpt}`.toLowerCase()
  let matches = 0
  for (const signal of signals) {
    if (haystack.includes(signal.toLowerCase())) matches += 1
  }
  return matches
}

function findEvidenceAnchors(textLines: string[], citations: EvidenceCitation[]): EvidenceAnchor[] {
  if (!textLines.length || !citations.length) return []

  const normalizedLines = textLines.map((line) => normalizeForDocumentMatch(line))
  const windowSize = 4
  const normalizedWindows = textLines.map((_, index) =>
    normalizeForDocumentMatch(textLines.slice(index, index + windowSize).join(" ")),
  )

  return citations
    .map((citation, citationIndex) => {
      const fragments = extractCitationFragments(citation.excerpt)
      const matchedRanges: Array<{ startLine: number; endLine: number; fragment: string }> = []

      for (const fragment of fragments) {
        let matched = false

        for (const candidate of buildFragmentCandidates(fragment)) {
          const target = normalizeForDocumentMatch(candidate)
          if (!target) continue

          const lineMatch = normalizedLines.findIndex(
            (line) => line.includes(target) || (target.includes(line) && line.length >= Math.min(target.length, 48)),
          )
          if (lineMatch >= 0) {
            matchedRanges.push({ startLine: lineMatch, endLine: lineMatch, fragment: candidate })
            matched = true
            break
          }

          const windowMatch = normalizedWindows.findIndex((windowText) => windowText.includes(target))
          if (windowMatch >= 0) {
            matchedRanges.push({
              startLine: windowMatch,
              endLine: Math.min(windowMatch + windowSize - 1, textLines.length - 1),
              fragment: candidate,
            })
            matched = true
            break
          }
        }

        if (matchedRanges.length >= 3 || matched) continue
      }

      if (!matchedRanges.length) return null

      return {
        id: `${citationIndex}-${matchedRanges[0].startLine}`,
        citation,
        startLine: Math.min(...matchedRanges.map((range) => range.startLine)),
        endLine: Math.max(...matchedRanges.map((range) => range.endLine)),
        fragments: [...new Set(matchedRanges.map((range) => range.fragment))],
      } satisfies EvidenceAnchor
    })
    .filter((anchor): anchor is EvidenceAnchor => Boolean(anchor))
}

function buildFocusInsights(analysis?: AuditAnalysis, agentDebate?: string[]): FocusInsight[] {
  if (!analysis && (!agentDebate || agentDebate.length === 0)) return []

  const insights: FocusInsight[] = []
  const cr = analysis?.controlReference
  const aud = analysis?.auditor
  const def = analysis?.defender
  const jug = analysis?.judge

  if (jug?.summary) {
    insights.push({ id: "judge-summary", title: "Final decision rationale", detail: jug.summary, emphasis: "neutral" })
  }

  for (const [idx, factor] of (jug?.keyFactors || []).entries()) {
    insights.push({
      id: `judge-factor-${idx}`,
      title: `Decision driver ${idx + 1}`,
      detail: factor,
      emphasis: "neutral",
    })
  }

  if (aud?.summary) {
    insights.push({ id: "auditor-summary", title: "Auditor explanation", detail: aud.summary, emphasis: "neutral" })
  }
  if (def?.summary) {
    insights.push({ id: "defender-summary", title: "Defender explanation", detail: def.summary, emphasis: "support" })
  }

  if (cr?.objective) {
    insights.push({ id: "control-objective", title: "Control objective", detail: cr.objective, emphasis: "neutral" })
  }
  if (cr?.description) {
    insights.push({
      id: "control-description",
      title: "Control description",
      detail: cr.description,
      emphasis: "neutral",
    })
  }
  for (const [idx, required] of (cr?.evidenceRequired || []).slice(0, 3).entries()) {
    insights.push({
      id: `required-evidence-${idx}`,
      title: `Required evidence ${idx + 1}`,
      detail: required,
      emphasis: "neutral",
    })
  }

  for (const [idx, gap] of uniqueStrings(aud?.gaps, def?.residualGaps, jug?.residualConcerns).entries()) {
    insights.push({ id: `gap-${idx}`, title: `Gap ${idx + 1}`, detail: gap, emphasis: "risk" })
  }

  for (const [idx, rec] of uniqueStrings(aud?.recommendations, def?.recommendations, jug?.recommendations).entries()) {
    insights.push({
      id: `recommendation-${idx}`,
      title: `Recommended next action ${idx + 1}`,
      detail: rec,
      emphasis: "support",
    })
  }

  for (const [idx, line] of (agentDebate || []).slice(0, 3).entries()) {
    insights.push({ id: `agent-note-${idx}`, title: `Agent note ${idx + 1}`, detail: line, emphasis: "neutral" })
  }

  return insights.slice(0, 18)
}

function isLowSignalInsight(insight?: FocusInsight): boolean {
  if (!insight) return true
  const text = `${insight.title} ${insight.detail}`.toLowerCase()
  return /(unable|error|parsing|retry|failed|review evidence|no detailed|synthesize)/.test(text)
}

function FocusDocumentPanel({
  fileName,
  previewKind,
  textPreview,
  textPreviewTruncated,
  localObjectUrl,
  evidenceCitations,
}: {
  fileName: string
  previewKind?: DocumentPreviewKind
  textPreview?: string
  textPreviewTruncated?: boolean
  localObjectUrl?: string
  evidenceCitations: EvidenceCitation[]
}) {
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [activeAnchorIndex, setActiveAnchorIndex] = useState(0)
  const textLines = textPreview != null ? textPreview.split(/\r?\n/) : []
  const anchors = previewKind === "text" ? findEvidenceAnchors(textLines, evidenceCitations) : []
  const anchorSignature = anchors.map((anchor) => `${anchor.startLine}-${anchor.endLine}`).join("|")
  const activeAnchor = anchors[activeAnchorIndex]
  const activeFragments = activeAnchor?.fragments || []

  useEffect(() => {
    if (previewKind !== "text") return
    setActiveAnchorIndex(0)
  }, [previewKind, textPreview, anchorSignature])

  useEffect(() => {
    if (previewKind !== "text") return
    if (!anchors.length) return
    if (activeAnchorIndex >= anchors.length) {
      setActiveAnchorIndex(0)
      return
    }
    if (activeAnchor == null) return
    const node = lineRefs.current[activeAnchor.startLine]
    if (node) node.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [previewKind, activeAnchorIndex, activeAnchor, anchorSignature, anchors.length])

  if (previewKind === "pdf" && localObjectUrl) {
    const searchTerm = extractCitationFragments(evidenceCitations[0]?.excerpt || "")[0] || ""
    const searchFragment = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
    return (
      <div className="rounded-lg border border-border bg-background/80 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document preview</p>
          <Button size="sm" variant="outline" asChild>
            <a href={localObjectUrl} target="_blank" rel="noreferrer">
              Open file
            </a>
          </Button>
        </div>
        <iframe
          title={`${fileName} preview`}
          src={`${localObjectUrl}#page=1&view=FitH${searchFragment}`}
          className="h-[540px] w-full rounded-md border border-border bg-background"
        />
      </div>
    )
  }

  if (previewKind === "text" && textPreview != null) {
    return (
      <div className="rounded-lg border border-border bg-background/80 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document preview</p>
          <div className="flex items-center gap-2">
            {anchors.length > 0 && (
              <>
                <Badge variant="secondary" className="text-[10px]">
                  Evidence {activeAnchorIndex + 1} / {anchors.length}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={anchors.length === 0}
                  onClick={() => setActiveAnchorIndex((prev) => (prev - 1 + anchors.length) % anchors.length)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={anchors.length === 0}
                  onClick={() => setActiveAnchorIndex((prev) => (prev + 1) % anchors.length)}
                >
                  Next
                </Button>
              </>
            )}
            {localObjectUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={localObjectUrl} target="_blank" rel="noreferrer">
                  Open file
                </a>
              </Button>
            )}
          </div>
        </div>

        {evidenceCitations.length > 0 && anchors.length === 0 && (
          <p className="mb-3 text-[11px] text-muted-foreground">
            Inline preview could not map the retrieved excerpts back to exact lines in this file. Use retrieved excerpts
            or open the file to inspect the evidence directly.
          </p>
        )}

        <div className="max-h-[540px] overflow-auto rounded-md border border-border bg-background/70 font-mono text-xs leading-5">
          {textLines.map((line, index) => {
            const isHit = anchors.some((anchor) => index >= anchor.startLine && index <= anchor.endLine)
            const isActive = Boolean(activeAnchor && index >= activeAnchor.startLine && index <= activeAnchor.endLine)
            return (
              <div
                key={index}
                ref={(node) => {
                  lineRefs.current[index] = node
                }}
                className={`grid grid-cols-[56px_1fr] gap-2 border-b border-border/40 px-2 py-1 transition-colors ${
                  isActive
                    ? "bg-amber-100/70 dark:bg-amber-500/20"
                    : isHit
                      ? "bg-amber-50/80 dark:bg-amber-500/10"
                      : "bg-transparent"
                }`}
              >
                <span className="select-none text-right text-[10px] text-muted-foreground">{index + 1}</span>
                <span className="whitespace-pre-wrap break-words">{highlightText(line || " ", activeFragments)}</span>
              </div>
            )
          })}
        </div>

        {textPreviewTruncated && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Preview is truncated to keep the UI responsive. Open file for the full content.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-background/80 p-4 text-sm text-muted-foreground">
      <p>Inline preview is unavailable for this file format.</p>
      {localObjectUrl && (
        <div className="mt-3">
          <Button size="sm" variant="outline" asChild>
            <a href={localObjectUrl} target="_blank" rel="noreferrer">
              Open file
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}

function FocusEvidencePanel({ file }: { file: UploadedFile }) {
  const analysis = file.analysis
  const complianceStatus = file.complianceStatus
  const citations = analysis?.evidenceCitations || []
  const insights = buildFocusInsights(analysis, file.agentDebate)
  const [activeInsightId, setActiveInsightId] = useState<string>(insights[0]?.id || "")
  const [rightPaneTab, setRightPaneTab] = useState<"document" | "excerpts">("document")

  useEffect(() => {
    if (!insights.length) {
      if (activeInsightId) setActiveInsightId("")
      return
    }
    if (!insights.some((item) => item.id === activeInsightId)) {
      setActiveInsightId(insights[0].id)
    }
  }, [insights, activeInsightId])

  const activeInsight = insights.find((item) => item.id === activeInsightId) || insights[0]
  const controlDrivenInputs = [
    analysis?.controlReference?.objective,
    analysis?.controlReference?.description,
    ...(analysis?.controlReference?.evidenceRequired || []).slice(0, 4),
    ...(analysis?.controlReference?.testingProcedures || []).slice(0, 2),
  ]
  const insightDrivenInputs = activeInsight ? [activeInsight.title, activeInsight.detail] : []
  const insightTerms = extractKeywords(...insightDrivenInputs)
  const insightPhrases = extractPhrases(...insightDrivenInputs)
  const controlTerms = extractKeywords(...controlDrivenInputs)

  const rankedCitations = [...citations]
    .map((citation) => ({
      citation,
      weighted:
        (citation.score || 0) +
        (isLowSignalInsight(activeInsight)
          ? countCitationMatches(citation, controlTerms) * 0.1
          : countCitationMatches(citation, insightPhrases) * 0.4 +
            countCitationMatches(citation, insightTerms) * 0.12 +
            countCitationMatches(citation, controlTerms) * 0.04),
    }))
    .sort((a, b) => b.weighted - a.weighted)
  const topCitations = rankedCitations.slice(0, 5)

  const hasDocumentPreview = Boolean(file.localObjectUrl || file.textPreview)
  if (!insights.length && !citations.length && !hasDocumentPreview) {
    return (
      <div className="rounded-xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
        No detailed evidence reasoning or previewable document content was returned for this run.
      </div>
    )
  }

  const statusLabel =
    complianceStatus === "compliant"
      ? "Compliant"
      : complianceStatus === "non-compliant"
        ? "Non-Compliant"
        : complianceStatus === "partially-compliant"
          ? "Partially Compliant"
          : "Processing"

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-background to-primary/[0.06] shadow-sm transition-all duration-300">
      <div className="border-b border-border bg-card/90 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
            Focus View
          </Badge>
          <Badge variant="outline">{statusLabel}</Badge>
          {topCitations.length > 0 && <Badge variant="secondary">{topCitations.length} cited passages</Badge>}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Select an explanation on the left, then inspect the cited passages we can map back into the source document.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <section className="min-w-0 border-b border-border p-4 lg:border-b-0 lg:border-r">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Compliance explanations
          </p>
          <div className="space-y-2 lg:max-h-[760px] lg:overflow-y-auto lg:pr-1">
            {insights.length === 0 && <p className="text-sm text-muted-foreground">No detailed explanation items available.</p>}
            {insights.map((item) => {
              const isActive = activeInsight?.id === item.id
              const tone =
                item.emphasis === "risk"
                  ? "border-amber-300/80 bg-amber-100/50 dark:bg-amber-950/30"
                  : item.emphasis === "support"
                    ? "border-emerald-300/80 bg-emerald-100/45 dark:bg-emerald-950/30"
                    : "border-border bg-muted/80"
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveInsightId(item.id)}
                  className={`min-h-11 w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-px hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone} ${isActive ? "ring-2 ring-ring/60 shadow-sm" : "opacity-90 hover:opacity-100"}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/80">{item.title}</p>
                  <p className="mt-1 text-sm text-foreground">{item.detail}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="min-w-0 p-4">
          {activeInsight && (
            <div className="mb-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/20 bg-background/80">
                  {activeInsight.title}
                </Badge>
                {topCitations.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    Showing cited evidence, not keyword matches
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-foreground">{activeInsight.detail}</p>
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document context</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => setRightPaneTab("document")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${rightPaneTab === "document" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Full document
              </button>
              <button
                type="button"
                onClick={() => setRightPaneTab("excerpts")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${rightPaneTab === "excerpts" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Retrieved excerpts
              </button>
            </div>
          </div>

          {rightPaneTab === "document" ? (
            <FocusDocumentPanel
              fileName={file.name}
              previewKind={file.previewKind}
              textPreview={file.textPreview}
              textPreviewTruncated={file.textPreviewTruncated}
              localObjectUrl={file.localObjectUrl}
              evidenceCitations={topCitations.map(({ citation }) => citation)}
            />
          ) : (
            <div className="space-y-3">
              {topCitations.length === 0 && <p className="text-sm text-muted-foreground">No evidence excerpts were returned.</p>}
              {topCitations.map(({ citation, weighted }, i) => (
                <div
                  key={`${citation.fileName}-${i}`}
                  className={`rounded-lg border p-3 transition-all duration-300 ${
                    i === 0
                      ? "border-primary/30 bg-primary/[0.08] shadow-sm"
                      : "border-border bg-background/90"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 break-all text-xs font-mono font-medium text-foreground">{citation.fileName}</p>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      relevance {weighted.toFixed(2)}
                    </Badge>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                    {highlightText(citation.excerpt, [...insightPhrases, ...insightTerms].slice(0, 8))}
                  </p>
                </div>
              ))}
            </div>
          )}

          {file.previewError && <p className="mt-2 text-xs text-amber-300">{file.previewError}</p>}
        </section>
      </div>
    </div>
  )
}

function formatCriteriaValue(v: unknown): string {
  if (v == null) return ""
  if (Array.isArray(v)) return uniqueStrings(v).join("; ")
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}

function CriteriaList({ title, data }: { title: string; data?: Record<string, unknown> }) {
  if (!data || typeof data !== "object") return null

  const items = splitCriteriaString(toOptionalText(data.criteria) || "").length
    ? splitCriteriaString(toOptionalText(data.criteria) || "")
    : uniqueStrings(data.criteria)
  const count = toOptionalNumber(data.num_criteria ?? data.numCriteria) ?? (items.length > 0 ? items.length : undefined)
  const extras = Object.entries(data)
    .filter(([key, value]) => !["criteria", "num_criteria", "numCriteria"].includes(key) && value != null && String(value).length > 0)
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value: formatCriteriaValue(value),
    }))
    .filter((entry) => entry.value)

  if (items.length === 0 && extras.length === 0) return null

  return (
    <div className="mt-3 rounded-lg border border-border/80 bg-background/70 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-medium text-foreground">{title}</p>
        {count != null && <Badge variant="secondary">{count} criteria</Badge>}
      </div>
      {items.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
      {extras.length > 0 && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {extras.map((entry) => (
            <div key={entry.label} className="rounded-md border border-border/70 bg-muted/40 px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{entry.label}</p>
              <p className="mt-1 text-xs text-foreground">{entry.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResultStageCard({
  label,
  status,
  confidence,
  summary,
}: {
  label: string
  status?: string
  confidence?: string
  summary?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{summary || "No structured summary returned."}</p>
        </div>
        {status && (
          <Badge variant="outline" className={getStatusTone(status)}>
            {humanizeStatus(status)}
          </Badge>
        )}
      </div>
      {confidence && (
        <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Confidence: {humanizeStatus(confidence)}
        </p>
      )}
    </div>
  )
}

function AuditDetailPanels({ analysis, agentDebate }: { analysis?: AuditAnalysis; agentDebate?: string[] }) {
  const cr = analysis?.controlReference
  const aud = analysis?.auditor
  const def = analysis?.defender
  const jug = analysis?.judge
  const cites = analysis?.evidenceCitations || []

  const allGaps = uniqueStrings(aud?.gaps, def?.residualGaps, jug?.residualConcerns)
  const allRecs = uniqueStrings(aud?.recommendations, def?.recommendations, jug?.recommendations)
  const strengths = uniqueStrings(aud?.evidenceFound, def?.evidenceSupport).filter(isReadableListEntry)
  const narrative = uniqueStrings(agentDebate).filter(isReadableListEntry)
  const executiveSummary = jug?.summary || aud?.summary || def?.summary || "Audit completed. Review the supporting sections below."
  const executiveSecondary =
    (jug?.summary && aud?.summary && jug.summary !== aud.summary ? aud.summary : def?.summary) || aud?.details || def?.details

  return (
    <div className="mt-4 space-y-4 text-sm">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-background p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/25 bg-background/85 text-primary">
            Assessment summary
          </Badge>
          {jug?.finalStatus && (
            <Badge variant="outline" className={getStatusTone(jug.finalStatus)}>
              {humanizeStatus(jug.finalStatus)}
            </Badge>
          )}
        </div>
        <p className="mt-3 text-base font-semibold text-foreground">{executiveSummary}</p>
        {executiveSecondary && <p className="mt-2 text-sm text-muted-foreground">{executiveSecondary}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {allGaps.length > 0 && <Badge variant="secondary">{allGaps.length} open gaps</Badge>}
          {allRecs.length > 0 && <Badge variant="secondary">{allRecs.length} next actions</Badge>}
          {cites.length > 0 && <Badge variant="secondary">{cites.length} retrieved excerpts</Badge>}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <ResultStageCard label="Auditor" status={aud?.status} confidence={aud?.confidence} summary={aud?.summary || aud?.details} />
        <ResultStageCard
          label="Defender"
          status={def?.suggestedStatus}
          confidence={def?.confidence}
          summary={def?.summary || def?.details}
        />
        <ResultStageCard label="Judge" status={jug?.finalStatus} confidence={jug?.confidence} summary={jug?.summary || jug?.detailedReasoning} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-4">
          {cr && (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Control reference (what {cr.controlId || "this control"} requires)
              </p>
              {cr.title && <p className="mt-2 text-base font-semibold text-foreground">{cr.title}</p>}
              {cr.objective && <p className="mt-1 text-sm text-muted-foreground">{cr.objective}</p>}
              {cr.evidenceRequired && cr.evidenceRequired.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Required evidence</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-foreground">
                    {cr.evidenceRequired.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              {cr.testingProcedures && cr.testingProcedures.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Testing / review procedures</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                    {cr.testingProcedures.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              <CriteriaList title="Compliance criteria (from framework)" data={cr.complianceCriteria} />
              <CriteriaList title="Non-compliance indicators (from framework)" data={cr.nonComplianceCriteria} />
            </div>
          )}

          {cites.length > 0 && (
            <div className="rounded-xl border border-border bg-card/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Document excerpts (retrieved chunks)
              </p>
              <div className="mt-3 space-y-3">
                {cites.map((c, i) => (
                  <div key={i} className="rounded-lg border border-border/80 bg-background/70 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="min-w-0 break-all text-xs font-mono font-medium text-foreground">{c.fileName}</p>
                      {c.score != null && <Badge variant="secondary">score {Number(c.score).toFixed(3)}</Badge>}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{c.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {allGaps.length > 0 && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Gaps &amp; what is not fully demonstrated
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-foreground">
                {allGaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {allRecs.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                What to collect or fix next
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-foreground">
                {allRecs.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {strengths.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Supporting points (from agents)
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                {strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {jug?.keyFactors && jug.keyFactors.length > 0 && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                Judge: decision drivers
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-foreground">
                {jug.keyFactors.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
          )}

          {aud?.details && (
            <div className="rounded-xl border border-border bg-card/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Auditor reasoning (detail)</p>
              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{aud.details}</p>
            </div>
          )}

          {aud?.error && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Auditor structured output error
              </p>
              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-foreground">{aud.error}</p>
            </div>
          )}

          {def?.error && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Defender structured output error
              </p>
              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-foreground">{def.error}</p>
            </div>
          )}

          {jug?.detailedReasoning && (
            <div className="rounded-xl border border-border bg-card/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Judge reasoning</p>
              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{jug.detailedReasoning}</p>
            </div>
          )}

          {narrative.length > 0 && (
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agent narrative (summary)</p>
              <div className="mt-3 space-y-2">
                {narrative.map((line, idx) => (
                  <p key={idx} className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuditDashboard() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [resultViewByFile, setResultViewByFile] = useState<Record<string, "overview" | "focus">>({})
  const [isDragging, setIsDragging] = useState(false)
  const [controls, setControls] = useState<ControlOption[]>([])
  const [controlId, setControlId] = useState("5.1")
  const [workflowProfile, setWorkflowProfile] = useState<(typeof WORKFLOW_PROFILE_OPTIONS)[number]["id"]>("current")
  const [controlsError, setControlsError] = useState<string | null>(null)
  const objectUrlRegistryRef = useRef<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetch("/api/controls")
      .then((r) => r.json())
      .then((data) => {
        if (data.controls?.length) {
          setControls(data.controls)
          setControlsError(null)
        } else if (data.error) {
          setControlsError(data.error)
        }
      })
      .catch(() => setControlsError("Could not load controls (is the audit API running?)"))
  }, [])

  const auditApiUnavailable = Boolean(controlsError)

  useEffect(() => {
    return () => {
      for (const url of objectUrlRegistryRef.current) {
        URL.revokeObjectURL(url)
      }
      objectUrlRegistryRef.current.clear()
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (auditApiUnavailable) return
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (auditApiUnavailable) return
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
      e.target.value = ""
    }
  }

  const openFilePicker = () => {
    if (auditApiUnavailable) return
    fileInputRef.current?.click()
  }

  const processFiles = async (fileList: File[]) => {
    const selectedWorkflow =
      WORKFLOW_PROFILE_OPTIONS.find((option) => option.id === workflowProfile) || WORKFLOW_PROFILE_OPTIONS[0]
    const newFiles: UploadedFile[] = fileList.map((file) => {
      const objectUrl = URL.createObjectURL(file)
      objectUrlRegistryRef.current.add(objectUrl)
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        status: "uploading",
        progress: 0,
        workflowProfile: selectedWorkflow.id,
        workflowLabel: selectedWorkflow.label,
        previewKind: detectPreviewKind(file.type, file.name),
        localObjectUrl: objectUrl,
      }
    })

    setFiles((prev) => [...prev, ...newFiles])

    for (let i = 0; i < newFiles.length; i++) {
      const file = fileList[i]
      const staged = newFiles[i]
      if (!file || !staged || staged.previewKind !== "text") continue

      void file
        .text()
        .then((raw) => {
          const limited = raw.length > TEXT_PREVIEW_CHAR_LIMIT ? raw.slice(0, TEXT_PREVIEW_CHAR_LIMIT) : raw
          setFiles((prev) =>
            prev.map((f) =>
              f.id === staged.id
                ? {
                    ...f,
                    textPreview: limited,
                    textPreviewTruncated: raw.length > TEXT_PREVIEW_CHAR_LIMIT,
                    previewError: undefined,
                  }
                : f,
            ),
          )
        })
        .catch(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === staged.id
                ? {
                    ...f,
                    previewError: "Could not read local file preview.",
                  }
                : f,
            ),
          )
        })
    }

    for (let i = 0; i < newFiles.length; i++) {
      const newFile = newFiles[i]
      const file = fileList[i]
      if (!file) continue

      try {
        setFiles((prev) => prev.map((f) => (f.id === newFile.id ? { ...f, progress: 25 } : f)))

        const formData = new FormData()
        formData.append("file", file)

        const upRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const upJson = await upRes.json()

        if (!upRes.ok || !upJson.success) {
          throw new Error(upJson.error || `Upload failed (${upRes.status})`)
        }

        setFiles((prev) =>
          prev.map((f) => (f.id === newFile.id ? { ...f, progress: 45, status: "processing" } : f)),
        )

        const anRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: upJson.fileId,
            controlId,
            workflowProfile: selectedWorkflow.id,
          }),
        })
        const anJson = await anRes.json()

        if (!anRes.ok || !anJson.success) {
          throw new Error(anJson.error || `Analysis failed (${anRes.status})`)
        }

        const rawStatus = toOptionalText(anJson.complianceStatus)
        const uiStatus =
          rawStatus === "compliant" ||
          rawStatus === "partially-compliant" ||
          rawStatus === "non-compliant" ||
          rawStatus === "processing"
            ? rawStatus
            : undefined
        const debate = uniqueStrings(anJson.agentDebate).filter(isReadableListEntry)
        const analysis = normalizeAuditAnalysis(anJson as Record<string, unknown>)

        setFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id
              ? {
                  ...f,
                  status: "completed",
                  progress: 100,
                  sourceFileId: upJson.fileId,
                  isoControl: anJson.isoControl || controlId,
                  workflowProfile: toOptionalText(anJson.workflowProfile) || selectedWorkflow.id,
                  workflowLabel: toOptionalText(anJson.workflowLabel) || selectedWorkflow.label,
                  workflowModel: toOptionalText(anJson.workflowModel),
                  complianceStatus: uiStatus || "partially-compliant",
                  agentDebate: debate.length ? debate : ["(No agent narrative returned)"],
                  analysis,
                }
              : f,
          ),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Request failed"
        setFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id
              ? {
                  ...f,
                  status: "completed",
                  progress: 100,
                  complianceStatus: "error",
                  error: msg,
                  agentDebate: [`Error: ${msg}`],
                }
              : f,
          ),
        )
      }
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (type.startsWith("video/")) return <Video className="h-5 w-5" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-5 w-5" />
    if (type.includes("csv") || type.includes("spreadsheet")) return <Database className="h-5 w-5" />
    return <FileText className="h-5 w-5" />
  }

  const getComplianceIcon = (status?: ComplianceStatus) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "partially-compliant":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-slate-300" />
      default:
        return null
    }
  }

  const getComplianceBadge = (status?: ComplianceStatus) => {
    const variants = {
      compliant: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "partially-compliant": "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "non-compliant": "bg-red-500/10 text-red-500 border-red-500/20",
      processing: "bg-primary/10 text-primary border-primary/20",
      error: "border-slate-400/25 bg-slate-400/10 text-slate-200",
    }

    const labels = {
      compliant: "Compliant",
      "partially-compliant": "Partially Compliant",
      "non-compliant": "Non-Compliant",
      processing: "Processing",
      error: "Request Failed",
    }

    if (!status) return null

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.16),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(124,58,237,0.14),transparent_22%),linear-gradient(180deg,#09090f_0%,#0f0f17_48%,#0a0a11_100%)]"
      />
      <header className="relative z-10 border-b border-white/10 bg-[#111116]/78 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <SiteLogo className="w-[168px] md:w-[200px]" imageClassName="block" priority />
            <Button variant="outline" className="border-white/12 bg-white/5 text-white/84 hover:bg-white/10 hover:text-white">
              View Reports
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <Card className="mb-6 border-white/10 bg-card/82 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-md">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
            <div>
              <label htmlFor="control-select" className="mb-2 block text-sm font-medium text-foreground">
                ISO 27001 control to audit
              </label>
              <select
                id="control-select"
                className="w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={controlId}
                onChange={(e) => setControlId(e.target.value)}
              >
                {controls.length === 0 ? (
                  <option value={controlId}>{controlId} (default)</option>
                ) : (
                  controls.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.title}
                    </option>
                  ))
                )}
              </select>
              {controlsError && <p className="mt-2 text-xs text-amber-300">{controlsError}</p>}
            </div>

            <div>
              <label htmlFor="workflow-profile-select" className="mb-2 block text-sm font-medium text-foreground">
                Audit workflow
              </label>
              <select
                id="workflow-profile-select"
                className="w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={workflowProfile}
                onChange={(e) => setWorkflowProfile(e.target.value as (typeof WORKFLOW_PROFILE_OPTIONS)[number]["id"])}
              >
                {WORKFLOW_PROFILE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                {WORKFLOW_PROFILE_OPTIONS.find((option) => option.id === workflowProfile)?.detail}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mb-8 border-2 border-dashed border-primary/25 bg-card/68 shadow-[0_32px_100px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-xl p-12 text-center transition-colors ${isDragging && !auditApiUnavailable ? "bg-primary/[0.08]" : "bg-transparent"} ${auditApiUnavailable ? "opacity-70" : ""}`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Upload Evidence Files</h3>
            <p className="mt-2 text-sm text-muted-foreground">PDF, Word, Excel, CSV, text (same formats as the Python pipeline)</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls,.log"
                onChange={handleFileInput}
                disabled={auditApiUnavailable}
                className="hidden"
              />
              <Button type="button" disabled={auditApiUnavailable} onClick={openFilePicker}>
                Choose Files
              </Button>
              <span className="text-sm text-muted-foreground">or drag and drop</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {auditApiUnavailable
                ? "Upload is disabled until the Python audit API is reachable."
                : "Max 100 MB per file. Large analyses can take several minutes."}
            </p>
          </div>
        </Card>

        {files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Uploaded Evidence ({files.length})</h2>
            <div className="space-y-3">
              {files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {getFileIcon(file.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-medium text-foreground">{file.name}</h3>
                            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            {(file.workflowLabel || file.workflowModel) && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {[file.workflowLabel, file.workflowModel].filter(Boolean).join(" · ")}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {file.isoControl && (
                              <Badge variant="secondary" className="font-mono">
                                {file.isoControl}
                              </Badge>
                            )}
                            {file.workflowLabel && (
                              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                                {file.workflowLabel}
                              </Badge>
                            )}
                            {getComplianceBadge(file.complianceStatus)}
                          </div>
                        </div>

                        {file.status !== "completed" && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {file.status === "uploading" ? "Uploading..." : "Running auditor / defender / judge..."}
                              </span>
                              <span className="text-muted-foreground">{file.progress}%</span>
                            </div>
                            <Progress value={file.progress} className="mt-2" />
                          </div>
                        )}

                        {file.status === "completed" && (
                          <div className="mt-4">
                            {file.error && (
                              <div className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                  Request error
                                </p>
                                <p className="mt-2 text-sm text-foreground">{file.error}</p>
                              </div>
                            )}
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {getComplianceIcon(file.complianceStatus)}
                                <span className="text-sm font-medium text-foreground">Audit breakdown</span>
                              </div>
                              <div className="inline-flex rounded-lg border border-border bg-muted/60 p-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResultViewByFile((prev) => ({
                                      ...prev,
                                      [file.id]: "overview",
                                    }))
                                  }
                                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${((resultViewByFile[file.id] || "overview") === "overview") ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                  Overview
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResultViewByFile((prev) => ({
                                      ...prev,
                                      [file.id]: "focus",
                                    }))
                                  }
                                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${((resultViewByFile[file.id] || "overview") === "focus") ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                  Focus View
                                </button>
                              </div>
                            </div>
                            {(resultViewByFile[file.id] || "overview") === "focus" ? (
                              <FocusEvidencePanel file={file} />
                            ) : (
                              <AuditDetailPanels analysis={file.analysis} agentDebate={file.agentDebate} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No evidence uploaded yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a control, then upload a document to run the real audit pipeline
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
