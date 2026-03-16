# APIs and Tools Research for Autonomous Marketing Agent

> Last updated: 2026-03-16
> Research methodology: Direct fetches from official documentation, GitHub repos, and Google developer docs.
> Where web verification was not possible, items are marked with [UNVERIFIED - based on pre-cutoff knowledge].

---

## 1. Google Ads API

### npm Package
- **Package:** `google-ads-api` (by Opteo)
- **Install:** `npm install google-ads-api`
- **GitHub:** https://github.com/Opteo/google-ads-api (323 stars)
- **API Version:** Google Ads API v23
- **TypeScript:** Full type definitions for all resources, enums, errors, and services

### Authentication
- **OAuth 2.0** is the only supported method
- Requires three credentials to initialize the client:
  - `client_id` (from Google Cloud Console)
  - `client_secret` (from Google Cloud Console)
  - `developer_token` (from Google Ads API Center)
- Per-customer configuration requires:
  - `customer_id` (required)
  - `refresh_token` (required)
  - `login_customer_id` (optional, for manager accounts)
  - `linked_customer_id` (optional)
- Helper: `listAccessibleCustomers(refreshToken)` to discover accounts

### Key Capabilities
- **Reporting/Reading:** Full GAQL (Google Ads Query Language) support via `.query()` and simplified `.report()` builder
- **Streaming:** `.reportStream()` (async iterator) and `.reportStreamRaw()` for large datasets
- **Mutations:** `.create()` methods for all resources, `.mutateResources()` for atomic multi-resource operations with temporary IDs
- **Queryable entities:** campaigns, ad groups, keywords, ads, bidding strategies, budgets, audiences, extensions, conversions, Performance Max campaigns
- **Utilities:** `toMicros()` for currency, `ResourceNames` helper, `parse()` for raw streams

### Access Levels & Approval Process
| Level | Daily Operations | Production Access | Approval Time |
|-------|-----------------|-------------------|---------------|
| **Test Account** | 15,000 | No (test only) | Automatic |
| **Explorer** | 2,880 | Yes (limited) | Auto or quick |
| **Basic** | 15,000 | Yes | ~2 business days |
| **Standard** | Unlimited (most services) | Yes (full) | ~10 business days |

- **Developer token:** 22-character alphanumeric string, obtained from API Center in a Google Ads manager account
- Company name required (individuals use "Individual")
- Website URL must be live and functional
- Generally one token per company

### Rate Limits
- Token Bucket algorithm, QPS-based per customer_id and developer_token
- Exact limits vary with server load (not published as fixed numbers)
- Error code: `RESOURCE_TEMPORARILY_EXHAUSTED` when exceeded
- Additional per-service quota restrictions may apply
- Best practices: batch operations, client-side throttling, message queues

### Pricing
- The API itself is **free** (you pay for ads, not API usage)
- Google Cloud project required (free tier sufficient for OAuth)

### Gotchas
- Explorer access restricts account creation, user management, and keyword planning tools
- All access levels face hourly rate limits in addition to daily caps
- Must maintain current contact info or risk losing access
- Test accounts cannot serve real ads
- Currency values are in micros (multiply by 1,000,000)

---

## 2. Meta Marketing API

### npm Package
- **Package:** `facebook-nodejs-business-sdk`
- **Install:** `npm install facebook-nodejs-business-sdk`
- **GitHub:** https://github.com/facebook/facebook-nodejs-business-sdk (580 stars, 243 forks)
- **API Version:** v25.0 (as of latest docs)

### Authentication
- **OAuth 2.0** with access tokens
- Initialize: `const api = adsSdk.FacebookAdsApi.init(accessToken)`
- Required setup:
  1. Register app on developers.facebook.com
  2. Add Marketing API product to the app
  3. Generate user or system user tokens with `ads_management` or `ads_read` permissions
- Recommended: Enable "App Secret Proof for Server API calls"
- For managing others' accounts: OAuth dialog with `ads_management` scope

