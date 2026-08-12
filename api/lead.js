// api/lead.js — Dental Square → SmileOx CRM intake relay (Vercel serverless)
// ---------------------------------------------------------------------------
// Receives the free-consultation POST from the All-on-4 page and forwards it
// to the SmileOx intake address as a plain-text email whose body is the raw
// JSON payload (per the SmileOx "Integrate Website Form Intake" spec).
// Delivery is via the SMTP2GO HTTPS API (TLS enforced end to end).
//
// SET THESE as Environment Variables in Vercel, then redeploy:
//   SMTP2GO_API_KEY   (required)  SMTP2GO API key
//   INTAKE_ADDRESS    (required)  SmileOx intake email address
//   SMTP_FROM         (optional)  From header. Default: Dental Square <no-reply@dentalsquare.com.au>
//   ALLOW_ORIGIN      (optional)  CORS origin. Default: "*"
//
// Live test:  GET https://YOURSITE/api/lead  →  {"ok":false,"error":"Method not allowed"}
// ---------------------------------------------------------------------------

module.exports = async (req, res) => {
  const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "Method not allowed" }); return; }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== "object") body = {};

  // honeypot: pretend success, send nothing
  if (body.company) { res.status(200).json({ ok: true }); return; }

  const API_KEY = process.env.SMTP2GO_API_KEY;
  const TO = process.env.INTAKE_ADDRESS;
  const FROM = process.env.SMTP_FROM || "Dental Square <no-reply@dentalsquare.com.au>";
  const missing = [];
  if (!API_KEY) missing.push("SMTP2GO_API_KEY");
  if (!TO) missing.push("INTAKE_ADDRESS");
  if (missing.length) { res.status(500).json({ ok: false, error: "Server not configured", missing }); return; }

  // ---- build the SmileOx JSON payload: required keys + any extra form fields ----
  const clean = (x) => (x == null ? "" : String(x).trim());
  const payload = {};
  for (const k of Object.keys(body)) {
    if (k === "company") continue;              // honeypot never forwarded
    const val = clean(body[k]);
    if (val !== "") payload[k] = val;
  }
  payload.firstName = clean(body.firstName);
  payload.lastName = clean(body.lastName);
  payload.email = clean(body.email);
  payload.phoneNumber = clean(body.phoneNumber);
  payload.source = payload.source || "All-on-4 landing page (Meta ads)";
  payload.submittedAt = new Date().toISOString();

  if (!payload.firstName || !payload.email || !payload.phoneNumber) {
    res.status(400).json({ ok: false, error: "Missing required fields" });
    return;
  }

  // ---- send: plain-text body = JSON string, via SMTP2GO HTTPS API (TLS) ----
  try {
    const r = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Smtp2go-Api-Key": API_KEY },
      body: JSON.stringify({
        sender: FROM,
        to: [TO],
        subject: "Website form submission",
        text_body: JSON.stringify(payload)
      })
    });
    const out = await r.json().catch(() => ({}));
    const sent = r.ok && out && out.data && out.data.succeeded >= 1;
    if (!sent) {
      res.status(502).json({ ok: false, error: "Email send failed", detail: (out && out.data) || null });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: "Email send failed" });
  }
};
