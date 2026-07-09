# Appearance Settings — Feature Guide (for the team)

*Plain-English explainer of everything under **Settings → Appearance**, how each feature differs, and a deep-dive on **Custom domains**. Grounded in what the prototype actually does today; competitor notes are training-knowledge recall, not verified fact.*

---

## What this group is

**Appearance** is where you control **how things look and which brand shows** — both inside the app for your team, and on the pages your customers (and, if you resell, your clients) see. After the Settings reorg it holds five features:

> **Navigation · Dashboards · Themes & display · Branding · White-label**

They're grouped together because they're all "look & feel." But they answer **three different questions**, and that's the key to not confusing them:

| Question | Features |
|---|---|
| How does the app look for **my own team**? | Navigation, Dashboards, Themes & display |
| How does **my brand** show to **my customers**? | Branding |
| How do I make the **whole platform** *my own product* for **my clients**? | White-label |

The simplest mental model: **Themes/Navigation/Dashboards = inward** (your team's workspace), **Branding = outward** (your customers' touchpoints), **White-label = resold** (your clients' own platform).

---

## The five at a glance

| Feature | What it styles | Who sees the result | Who can edit | Scope |
|---|---|---|---|---|
| **Navigation** | The sidebar menu (rename · reorder · hide/show · add custom links) | Your team, in-app | Admin (sets the default; each user can personalize their own) | Workspace default |
| **Dashboards** | The starting dashboard (and reports) layout | Your team, in-app | Admin (per role); each user can then customize | Per role |
| **Themes & display** | App theme (dark/light), density, accent, nav color, font, date/time format, landing page | Your team, in-app | Admin (workspace default); each user via *My preferences* | Workspace default + per user |
| **Branding** | Logo + brand colors on **customer-facing** pages — booking pages, emails, web forms | Your customers | Admin | Workspace |
| **White-label** | The **entire platform** rebranded — product name, favicon, custom domain, branded apps, reseller sub-accounts | Your resold clients (and their end-users) | Owner / Admin only | Workspace / per tenant |

---

## Each feature, in depth

### 1. Navigation
**What it does:** sets the **default sidebar** every new member starts with. You can **rename** items (e.g. "Contacts" → "Clients" — edit the label inline), **reorder** them (drag the ⠿ grip handle), **hide/show** items, and **add custom links** to external URLs (with your own label + icon). A user can still personalize their own sidebar; this is just the starting point.
**When to use:** tailor the app's language and surface area to your business (an agency might hide "Deals" and rename "Companies" to "Accounts").
**Why it's better than nothing:** new hires land in a workspace that already speaks your team's language, instead of the generic default.
**Different from Dashboards:** Navigation = *which screens exist and what they're called*; Dashboards = *what the home screen shows*.

### 2. Dashboards
**What it does:** sets the **starting dashboard (and reports) layout per role** — e.g. Sales Reps open to their pipeline + tasks, Managers to team performance, Execs to KPIs. Each user can then drag/resize/add widgets on top.
**When to use:** make sure each role sees what matters to them on day one.
**Why it's better:** the right numbers are front-and-centre per role, instead of one generic dashboard for everyone.
**Different from Themes:** Dashboards = *content/layout of the home screen*; Themes = *the visual skin of the whole app*.

### 3. Themes & display
**What it does:** the **app's own appearance for your team** — dark/light mode, row density (comfortable/compact), a brand-safe **accent** color (from curated presets), nav-bar color, UI font, date/time format, and the default landing page. Theme + density apply live; each user can still set their own in *My preferences*.
**When to use:** set sensible workspace defaults (e.g. dark mode, compact density, DD/MM/YYYY dates for a EU team).
**Why it's better:** consistent defaults across the team, while respecting personal preference.
**Important boundary:** this styles **the app you and your team use** — it does **not** restyle anything your customers see. The accent is limited to on-brand presets so the product never goes off its locked palette.

### 4. Branding
**What it does:** your **logo + brand colors** applied to the **customer-facing surfaces** nrtur generates for you — **booking pages, outbound emails, and web forms**. The live previews show a booking page, an email header, and a form using your brand.
**Who sees it:** your **customers/leads** — the people who book a call, get an email, or fill a form.
**When to use:** always, if you send emails / share booking links / embed forms. It's the baseline "make it look like us."
**Why it's better:** your prospects see *your* brand at every touchpoint, not nrtur's.
**Different from White-label:** Branding skins the **pages nrtur sends on your behalf**; White-label rebrands **the whole nrtur platform as if it were your own product** (a much bigger, premium step — see below).

### 5. White-label
**What it does:** rebrands the **entire platform** so it looks like *your* software, for **agencies/resellers** who give their clients their own login. It covers:
- **Product name** (replaces "nrtur" on the login portal, emails, public pages),
- **Logo & favicon** (logo + colors are **reused from Branding** — set once, used everywhere),
- **Custom domain** (`app.youragency.com` — see deep-dive),
- **Branded mobile apps** (iOS/Android under your name, with per-store build status),
- **SaaS / reseller mode** (sub-accounts console: provision a workspace per client, set pricing/markup, see consolidated MRR),
- **Tenant menu** (the default nav your tenants' sub-accounts get).
**Who sees it:** your **clients** (and their end-users) — they never see "nrtur" at all.
**When to use:** only if you **resell** nrtur to your own clients. A normal business uses Branding, not White-label.
**Access:** Owner/Admin only — it changes the whole platform identity.

---

## Deep-dive: Custom domains

A **custom domain** lets a page be served from **your own web address** instead of an nrtur address. It shows up in **two places**:

| Where | Default address | With a custom domain |
|---|---|---|
| **White-label portal** (the app your clients log into) | `tenants.nrtur.app` | `app.youragency.com` |
| **Funnels** (landing/lead pages you publish) | `go.nrtur.com/your-funnel` | `funnels.yourbrand.com` |

### How it works (the flow in the UI)
1. **Enter your domain** (e.g. `app.youragency.com`).
2. The UI shows the **DNS records to add** at your domain registrar (GoDaddy, Cloudflare, etc.):
   - a **CNAME** record pointing your domain at nrtur's host (so traffic reaches the right place), and
   - a **TXT** record (so nrtur can confirm you actually own the domain).
   Each value has a **copy** button.
3. You add those records at your registrar (DNS changes can take up to ~24h to propagate).
4. You click **Verify** — nrtur checks the records and flips the status to **Verified / Live**.
5. From then on, the portal/funnel loads from **your** domain.

*(In this prototype, verification is simulated — clicking Verify marks it live. The real product wires this to an actual DNS check + certificate issuance; the UI is the spec for that flow.)*

### What it's applicable for
- **Agencies/resellers** white-labeling the portal — clients log in at the agency's domain.
- **Anyone publishing funnels** who wants branded landing-page URLs.
It is **not** needed for ordinary internal use — your team doesn't care what the URL bar says.

### The benefits
- **Trust & credibility** — visitors/clients see a familiar, professional address (`app.youragency.com`), not a third-party one. People hesitate to log in or submit forms on an unfamiliar domain.
- **Brand consistency** — the URL is part of the brand; a custom domain removes the last "this is built on someone else's tool" tell.
- **Marketing/SEO** — funnels on your own domain build *your* domain's authority and look legit in ads.
- **For resellers, it's essential** — the whole white-label promise breaks if clients see "nrtur" in the address bar.

### When to use it
- Turn it on **for the white-label portal** the moment you start reselling to clients.
- Turn it on **per funnel** for any public campaign where the URL is seen by prospects (ads, email, social).
- Skip it for internal-only or quick-test funnels — the default `go.nrtur.com` link works fine there.

### Why it's better than the default link
The default `go.nrtur.com/...` or `tenants.nrtur.app` link **works**, but it advertises the underlying tool and looks generic. A custom domain is the difference between *"a page on some platform"* and *"this company's own site/portal."* For a reseller it's not a nicety — it's the product.

### How it's used (quick steps)
1. Decide the subdomain (`app.` for the portal, `funnels.` or `go.` for funnels).
2. Settings → Appearance → White-label → **Custom domain** (or a funnel's Settings → **Custom domain**).
3. Type the domain → copy the **CNAME** (and **TXT** for the portal) into your DNS provider.
4. Click **Verify** → wait for **Live**.
5. Share the new branded URL.

---

## How real products do this (research — recall, worth confirming)
- **Branding vs white-label is a real industry split.** Most CRMs let you put your logo/colors on customer-facing emails and pages (baseline). True white-label (rebranding the whole app, custom login domain, your own mobile apps, reselling) is a **premium/agency tier** — e.g. GoHighLevel built its business on it (custom domain + branded mobile app + SaaS-reseller billing, around the ~$497/mo tier). HubSpot/Salesforce keep their own brand on the app and only let you brand outward-facing assets.
- **Custom domains are standard for any "publish a page / portal" product** (funnel builders, help-desks, status pages, client portals). The CNAME + TXT-verify + auto-TLS flow shown here is the conventional pattern.
- **App-level theming (recolor the whole UI) is rare** — almost no major CRM lets you repaint its interface, which is why nrtur keeps Themes limited to dark/light + density + a curated accent rather than a free color picker.

---

## Quick "where do I go?" guide

| I want to… | Go to |
|---|---|
| Rename/hide sidebar items for my team | **Navigation** |
| Choose what each role's home screen shows | **Dashboards** |
| Set dark/light, density, date format for the app | **Themes & display** |
| Put my logo/colors on my booking pages, emails, forms | **Branding** |
| Make the whole platform *my* product for clients I resell to | **White-label** |
| Serve the portal / a funnel from my own web address | **Custom domain** (in White-label, or a funnel's Settings) |

---

*Companion docs: `docs/customization-research.md` (why the customization screens were consolidated), `docs/crm-system.md` (data model). The Appearance group lives in `SETTINGS_GROUPS` in `index.html`; White-label is `SettingsWhiteLabelPage`, Branding is `SettingsBrandingPage`, Themes is `SettingsThemesPage`.*
