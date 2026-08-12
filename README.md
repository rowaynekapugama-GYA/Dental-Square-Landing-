# Dental Square — Google Ads landing pages

One Vercel project, five landing pages:

| Path | Page | Form? |
|---|---|---|
| `/all-on-4/` | All-on-4 & dental implants — META ADS variant | Yes — posts to `/api/lead` |
| `/all-on-4-google/` | All-on-4 & dental implants — GOOGLE ADS variant (identical, no form) | No — Centaur portal + phone |
| `/new-patients/` | New patient special $295 (warm white) | No — Centaur portal + phone |
| `/veneers/` | Porcelain veneers (warm white) | No — Centaur portal + phone |
| `/invisalign/` | Invisalign clear aligners (warm white) | No — Centaur portal + phone |
| `/cosmetic-dentistry/` | Cosmetic dentistry overview (warm white) | No — Centaur portal + phone |

Root `/` redirects to `/new-patients/`. Each footer has discrete switcher links.

## Deploy
Push to GitHub → import in Vercel (zero config; `api/lead.js` is auto-detected).
For the All-on-4 form, set env vars **SMTP2GO_API_KEY** and **INTAKE_ADDRESS**
(optionally SMTP_FROM, ALLOW_ORIGIN) then redeploy. Validate: GET `/api/lead`
returns `{"ok":false,"error":"Method not allowed"}` when live.

All pages are `noindex` while in review — remove the robots meta before indexing.
