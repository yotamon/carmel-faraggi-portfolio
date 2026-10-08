# Carmel Studio — operations and handoff

The public site and Carmel Studio share the same deployed ChatGPT Sites project.
Public routes: /, /work, /for-artists, /about and /contact.
Private content tools: /studio, /studio/content, /studio/covers, /studio/inbox, /studio/insights.

## Access and content
- Studio uses Sign in with ChatGPT **plus** the server-side `studio_admins` allowlist. A ChatGPT login alone cannot edit content.
- To grant access, verify the authorized email in `studio_admins`; the login user ID is bound after first successful sign-in. Do not disable authorization for convenience.
- Project editing is available in Studio, with draft, preview, publish, archive and reordering.
- Site Content edits home/about/artist/contact copy; Selected Covers can reorder, hide, describe and upload album artwork.
- No layout control is exposed to non-developers, intentionally preserving the design system.
- Uploaded images are resized and converted to WebP in the browser, stored in R2 and tracked in D1; a Cloudflare Images binding is optional.

## Contact enquiries
- Every valid form submission is stored in D1 `contact_submissions` and is accessible in /studio/inbox.
- Inbox status is stored separately in `studio_contact_state`. Use "MARK REPLIED" after emailing a contact.
- Optional alerts use the Resend HTTP API. Set `RESEND_API_KEY` as a secret, `CONTACT_FROM_EMAIL` to an address at a **verified sender domain**, and `CONTACT_NOTIFY_TO` to the approved recipient.
- Without the three settings, enquiries **still save to the inbox** but no email is sent.
- Contact submissions must never be included in public logs, analytics payloads or CDN caches.
- Verify message delivery with a controlled enquiry before relying on the alert system.

## Analytics
- First-party aggregate counts: `studio_event_counts` (day, event, path, total).
- No cookies, visitor identifiers, IP address or query string is stored by the app.
- Private Studio routes are excluded from tracking.
- Insights show indicative counts, not unique visitors. External CDN/hosting logs have their own privacy policies.

## SEO
- Public sitemap at /sitemap.xml; private paths excluded.
- /robots.txt references the dynamic sitemap.
- Canonical metadata for each public route, with project-specific Open Graph images.
- Structured data declares only public studio facts. Review marketing/legal accuracy before changing them.

## Quality and release
- The GitHub workflow validates lint, build and route checks on main.
- Confirm project pages, mobile menu, enquiry validation and one test upload in an authenticated Studio session.
- Cloudflare D1 binding is `DB`; R2 is `MEDIA`. Never commit Resend API keys or private user data.
- If the Sites deployment isn't configured to update from main automatically, republish using the connected Sites deployment process.