### Key Capabilities
- **Campaign CRUD:** Create, read, update, delete campaigns
- **Ad Set management:** Configure targeting, budgets, scheduling
- **Ad management:** Create and manage individual ads
- **Audience management:** Build custom audiences, lookalike audiences
- **Creative management:** Upload and manage ad creatives
- **Reporting/Insights:** Access performance metrics via Insights API
- **Pagination:** Cursor-based with `.hasNext()`, `.hasPrevious()`, `.next()`, `.previous()`
- Field enums: `Campaign.Fields.name`, `Campaign.Status.paused`, etc.

### Access Tiers
| Tier | Rate Limit Score | Decay | Block Duration | Notes |
|------|-----------------|-------|----------------|-------|
| **Standard** | 60 points max | 300s | 300s | Auto-approved, dev only |
| **Advanced** | 9,000 points max | 300s | 60s | Requires App Review |

- Read operations = 1 point; Write operations = 3 points
- Advanced Access requirements: 1,500+ successful API calls in 15 days, error rate below 15%
- Business verification required for sensitive data access

### Rate Limits (Detailed)
- **QPS (mutations):** 100 requests/sec per app + ad account combination
- **BUC limits (Advanced tier examples):**
  - `ads_management`: 100,000+/hour
  - `ads_insights`: 190,000+/hour
  - `custom_audience`: 700,000/hour
- **Ad set budget changes:** Max 4 per hour per ad set
- Separate from Graph API limits
- Check headers: `X-Business-Use-Case`, `X-Ad-Account-Usage`

### Pricing
- API itself is **free** (you pay for ad spend)
- No API call charges

### Gotchas
- Standard access has very tight rate limits (60 points) -- basically only for development
- Must demonstrate 1,500 successful calls before getting Advanced access
- Requesting too many fields increases response time significantly
- Budget change limit (4/hour/ad set) can block rapid optimization
- Token expiry: user tokens expire; use long-lived tokens or system user tokens for automation

---

## 3. Google Search Console API

### npm Package
- **Package:** `googleapis` (official Google APIs client)
- **Install:** `npm install googleapis`
- **Service:** `google.searchconsole('v1')` and `google.webmasters('v3')`
- Also relevant: `google.indexing('v3')` for URL submission

### Authentication
- **OAuth 2.0** (user consent flow) or **Service Account** (server-to-server)
- Service account must be added as a user in Search Console with appropriate permissions
- Uses `google-auth-library` for JWT/OAuth flows
- Scopes: `https://www.googleapis.com/auth/webmasters`, `https://www.googleapis.com/auth/webmasters.readonly`

### Key Capabilities

#### Search Analytics (`searchanalytics.query`)
- **Read:** Search queries, clicks, impressions, CTR, average position
- **Filter by:** Country, device type, date range, page, query, search appearance
- **Group by:** Dimensions (query, page, device, country, date, searchAppearance)
- Up to 25,000 rows per query
- Sorted by click count descending by default

#### Sitemaps
- List, submit, retrieve, delete sitemaps for properties

#### Sites Management
- Add, remove, list, retrieve site properties

#### URL Inspection
- Check Google index status of specific URLs
- Returns indexing status, crawl info, AMP/mobile usability data
- Endpoint: `https://searchconsole.googleapis.com/v1`

#### URL Submission (via Indexing API)
- **Separate API:** Google Indexing API v3
- Notify Google of new/updated URLs
- Notify Google of removed URLs
- Check submission status
- Batch up to 100 calls in one HTTP request
- **LIMITATION:** Officially only for `JobPosting` and `BroadcastEvent` (VideoObject) structured data types
- Default quota: 200 submissions/day for onboarding
- Submissions undergo spam detection; abuse = access revocation

### Rate Limits
- Search Console API: [UNVERIFIED] Generally 1,200 queries/day per property, 600 queries/day per site
- Indexing API: 200/day default, can request increases

### Pricing
- **Free**

### Gotchas
- Indexing API is technically limited to JobPosting/BroadcastEvent content types (though some use it for other content)
- Search Analytics data has a 2-3 day delay (not real-time)
- URL Inspection has a different base URL than other Search Console endpoints
- Service account approach requires manual addition to Search Console users

---

## 4. Google Analytics 4 (GA4)

