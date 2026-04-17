import { type NextRequest, NextResponse } from "next/server"

const backend = process.env.AUDIT_API_URL ?? "http://127.0.0.1:5049"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const res = await fetch(`${backend}/api/upload`, {
      method: "POST",
      headers: { "ngrok-skip-browser-warning": "true" },
      body: formData,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error("[upload proxy]", e)
    return NextResponse.json(
      { success: false, error: "Upload failed — is the Python audit API running on AUDIT_API_URL?" },
      { status: 503 },
    )
  }
}
