# Wusool · وصول

**An English and Arabic relocation demo for Abu Dhabi.**

Wusool brings housing, residence planning, travel, banking, schools, and health cover into one conversational experience. Explore interactive service cards, build a sample relocation profile, and follow a fictional family journey from initial questions to an itemized quotation.

![Wusool homepage imagery](public/videos/wusool-hero-poster.jpg)

> **Demo status:** The assistant uses deterministic simulation logic. No AI API key, paid service, database, or environment file is required. Authentication, UAE PASS identity, provider matches, bookings, and quotations are demonstrations.

[Installation](#installation) · [Explore the demo](#explore-the-demo) · [Development](#development) · [Deployment](#deployment) · [Project structure](#project-structure)

## Features

- **Bilingual interface:** English and Arabic chat, with right-to-left layouts for Arabic.
- **Relocation planning:** Interactive comparisons and guided steps for homes, visas, travel, banking, schools, health insurance, and tax topics.
- **Profile onboarding:** A multi-step profile form, sample data, document metadata, readiness analysis, and 12 fictional partner profiles.
- **Family walkthrough:** Sarah’s sample document pack, relocation assessment, and illustrative service quotation.
- **Voice interaction:** Browser speech recognition where available, plus prerecorded English and Arabic voice demonstrations.
- **Browser persistence:** Saved conversations and demo accounts, with account-scoped onboarding drafts in the current tab.

## Technology

| Layer | Technology |
| --- | --- |
| Application | Next.js 16.3.8, App Router |
| Interface | React 19.2.8, TypeScript |
| Styling | Tailwind CSS 4, custom CSS |
| State | Zustand 5 |
| Icons | Lucide React |
| Quality checks | ESLint 9, TypeScript, Node.js assertion scripts |

## Installation

### Prerequisites

- **Node.js 20.9 or newer**, with npm.
- **Git**, to clone the repository.
- Internet access to install dependencies and download Google Fonts during the first build.

### 1. Clone the repository

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with the repository details from GitHub’s **Code** menu:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git hub71-project
cd hub71-project
```

If you downloaded a ZIP instead, extract it and open a terminal in the folder containing `package.json`.

### 2. Install dependencies

```bash
npm ci
```

This installs the exact dependency versions recorded in `package-lock.json`.

### 3. Start the development server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**. Changes to the source update automatically during development. Stop the server with `Ctrl+C`.

**Configuration:** There are no required environment variables. You can run the complete demo without creating `.env` or `.env.local`.

## Explore the demo

### Conversational planning

Start on `/` and choose a service card or enter a request such as:

```text
Find me a 2 bedroom apartment in Al Reem under 130,000 dirhams.
```

Switch to Arabic to explore the bilingual interface. **Play demo** plays a prerecorded sample; microphone input depends on the browser’s speech recognition support and permissions.

### Profile and partner analysis

1. Open `/login` and use the public sample account below, or create a local demo account at `/signup`.
2. Continue to `/profile` and choose **Fill with sample data**.
3. Review the profile and select **Analyse my profile**.
4. Explore `/analysis` to inspect readiness, document gaps, suggested next steps, and fictional partner matches.

| Sample account | Value |
| --- | --- |
| Name | Maya Hassan |
| Email | `maya@example.com` |
| Public demo code | `246810` |

The code is included intentionally for demonstrations. No email is sent and no real authentication takes place. `/uae-pass` previews an invented identity without connecting to UAE PASS.

### Routes

| Route | Purpose |
| --- | --- |
| `/` | Relocation chat and service cards |
| `/login` | Sample email sign-in |
| `/signup` | Local demo account creation |
| `/uae-pass` | Fictional UAE PASS identity preview |
| `/profile` | Profile onboarding and document metadata |
| `/analysis` | Readiness analysis and partner comparisons |
| `/api/chat` | Simulation endpoint: `GET` for status, `POST` for chat replies |

## Development

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Check source with ESLint |
| `npm run typecheck` | Generate Next.js route types and validate TypeScript |
| `npm test` | Run demo flow, authentication, onboarding, and voice checks |
| `npm run build` | Create a production build |
| `npm start` | Serve an existing production build |

Before submitting changes, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The checks use synthetic data and in-memory storage. They do not modify your browser’s saved demo state.

### Optional: regenerate the hero video

The finished video and poster are already included. To regenerate them from the project’s photographs, install Python 3 and FFmpeg, then run:

```bash
python3 scripts/generate-hero-video.py
```

Python and FFmpeg are only required for this optional media task.

## Deployment

### Run as a Node.js application

From the project root:

```bash
npm ci
npm run build
npm start
```

The production server listens on port `3000` by default. To use another port:

```bash
npm start -- --port 3001
```

For a hosting platform that supports Next.js, use `npm ci` as the install command and `npm run build` as the build command. For a Node.js server deployment, use `npm start` as the start command. No API keys or database provisioning are needed for this demo.

**Hosting requirement:** The chat API requires a server runtime. GitHub can host the repository, but GitHub Pages alone cannot run the complete application. Keep the `public/` assets and the Next.js configuration with the deployment.

## Project structure

```text
app/                         App Router pages, chat API, and global styles
components/                  Chat, service cards, account, and onboarding UI
lib/                         State stores, simulations, data, and validation
  ai/                        Mock assistant, catalogue, and request validation
public/                      Photography, audio, hero video, and button artwork
docs/
  ai/                        Assistant and service reference documentation
  design/                    Original Halcyon documentation and license
  hero-images.md             Generated imagery provenance
scripts/                     Demo checks and optional video generation
AGENTS.md                    Version-specific Next.js guidance for coding agents
package.json                 Dependencies and development commands
package-lock.json            Reproducible npm dependency versions
```

`node_modules/`, `.next/`, local environment files, deployment metadata, and generated TypeScript files are excluded from Git. They are installed or generated locally as needed.

## Data and demo boundaries

Demo accounts and chat state are stored in this browser’s `localStorage`. Profile drafts, analysis completion, and saved partners use `sessionStorage`, scoped to each demo account in the current tab. Signing out preserves the conversation. Clear the site’s browser storage to reset all local demo data.

Document selectors retain metadata such as file names and sizes; file contents are not read or uploaded. Use fictional or redacted information when exploring the demo. Chat requests are sent to this application’s `/api/chat` route, which runs the mock assistant. Browser speech recognition may use the browser provider’s remote speech service.

Provider references are static context. Prices, availability, eligibility, rankings, and simulated timelines do not represent live verification. The application does not issue visas, verify identity, make reservations, collect payments, or send provider referrals.

## Troubleshooting

| Problem | Resolution |
| --- | --- |
| Dependencies fail to install | Check `node --version`, then run `npm ci` from the project root. |
| Port `3000` is already in use | Run `npm run dev -- --port 3001` and open `http://localhost:3001`. |
| Google Font download fails during a build | Check connectivity to Google Fonts, then rerun `npm run build`. |
| Microphone input is unavailable | Allow microphone access in a supported browser, use **Play demo**, or type your request. |
| A previous demo session reappears | Clear this site’s browser storage to start with fresh data. |
| Production server cannot find a build | Run `npm run build` before `npm start`. |

## Credits and licensing

The application’s styles include adapted Halcyon design-system CSS. Its original [design documentation](docs/design/DESIGN.md) and [Uiverse Design System License](docs/design/LICENSE.md) are retained. [UAE PASS button artwork](public/branding/uae-pass/README.md) and [generated service imagery](docs/hero-images.md) have separate provenance notes.

No project-wide open-source license has been assigned. Third-party libraries and assets retain their respective licenses and terms.
# hub71ai-QBrain
