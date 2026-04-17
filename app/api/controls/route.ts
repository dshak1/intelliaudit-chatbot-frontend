import { type NextRequest, NextResponse } from "next/server"

const backend = process.env.AUDIT_API_URL ?? "http://127.0.0.1:5049"

export async function GET(_request: NextRequest) {
  try {
    const res = await fetch(`${backend}/api/controls`, { method: "GET" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error("[controls proxy]", e)
    return NextResponse.json(
      { error: "Could not reach audit API. Start scripts/audit_api_server.py and set AUDIT_API_URL." },
      { status: 503 },
    )
  }
}
