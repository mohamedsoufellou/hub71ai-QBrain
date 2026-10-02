import { DEMO_MODEL, runAssistant } from "@/lib/ai/assistant";
import { catalogueSummary } from "@/lib/ai/catalogue";
import { ChatError, validateRequest } from "@/lib/ai/validation";

export const runtime = "nodejs";
export const maxDuration = 120;
const MAX_BODY = 64000;
let active = 0;
let windowStart = 0;
let requests = 0;
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  return Response.json({ configured: true, model: DEMO_MODEL, mode: "simulation", catalogue: catalogueSummary() }, { headers });
}
async function readBody(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY) throw new ChatError("The conversation is too large. Start a shorter request.", 413);
  if (!request.body) throw new ChatError("Missing request body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY) { await reader.cancel(); throw new ChatError("The conversation is too large. Start a shorter request.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new ChatError("The request is not valid JSON."); }
}
export async function POST(request: Request) {
  let admitted = false;
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).origin !== new URL(request.url).origin) throw new ChatError("Cross-origin chat requests are not allowed.", 403);
    if (!request.headers.get("content-type")?.includes("application/json")) throw new ChatError("Send a JSON request.", 415);
    const { messages, context } = validateRequest(await readBody(request));
    if (Date.now() - windowStart > 60000) { windowStart = Date.now(); requests = 0; }
    if (active >= 3 || requests >= 20) throw new ChatError("The demo is handling several AI requests. Please try again shortly.", 429, "DEMO_RATE_LIMIT");
    active++; requests++; admitted = true;
    const reply = await runAssistant(messages, context);
    return Response.json(reply, { headers });
  } catch (error) {
    const failure = error instanceof ChatError ? error : new ChatError("The assistant could not complete the request. Please try again.", 500, "INTERNAL_ERROR");
    return Response.json({ error: failure.message, code: failure.code }, { status: failure.status, headers });
  } finally { if (admitted) active--; }
}
