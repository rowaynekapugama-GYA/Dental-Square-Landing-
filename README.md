# Dental Square — Google Ads landing pages

One Vercel project, three landing pages:

| Path | Page | Form? |
|---|---|---|
| `/all-on-4/` | All-on-4 & dental implants (dark liquid-glass) | Yes — posts to `/api/lead` |
| `/new-patients/` | New patient special $295 (warm white) | No — Centaur portal + phone |
| `/veneers/` | Porcelain veneers (warm white) | No — Centaur portal + phone |

Root `/` redirects to `/new-patients/`. Each footer has discrete switcher links.

## Deploy
Push to GitHub → import in Vercel (zero config; `api/lead.js` is auto-detected).
For the All-on-4 form, set env vars **SMTP2GO_API_KEY** and **INTAKE_ADDRESS**
(optionally SMTP_FROM, ALLOW_ORIGIN) then redeploy. Validate: GET `/api/lead`
returns `{"ok":false,"error":"Method not allowed"}` when live.

All pages are `noindex` while in review — remove the robots meta before indexing.
