/**
 * Prints all participant invite links to stdout.
 * Usage: npx tsx scripts/generate-invite-links.ts [BASE_URL]
 * Example: npx tsx scripts/generate-invite-links.ts https://intelliaudit.vercel.app
 */
import { participants } from "../lib/participants"

const base = process.argv[2] ?? "http://localhost:3000"

console.log("name,email,group,org,invite_link")
for (const p of participants) {
  const name = `${p.firstName} ${p.lastName}`
  const link = `${base}/study/${p.token}`
  console.log(`"${name}","${p.email}","${p.group}","${p.org}","${link}"`)
}