### npm Packages
- **Data API:** `@google-analytics/data` (official Node.js client)
- **Alternative:** `googleapis` package includes `google.analyticsdata('v1beta')`
- **Install:** `npm install @google-analytics/data`

### Authentication
- **Service Account** (recommended for server-side)
- **OAuth 2.0** (for user-delegated access)
- Uses `google-auth-library` (`JWT`, `OAuth2Client`)
- Service account must be granted "Viewer" role (minimum) in GA4 property

### Data API Capabilities

#### Report Types
| Method | Description |
|--------|-------------|
| `runReport` | Standard custom reports (preferred for simple queries) |
| `batchRunReports` | Multiple reports in single call |
| `runPivotReport` | Pivot table formatting |
| `runRealtimeReport` | Last 30 min (standard) or 60 min (GA360) |
| `runFunnelReport` | Funnel analysis (preview) |
| `getMetadata` | Available dimensions and metrics metadata |
| Audience Exports | User snapshots and recurring audience lists |

#### Available Data
- Dimensions: page path, source/medium, campaign, device category, country, city, event name, etc.
- Metrics: sessions, users, pageviews, events, conversions, revenue, engagement rate, bounce rate, etc.
- Real-time: events and usage from present to 30 minutes ago

### Rate Limits / Quotas
| Quota | Standard Property | Analytics 360 |
|-------|------------------|---------------|
| Core tokens/day | 200,000 | 2,000,000 |
| Core tokens/hour | 40,000 | 400,000 |
| Realtime tokens/day | 200,000 | 2,000,000 |
| Realtime tokens/hour | 40,000 | 400,000 |
| Funnel tokens/day | 200,000 | 2,000,000 |
| Concurrent requests | 10 | 50 |
| Demographic requests/hour | 120 | 120 |

- Most requests consume 10 or fewer tokens
- Token cost increases with: more rows, more columns, filter complexity, longer date ranges
- Daily quotas reset at midnight PST

### Measurement Protocol (Server-Side Tracking)
- **Purpose:** Send events from server directly to GA4
- **Authentication:** `measurement_id` + `api_secret` (generated in GA4 settings)
- **Endpoint:** `POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXX&api_secret=XXXXX`
- **Use cases:** Offline conversions, IoT devices, server-side events, supplementary tracking
- **Limitations:**
  - Meant to augment (not replace) client-side tracking
  - Some reserved event/parameter names cannot be used
  - Geographic/device data defaults to desktop/mobile if not provided
  - Event generation rules configured in UI don't trigger from MP events
  - Full server-only implementation yields incomplete analytics

### Pricing
- **Free** (GA4 standard)
- GA360: Enterprise pricing (starts ~$50k/year) [UNVERIFIED - pricing may have changed]

### Gotchas
- Measurement Protocol is supplementary only -- full server-side tracking produces gaps
- Data API quotas are token-based, not request-based -- complex queries consume more
- Realtime data limited to 30 min window (60 min for 360)
- Funnel reports are still in preview/alpha -- breaking changes possible

---

## 5. WordPress REST API

### npm Package
- **Package:** `wpapi` (node-wpapi)
- **Install:** `npm install wpapi`
- **GitHub:** https://github.com/WP-API/node-wpapi
- **Description:** Isomorphic JavaScript client for WordPress REST API (Node.js and browser)
- **Requires:** WordPress 5.0+

### Authentication Methods
1. **Application Passwords** (WordPress 5.6+, recommended for external apps)
2. **Basic HTTP Authentication** (username/password, requires plugin or Application Passwords)
3. **JWT Authentication** (via plugins like `jwt-auth` or `simple-jwt-login`)
4. **OAuth 1.0a** (via plugin)
5. **Nonce/Cookie Authentication** (for same-origin requests within WP admin)

### Key Capabilities

#### Supported Resources
Posts, Pages, Comments, Categories, Tags, Users, Media, Themes, Plugins, Settings, Blocks, Menus, Custom Post Types

#### CRUD Operations
```javascript
// Create
wp.posts().create({ title: 'New Post', content: '...', status: 'publish' })
// Read
wp.posts().id(123).get()
// Update
wp.posts().id(123).update({ title: 'Updated' })
// Delete
wp.posts().id(123).delete()
```

