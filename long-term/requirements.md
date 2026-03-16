# AdClaw Long-Term — Requirements

## Context
- Hackathon is over. Building for real, long-term use.
- Mac Mini running OpenClaw 24/7 (always-on agent)
- Side project: an astrology website
- Budget-constrained — agent must plan AND execute within budget

## What the Agent Must Do

### Organic Marketing
- SEO: Search Console monitoring, fix errors, optimize meta tags, internal linking
- Blog content: create blog posts for the astrology site
- Social presence: X (Twitter), Reddit, other platforms
- Content marketing across multiple channels

### Inorganic / Paid Marketing
- Google Ads: create, monitor, optimize campaigns
- Meta Ads: create, monitor, optimize campaigns
- Budget allocation and reallocation based on performance

### Human-in-the-Loop (Critical)
- **Creative requests**: Agent can't generate production-quality images yet. It should:
  - Communicate on Telegram what creative it needs (specs, dimensions, mood, text)
  - Human generates the image (AI tools or manual)
  - Human uploads to dashboard
  - Agent verifies, gives feedback, or approves
  - Agent then uses the approved creative in ads

- **Social posting from human accounts**: For authenticity, some posts must come from personal accounts
  - Agent creates the content (text, hashtags, timing)
  - Agent assigns a "task" to the human via dashboard
  - Human posts it from their account (X, Reddit, etc.)
  - Human provides the URL back to the agent
  - Agent tracks the post's performance

### Automation vs Human Tasks
- **Agent handles via API/MCP**:
  - Google Ads API, Meta Marketing API
  - Search Console API
  - GA4 / Analytics
  - Blog CMS API (WordPress/Ghost/whatever the astrology site uses)
  - SEO analysis tools

- **Human handles (agent creates task)**:
  - Image/creative generation and upload
  - Posting from personal social accounts (X, Reddit)
  - Approving ad spend above certain thresholds
  - Any action requiring personal login/auth

### Dashboard
- Task board: agent assigns tasks to human, human completes them
- Creative pipeline: request → upload → review → approve → deploy
- Campaign overview: all active campaigns, spend, ROAS
- Content calendar: what's being published where, when
- Performance reports: weekly/monthly with trends

## Tech Stack (Fixed)
- Mac Mini running OpenClaw daemon 24/7
- Telegram as primary communication channel
- Express.js API server (already built)
- GOAT Network for payments (if applicable)
