import { type NextRequest, NextResponse } from "next/server"
import { getParticipantByToken } from "@/lib/participants"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface SavePayload {
  token: string
  response_id?: string
  step_reached?: string
  background?: Record<string, string>
  survey_answers?: Record<string, unknown>
  completed?: boolean
}

export async function POST(request: NextRequest) {
  const body: SavePayload = await request.json()
  const { token, response_id, ...fields } = body

  const participant = getParticipantByToken(token)
  if (!participant) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  }

  const row = {
    participant_token: token,
    participant_first_name: participant.firstName,
    participant_last_name: participant.lastName,
    participant_email: participant.email,
    participant_group: participant.group,
    participant_org: participant.org,
    ...fields,
    updated_at: new Date().toISOString(),
  }

  // Upsert into Supabase via REST API (no SDK dependency needed)
  let url = `${SUPABASE_URL}/rest/v1/survey_responses`
  let method = "POST"

  if (response_id) {
    url = `${SUPABASE_URL}/rest/v1/survey_responses?id=eq.${response_id}`
    method = "PATCH"
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Prefer: response_id ? "return=representation" : "return=representation",
    },
    body: JSON.stringify(response_id ? row : { ...row, created_at: new Date().toISOString() }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[save-response]", err)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  const data = await res.json()
  const saved = Array.isArray(data) ? data[0] : data
  return NextResponse.json({ response_id: saved?.id ?? response_id })
}