#### Media Management
- Upload images, videos, documents
- Set featured images on posts
- Retrieve media library items

#### Query Builder
- Chain methods: `.posts().perPage(10).page(2).order('asc').orderby('title')`
- Auto-discovery of custom routes from plugins

### SEO Plugin APIs

#### Yoast SEO
- Exposes SEO metadata via WordPress REST API on post/page objects
- Fields available in REST response: `yoast_head` (full HTML head), `yoast_head_json` (structured)
- Yoast SEO metadata (focus keyword, meta description, title) can be read/written via post meta fields
- Schema API: Extends JSON-LD schema output programmatically
- [UNVERIFIED] No standalone REST endpoint -- data is embedded in post responses

#### RankMath
- Provides REST API endpoints for SEO data
- [UNVERIFIED] Endpoint pattern: `/rankmath/v1/` namespace
- Can read/write: SEO title, description, focus keywords, robots meta, canonical URL, schema markup
- Requires authentication (Application Password or equivalent)

### Rate Limits
- WordPress itself has **no built-in rate limiting** on the REST API
- Rate limiting is handled at the server level (nginx, Apache, hosting provider)
- Plugins like `Limit Login Attempts` or WAF services can add limits
- Most managed hosts (WP Engine, Kinsta) impose their own limits [UNVERIFIED - varies by host]

### Pricing
- WordPress REST API is **free** (part of WordPress core)
- Yoast SEO plugin: Free version + Premium ($99/year) [UNVERIFIED - may have changed]
- RankMath: Free version + Pro ($59/year) [UNVERIFIED - may have changed]

### Gotchas
- Authentication is the biggest challenge -- Application Passwords are simplest but require HTTPS
- No built-in rate limiting means you need server-level protection
- Large media uploads may timeout depending on server config
- Custom post types need `show_in_rest => true` to be accessible
- Yoast/RankMath API behavior depends on plugin version and may change without notice
- Multisite requires per-site authentication

---

## 6. Twitter/X API

### npm Packages
- **Community (recommended):** `twitter-api-v2` by PLhery
  - Install: `npm install twitter-api-v2`
  - Latest version: 1.28.0 (Nov 2025)
  - Zero dependencies, 23kb minified+gzipped
  - Full v1.1 and v2 API coverage
  - TypeScript definitions included
- **Official (beta, not production-ready):** `@xdevplatform/twitter-api-sdk`
  - V2 only, TypeScript-first
  - 989 stars, but marked as beta
  - Not recommended for production use

