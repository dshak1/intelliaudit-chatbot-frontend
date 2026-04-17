import { type NextRequest, NextResponse } from "next/server"

const backend = process.env.AUDIT_API_URL ?? "http://127.0.0.1:5049"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fetch(`${backend}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error("[analyze proxy]", e)
    return NextResponse.json(
      { success: false, error: "Analysis failed — is the Python audit API running?" },
      { status: 503 },
    )
  }
}