### Authentication
- **OAuth 1.0a** (user-context, read/write)
- **OAuth 2.0** (user-context with PKCE, app-only bearer tokens)
- **Basic HTTP** (for some endpoints)
- Scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`, etc.

### Pricing Tiers (as of knowledge cutoff)
| Tier | Monthly Cost | Post Creation | Post Read | Key Limits |
|------|-------------|---------------|-----------|------------|
| **Free** | $0 | 1,500/month | Limited | Write-only focus, 1 app |
| **Basic** | $100/month | 3,000/month | 10,000/month | 2 apps |
| **Pro** | $5,000/month | 300,000/month | 1,000,000/month | 3 apps, full search |
| **Enterprise** | Custom | Custom | Custom | Full firehose access |

[UNVERIFIED - X has changed pricing multiple times; these figures are from early-mid 2025. Verify current pricing at developer.x.com before committing.]

### Key Capabilities
- Post tweets (text, media, polls, threads)
- Read timelines, user profiles, followers/following
- Stream real-time tweets (filtered and sampled)
- Media uploads (images, video, GIF) with chunked upload support
- Search tweets (recent and full archive at Pro+)
- Manage lists, bookmarks, likes, retweets
- Analytics: [UNVERIFIED] Basic engagement metrics on own tweets; detailed analytics may require Pro/Enterprise

### Rate Limits
- Per-endpoint, per-15-minute window (varies by tier)
- Free tier: Heavily restricted
- `twitter-api-v2` includes rate limit tracking plugin: `@twitter-api-v2/plugin-rate-limit`
- Auto-reconnect for streaming endpoints

### Gotchas
- **Pricing instability:** X has changed API pricing and terms multiple times since 2023. Budget for potential changes.
- **Free tier is nearly useless** for reading -- primarily write-only
- **Official SDK is beta** and not recommended; use the community `twitter-api-v2` package instead
- Analytics access is limited compared to the old v1.1 era
- Academic Research tier was discontinued
- Rate limits are strict at lower tiers and vary per endpoint
- Bot/automation labeling may be required by X's terms

---

## 7. Reddit API

### npm Package
- **Primary (archived):** `snoowrap`
  - Install: `npm install snoowrap`
  - GitHub: https://github.com/not-an-aardvark/snoowrap
  - **ARCHIVED** as of March 2024 -- read-only, no new updates
  - Still functional but no bug fixes or new feature support
- **Alternatives:** [UNVERIFIED]
  - `raw.js` -- lightweight Reddit API wrapper
  - Direct HTTP via `axios`/`fetch` to `oauth.reddit.com`

### Authentication
- **OAuth 2.0** (required for all API access)
- Two methods supported by snoowrap:
  1. **Script app:** `clientId`, `clientSecret`, `username`, `password`, `userAgent`
  2. **Refresh token:** `clientId`, `clientSecret`, `refreshToken`, `userAgent`
- Register app at https://www.reddit.com/prefs/apps
- `userAgent` is required and should be descriptive (Reddit blocks generic user agents)

### Key Capabilities
- Submit links and self-posts
- Comment on posts
- Upvote/downvote
- Retrieve front page, subreddit feeds, user profiles
- Search posts and comments
- Moderation tools (if moderator)
- Wiki page management
- Live thread streaming via websockets
- Auto token refresh
- Promise-based API with lazy loading

### Rate Limits
- **100 requests per minute** per OAuth client [UNVERIFIED - Reddit may have changed this]
- snoowrap has built-in request queueing when rate limited
- Automatic retry on failure
- Requires ES6 Proxy support (Node.js 6+)

### Pricing
- [UNVERIFIED] Reddit introduced API pricing in 2023:
  - Free tier for non-commercial use with lower limits
  - Paid tiers for commercial/high-volume use
  - Pricing caused significant controversy (third-party app shutdowns)
  - Exact current pricing is unclear -- verify at https://www.reddit.com/wiki/api

### Gotchas
- **snoowrap is archived** -- no maintenance, eventual compatibility issues likely
- No actively maintained full-featured Node.js SDK exists (as of research)
- Reddit aggressively blocks bots with poor user agents
- API terms changed significantly in 2023 -- commercial use requires paid access
- Posting too frequently triggers spam detection and potential account bans
- NSFW content handling requires explicit opt-in
- Subreddit-specific rules may restrict automated posting
- Consider building a thin wrapper over raw Reddit OAuth endpoints instead of depending on archived packages

---

## 8. MCP (Model Context Protocol)

### What Is MCP
MCP is an open protocol (by Anthropic) that allows AI agents/LLMs to securely connect to external tools and data sources. MCP servers expose tools, resources, and prompts that AI agents can invoke.

### Official Reference Servers
| Server | Package | Description |
|--------|---------|-------------|
| Fetch | `@modelcontextprotocol/server-fetch` | Web content fetching and conversion |
| Filesystem | `@modelcontextprotocol/server-filesystem` | File operations with access controls |
| Git | `@modelcontextprotocol/server-git` | Git repository operations |
| Memory | `@modelcontextprotocol/server-memory` | Knowledge graph persistent memory |
| Sequential Thinking | `@modelcontextprotocol/server-sequentialthinking` | Dynamic problem-solving |
| Everything | (reference/test) | Demonstrates all MCP features |

### Marketing-Relevant MCP Servers

#### Official Integrations
- **None specifically for Google Ads, Meta, GA4, Search Console, or social media** as official integrations (as of research)

#### Community / Third-Party
- **Apify MCP Server** -- Access 6,000+ web scraping tools for extracting data from websites, social media, search engines, e-commerce, maps
- **Amplitude MCP Server** -- Product analytics integration (charts, dashboards, experiments, metrics)
- **Paragon/ActionKit** -- Integrates with 130+ SaaS platforms (could include marketing tools)

#### Gaps (No Known MCP Servers)
As of this research, there are **no established MCP servers** specifically for:
- Google Ads
- Meta/Facebook Marketing API
- Google Analytics
- Google Search Console
- Twitter/X
- Reddit
- SEO tools (Ahrefs, Semrush, Moz)
- Image generation (DALL-E, Flux, Stable Diffusion)
- WordPress management

### Integration Pattern
```json
{
  "mcpServers": {
    "custom-marketing": {
      "command": "node",
      "args": ["./mcp-server.js"],
      "env": { "API_KEY": "..." }
    }
  }
}
```

### Building Custom MCP Servers
- SDK: `@modelcontextprotocol/sdk` (TypeScript/Node.js)
- Python: `mcp` package
- Define tools with input schemas, implement handlers
- Good fit for wrapping marketing APIs into agent-accessible tools

### Gotchas
- MCP ecosystem is young -- most marketing integrations need to be custom-built
- Archived servers exist in separate repo (github.com/modelcontextprotocol/servers-archived)
- Community servers may not be maintained long-term
- Security: MCP servers run locally and have access to credentials -- audit carefully

---

## 9. Image Generation APIs

### OpenAI DALL-E (DALL-E 3)

- **npm Package:** `openai`
- **Install:** `npm install openai`
- **Authentication:** API key (`OPENAI_API_KEY` env var)
- **Endpoint:** `client.images.generate()`

#### Capabilities
- Text-to-image generation (DALL-E 3)
- Image editing/inpainting (DALL-E 2 only)
- Image variations (DALL-E 2 only)
- Sizes: 1024x1024, 1024x1792, 1792x1024 (DALL-E 3)
- Quality: `standard` or `hd`
- Style: `vivid` or `natural`

#### Pricing [UNVERIFIED - check openai.com/pricing for current rates]
| Model | Quality | Size | Price |
|-------|---------|------|-------|
| DALL-E 3 | Standard | 1024x1024 | ~$0.040/image |
| DALL-E 3 | Standard | 1024x1792 | ~$0.080/image |
| DALL-E 3 | HD | 1024x1024 | ~$0.080/image |
| DALL-E 3 | HD | 1024x1792 | ~$0.120/image |

#### Rate Limits [UNVERIFIED]
- Tier-based: increases with account age and spend
- Typical: 5-7 images/min for new accounts, higher for established

#### Gotchas
- DALL-E 3 rewrites your prompt internally (expanded prompts returned in response)
- No programmatic image editing with DALL-E 3 (only DALL-E 2)
- Content policy filters may reject ad-related prompts with people, brands, logos
- Cannot generate text in images reliably (better than DALL-E 2 but still imperfect)

### Midjourney API

- **Official API:** [UNVERIFIED] Midjourney launched an API in late 2024/early 2025, but availability is limited
- **npm Package:** No official Node.js SDK
- **Access:** Historically Discord-bot-only; web/API access has been gradually rolling out
- **Unofficial wrappers exist** but violate ToS

#### Status [UNVERIFIED - verify at docs.midjourney.com]
- Midjourney has been working on an official API but rollout has been slow
- Previously only accessible via Discord bot commands
- Web interface launched in 2024
- API access may require enterprise/business tier
- Quality is excellent for creative/artistic imagery

#### Gotchas
- No reliable programmatic access for automation (as of pre-cutoff knowledge)
- Discord-based automation violates ToS
- If official API exists now, pricing/terms should be verified directly

### Stability AI (Stable Diffusion)

- **API:** https://platform.stability.ai
- **npm Package:** No official SDK; use HTTP requests via `axios`/`fetch`
- **Authentication:** API key in header

#### Models Available [UNVERIFIED - verify at stability.ai]
- Stable Diffusion XL (SDXL)
- Stable Diffusion 3 (SD3)
- Stable Image Core
- Various specialized models (upscaling, inpainting, etc.)

#### Capabilities
- Text-to-image
- Image-to-image
- Inpainting/outpainting
- Upscaling
- Style transfer
- Control-based generation (depth, edge, etc.)

#### Pricing [UNVERIFIED]
- Credit-based system
- Free tier: ~25 credits
- Paid plans start at ~$10/month
- Per-image costs vary by model and resolution

### Black Forest Labs FLUX

- **Models:** FLUX.1 [schnell], FLUX.1 [dev], FLUX.1 [pro]
- **API:** https://docs.bfl.ml (official) or via Replicate, fal.ai, Together AI
- **GitHub:** https://github.com/black-forest-labs/flux

#### Model Tiers
| Model | License | Speed | Quality | Use Case |
|-------|---------|-------|---------|----------|
| FLUX.1 [schnell] | Apache 2.0 | Fastest | Good | Rapid prototyping |
| FLUX.1 [dev] | Non-commercial | Medium | High | Development/research |
| FLUX.1 [pro] | Commercial API | Medium | Highest | Production use |

#### Specialized Models
- **Fill [dev]:** Inpainting/outpainting
- **Canny/Depth [dev]:** Structural conditioning
- **Redux [dev]:** Image variations
- **Kontext [dev]:** In-context image editing

#### Access
- Self-host open models (schnell/dev)
- API via BFL (pro models): https://docs.bfl.ml
- Third-party hosting: Replicate, fal.ai, Together AI

#### Gotchas
- Dev models are non-commercial license
- Pro model only available via API (not open-weight)
- Self-hosting requires significant GPU resources
- Quality rapidly improving -- may be best option for ad creative generation

### Quality Assessment for Ad Creatives
- No standard API exists for automated ad creative quality scoring
- Options:
  - Use GPT-4 Vision / Claude Vision to evaluate generated images
  - Meta's ad creative guidelines can be checked programmatically (aspect ratio, text overlay %)
  - Google Ads asset quality signals available via API after upload
  - A/B testing is the ultimate quality measure

---

## 10. SEO Tools APIs

### Ahrefs API

- **API Version:** v3 (v2 deprecated and archived Sept 2025)
- **Documentation:** https://docs.ahrefs.com
- **npm Package:** None official -- use HTTP requests
- **Authentication:** API token (Bearer token in header)

#### Capabilities [UNVERIFIED - based on general knowledge]
- Backlink data (referring domains, anchor text, new/lost backlinks)
- Organic keyword data (rankings, search volume, traffic estimates)
- Domain rating (DR) and URL rating (UR)
- Content explorer data
- Site audit data
- Keyword difficulty scores
- SERP analysis

#### Pricing [UNVERIFIED]
- API access tied to Ahrefs subscription plans
- Lite plan (~$99/month) includes limited API access
- Standard/Advanced/Enterprise plans include more API rows
- API usage measured in "rows" with monthly limits
- No standalone API pricing -- must have an Ahrefs subscription

#### Rate Limits [UNVERIFIED]
- Per-plan rate limits
- Typical: 1 request/second for lower plans
- Enterprise: Higher concurrency

#### Gotchas
- No official Node.js SDK -- must build HTTP wrapper
- V2 API was discontinued -- ensure you're using v3
- Row limits can be exhausted quickly with broad queries
- Expensive for heavy API usage

### Semrush API

- **Documentation:** https://developer.semrush.com
- **npm Package:** None official
- **Authentication:** API key parameter in requests

#### Capabilities [UNVERIFIED - based on general knowledge]
- Domain analytics (organic/paid traffic, keywords, competitors)
- Keyword research (volume, difficulty, CPC, trends)
- Backlink analytics (referring domains, anchors, pages)
- Position tracking
- Site audit data
- Advertising research (competitors' ads, ad copies)
- Content marketing data

#### Pricing [UNVERIFIED]
- API credits system ("API units")
- Included in Semrush subscription plans:
  - Pro (~$130/month): 10,000 API units/month [UNVERIFIED]
  - Guru (~$250/month): more units
  - Business (~$500/month): most units
- Additional API units can be purchased
- 1 request = 10 API units (varies by endpoint)

#### Rate Limits [UNVERIFIED]
- 10 requests/second typical
- Varies by plan and endpoint

#### Gotchas
- API units are consumed quickly for bulk operations
- Some endpoints return limited data on lower plans
- No official SDK in any language -- REST API only
- Historical data access varies by plan

### Moz API

- **API:** Moz Links API (formerly Mozscape)
- **Documentation:** https://moz.com/products/api
- **npm Package:** None official
- **Authentication:** API key (Moz Access ID + Secret Key)

#### Capabilities [UNVERIFIED]
- Domain Authority (DA) and Page Authority (PA)
- Spam Score
- Backlink data (linking domains, anchor text)
- Top pages by links
- Link intersect analysis
- Keyword data (via separate Keyword Explorer, may not have API)

#### Pricing [UNVERIFIED]
- Free tier: 10 requests/month, 2,500 rows/month [UNVERIFIED]
- Paid plans:
  - Standard: ~$99/month
  - Medium: ~$179/month
  - Large: ~$299/month
  - Premium: ~$599/month
- API access included in Moz Pro subscriptions

#### Rate Limits [UNVERIFIED]
- Free: 10 requests/month
- Paid: Varies, typically 10 requests/second with monthly row caps

#### Gotchas
- Moz's index is smaller than Ahrefs or Semrush
- DA/PA are Moz-proprietary metrics (not Google metrics)
- API has been through multiple versions -- ensure you're on the current Links API
- Keyword data API access may be limited compared to competitors

### Screaming Frog

- **API:** **No public API exists**
- Screaming Frog is a desktop application (Java-based crawler)
- Can be run from command line with configuration files
- Exports data as CSV/Excel
- Can be automated via command-line execution and file parsing

#### Automation Approach
```bash
# Command-line crawl
ScreamingFrogSEOSpider --crawl https://example.com --headless --save-crawl --export-tabs "Internal:All"
```
- Schedule via cron/Task Scheduler
- Parse exported CSV files programmatically
- License required ($259/year) [UNVERIFIED]

#### Gotchas
- No REST API -- strictly a desktop tool with CLI automation
- Must be installed on a machine with GUI support (even headless mode requires display server on Linux)
- Not suitable for real-time or on-demand API calls from a marketing agent
- Better alternatives for programmatic crawling: `axios` + `cheerio`, Puppeteer, or Apify

---

## Summary: Recommended Stack for Autonomous Marketing Agent

### Tier 1: Core (Well-Supported, Verified)
| Service | npm Package | Auth | Maturity |
|---------|-----------|------|----------|
| Google Ads | `google-ads-api` | OAuth 2.0 + Dev Token | Stable (v23) |
| Meta Marketing | `facebook-nodejs-business-sdk` | OAuth 2.0 | Stable (v25) |
| Google Search Console | `googleapis` | OAuth 2.0 / Service Account | Stable |
| GA4 Data API | `@google-analytics/data` | Service Account / OAuth | Stable |
| GA4 Measurement Protocol | Raw HTTP | API Secret + Measurement ID | Stable |
| WordPress | `wpapi` | App Passwords / JWT | Stable |
| OpenAI (DALL-E) | `openai` | API Key | Stable |

### Tier 2: Functional but Caveats
| Service | npm Package | Issue |
|---------|-----------|-------|
| Twitter/X | `twitter-api-v2` | Pricing instability, official SDK is beta |
| Flux Image Gen | Raw HTTP to BFL API | No official SDK, use via Replicate/fal.ai |
| Stability AI | Raw HTTP | No official Node SDK |

### Tier 3: Problematic / Manual Integration Required
| Service | Issue |
|---------|-------|
| Reddit | Only archived SDK (snoowrap), build custom wrapper |
| Midjourney | No reliable programmatic API |
| Ahrefs | No Node SDK, expensive, row limits |
| Semrush | No Node SDK, credit-based, expensive |
| Moz | No Node SDK, smaller index |
| Screaming Frog | No API at all |

### MCP Strategy
Since no marketing-specific MCP servers exist yet, the recommended approach is to:
1. Build custom MCP servers wrapping each API above
2. Use the `@modelcontextprotocol/sdk` package to create tool definitions
3. Each marketing API becomes a set of MCP tools the agent can invoke
4. This is actually an advantage -- purpose-built tools for the agent's specific needs
