# AdClaw — Ad Platform Setup Guide

> Step-by-step instructions to connect real Google Ads + Meta Ads test accounts to AdClaw.

---

## Table of Contents

1. [What You Need (Overview)](#1-what-you-need-overview)
2. [Google Ads API Setup](#2-google-ads-api-setup)
3. [Meta (Facebook) Marketing API Setup](#3-meta-facebook-marketing-api-setup)
4. [AdClaw Environment Variables](#4-adclaw-environment-variables)
5. [GOAT Network Setup (x402 + ERC-8004)](#5-goat-network-setup)
6. [GA4 Analytics Setup (Optional)](#6-ga4-analytics-setup)
7. [Telegram Bot Setup](#7-telegram-bot-setup)
8. [Verify Everything Works](#8-verify-everything-works)

---

## 1. What You Need (Overview)

| Service | Account Type | Cost | Approval Time | What You Can Do |
|---------|-------------|------|---------------|-----------------|
| **Google Ads** | Test account | Free | Instant | Create test campaigns (no real ad delivery) |
| **Meta Ads** | Dev mode | Free | Instant | Create real campaigns in PAUSED state |
| **GOAT Testnet3** | Testnet wallet | Free | Instant | x402 payments + ERC-8004 registration |
| **GA4** | Standard | Free | Instant | Track real page events |
| **Telegram** | Bot | Free | Instant | Chat interface |

**Total cost: $0** (all test/dev accounts)

---

## 2. Google Ads API Setup

### Step 2.1: Create a Google Ads Manager Account

1. Go to https://ads.google.com/home/tools/manager-accounts/
2. Click **Create a manager account**
3. Sign in with a Google account (use a personal one, not a work account)
4. Fill in:
   - Account name: `AdClaw Dev`
   - Primary use: `Manage other accounts`
   - Country: India
   - Timezone: IST
   - Currency: INR
5. Click **Submit**
6. Note your **Manager Customer ID** (format: XXX-XXX-XXXX, shown top-right)

### Step 2.2: Apply for Developer Token

1. In your manager account, go to: **Tools & Settings** (wrench icon) → **Setup** → **API Center**
   - Or directly: https://ads.google.com/aw/apicenter
2. Fill in the **API Access** form:
   - Company name: `AdClaw`
   - Company URL: any live URL (your GitHub profile works)
   - API contact email: your email
3. Accept Terms and Conditions
4. Click **Submit**
5. You'll get a **Developer Token** immediately with **Test Account Access** level
6. **Copy the 22-character developer token** (looks like: `ABcdeFGH93KL-NOPQ_STUv`)

> **Test Account Access** means you can ONLY use test accounts (not production). This is fine for our purposes.

### Step 2.3: Create a Test Client Account

1. In your manager account, go to **Accounts** → **Sub-accounts**
2. Click the **+** button → **Create new account**
3. Toggle **This is a test account** ON
4. Fill in:
   - Account name: `AdClaw Test Client`
   - Timezone: IST
   - Currency: INR
5. Click **Create**
6. Note the **Test Client Customer ID** (format: XXX-XXX-XXXX)

### Step 2.4: Create Google Cloud Project + OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Click **Select a project** → **New Project**
   - Name: `adclaw`
   - Click **Create**
3. Enable Google Ads API:
   - Go to https://console.cloud.google.com/apis/library
   - Search for **Google Ads API**
   - Click it → Click **Enable**
4. Create OAuth consent screen:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Select **External** → Click **Create**
   - App name: `AdClaw`
   - User support email: your email
   - Developer contact email: your email
   - Click **Save and Continue** through all steps
   - Click **Publish App** (or leave in testing mode — add your email as test user)
5. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **+ Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `AdClaw OAuth`
   - Authorized redirect URIs: add `https://developers.google.com/oauthplayground`
   - Click **Create**
   - **Copy the Client ID and Client Secret**

### Step 2.5: Generate a Refresh Token

1. Go to https://developers.google.com/oauthplayground/
2. Click the **gear icon** (top-right) → Check **Use your own OAuth credentials**
3. Enter your **Client ID** and **Client Secret** from Step 2.4
4. In the left panel, scroll to **Google Ads API v18** and select `https://www.googleapis.com/auth/adwords`
5. Click **Authorize APIs** → Sign in with the same Google account that owns the Ads manager
6. Click **Exchange authorization code for tokens**
7. **Copy the Refresh Token** (long string starting with `1//`)

### Step 2.6: Your Google Ads Credentials

You should now have:

```
GOOGLE_ADS_DEVELOPER_TOKEN=ABcdeFGH93KL-NOPQ_STUv     # From Step 2.2
GOOGLE_ADS_CLIENT_ID=123456789.apps.googleusercontent.com  # From Step 2.4
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx          # From Step 2.4
GOOGLE_ADS_REFRESH_TOKEN=1//xxxxxxxxxxxxxxx             # From Step 2.5
GOOGLE_ADS_CUSTOMER_ID=1234567890                       # Test Client ID (no hyphens) from Step 2.3
GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890                 # Manager ID (no hyphens) from Step 2.1
```

### Step 2.7: Test Google Ads Connection

```bash
# Install the Node.js client
cd /path/to/adclaw/server
npm install google-ads-api

# Quick test script
npx tsx -e "
const { GoogleAdsApi } = require('google-ads-api');

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
});

async function test() {
  // List campaigns (should return empty for new test account)
  const campaigns = await customer.query(
    'SELECT campaign.id, campaign.name, campaign.status FROM campaign'
  );
  console.log('Connected! Campaigns:', campaigns.length);
}

test().catch(console.error);
"
```

### What You Can Do with Test Account

| Action | Works? |
|--------|--------|
| Create campaigns | Yes |
| Create ad groups | Yes |
| Create keywords | Yes |
| Create responsive search ads | Yes |
| Set budgets and bids | Yes |
| Read campaign data | Yes |
| **Actually deliver ads** | **No** (test accounts never serve) |
| **Spend money** | **No** |

---

## 3. Meta (Facebook) Marketing API Setup

### Step 3.1: Register as Meta Developer

1. Go to https://developers.facebook.com/
2. Click **Get Started** (top-right)
3. Log in with your Facebook account
4. Accept the Meta Developer Agreement
5. Verify your account (phone number or email)

### Step 3.2: Create a Meta App

1. Go to https://developers.facebook.com/apps/creation/
2. Click **Create App**
3. Select use case: **Other** → **Next**
4. App type: **Business** → **Next**
5. Fill in:
   - App name: `AdClaw`
   - Contact email: your email
   - Business portfolio: select yours or skip
6. Click **Create App**
7. Note your **App ID** and **App Secret** from the app dashboard (Settings → Basic)

### Step 3.3: Add Marketing API to Your App

1. In your app dashboard, click **Add Product** in the left sidebar
2. Find **Marketing API** and click **Set Up**
3. This enables Marketing API access for your app

### Step 3.4: Get Your Ad Account ID

1. Go to https://adsmanager.facebook.com/
2. If you don't have an ad account, it will prompt you to create one
3. Click **Ads Manager** → **Settings** (gear icon, bottom-left)
4. Your **Ad Account ID** is shown (format: `act_1234567890`)
5. Note this ID (including the `act_` prefix)

> If you've never run ads before, you may need to add a payment method first. You can add a card and then immediately pause any test campaigns so nothing is charged.

### Step 3.5: Generate an Access Token

**Option A: Graph API Explorer (quick, short-lived)**

1. Go to https://developers.facebook.com/tools/explorer/
2. Select your app (`AdClaw`) from the dropdown
3. Click **Generate Access Token**
4. Grant these permissions when prompted:
   - `ads_management` (create/manage ads)
   - `ads_read` (read ad data)
   - `business_management` (manage business accounts)
5. Copy the **Access Token**

> This token expires in ~1 hour. Good for testing.

**Option B: Long-Lived Token (lasts 60 days)**

After getting the short-lived token from Option A:

```bash
curl -X GET "https://graph.facebook.com/v25.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=YOUR_APP_ID&\
client_secret=YOUR_APP_SECRET&\
fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

Copy the `access_token` from the response.

**Option C: System User Token (never expires, recommended for production)**

1. Go to https://business.facebook.com/settings/system-users
2. Click **Add** → Create a system user with Admin role
3. Click **Generate New Token**
4. Select your app → Grant `ads_management` and `ads_read` permissions
5. Copy the token — this one never expires

### Step 3.6: Your Meta Ads Credentials

```
META_APP_ID=1234567890                    # From Step 3.2
META_APP_SECRET=abcdef1234567890abcdef    # From Step 3.2 (Settings → Basic)
META_ACCESS_TOKEN=EAAxxxxxxx...           # From Step 3.5
META_AD_ACCOUNT_ID=act_1234567890         # From Step 3.4 (include the act_ prefix)
```

### Step 3.7: Test Meta Ads Connection

```bash
# Install the Meta SDK
npm install facebook-nodejs-business-sdk

# Quick test — list campaigns on your ad account
curl -G \
  -d "access_token=YOUR_ACCESS_TOKEN" \
  -d "fields=name,objective,status" \
  "https://graph.facebook.com/v25.0/act_YOUR_AD_ACCOUNT_ID/campaigns"

# Should return: {"data": [...], "paging": {...}}
```

### Step 3.8: Create a Test Campaign (PAUSED, won't spend)

```bash
curl -X POST \
  -F "name=AdClaw Test Campaign" \
  -F "objective=OUTCOME_TRAFFIC" \
  -F "status=PAUSED" \
  -F "special_ad_categories=[]" \
  -F "access_token=YOUR_ACCESS_TOKEN" \
  "https://graph.facebook.com/v25.0/act_YOUR_AD_ACCOUNT_ID/campaigns"

# Response: {"id": "12345678901234"}
```

### What You Can Do with Meta Dev Mode

| Action | Works? |
|--------|--------|
| Create campaigns | Yes |
| Create ad sets with targeting | Yes |
| Create ads with creative | Yes |
| Set budgets | Yes |
| Read campaign data | Yes |
| **Actually deliver ads** | **Yes** (if ACTIVE with payment method — be careful!) |
| **Spend money** | **Yes if campaign is ACTIVE** |

> **WARNING**: Unlike Google test accounts, Meta campaigns set to ACTIVE will actually spend money. Always create campaigns with `status=PAUSED` during testing.

---

## 4. AdClaw Environment Variables

Add all credentials to your `.env` file:

```bash
cp .env.example .env
```

Then fill in:

```bash
# === LLM Provider ===
ANTHROPIC_API_KEY=sk-ant-...

# === Telegram ===
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# === Google Ads API ===
GOOGLE_ADS_DEVELOPER_TOKEN=ABcdeFGH93KL-NOPQ_STUv
GOOGLE_ADS_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_ADS_REFRESH_TOKEN=1//xxxxxxxxxxxxxxx
GOOGLE_ADS_CUSTOMER_ID=1234567890
GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890

# === Meta Ads API ===
META_APP_ID=1234567890
META_APP_SECRET=abcdef1234567890abcdef
META_ACCESS_TOKEN=EAAxxxxxxx...
META_AD_ACCOUNT_ID=act_1234567890

# === GOAT Network ===
GOAT_PRIVATE_KEY=0x...
GOAT_RPC_URL=https://rpc.testnet3.goat.network
GOAT_CHAIN_ID=48816
GOAT_EXPLORER_URL=https://explorer.testnet3.goat.network

# === GOAT x402 ===
GOATX402_API_URL=https://api.x402.goat.network
GOATX402_API_KEY=your_api_key
GOATX402_API_SECRET=your_api_secret
GOATX402_MERCHANT_ID=your_merchant_id

# === ERC-8004 ===
ERC8004_IDENTITY_REGISTRY=0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
ERC8004_REPUTATION_REGISTRY=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63

# === GA4 (optional) ===
GA4_MEASUREMENT_ID=G-XXXXXXX
GA4_API_SECRET=your_secret

# === AdClaw Server ===
ADCLAW_SERVER_URL=http://adclaw-server:3402
ADCLAW_PUBLIC_URL=http://localhost:3402
ADCLAW_SERVER_PORT=3402
INTERNAL_SECRET=change-me-to-a-random-string

# === OpenClaw Gateway ===
OPENCLAW_GATEWAY_TOKEN=your_secure_gateway_token
```

---

## 5. GOAT Network Setup

### Step 5.1: Create a Wallet

You need a wallet with a private key for GOAT Testnet3.

**Option A: Use MetaMask**
1. Install MetaMask browser extension
2. Add custom network:
   - Network Name: `GOAT Testnet3`
   - RPC URL: `https://rpc.testnet3.goat.network`
   - Chain ID: `48816`
   - Currency: `BTC`
   - Explorer: `https://explorer.testnet3.goat.network`
3. Create or import an account
4. Export private key: Account Details → Export Private Key

**Option B: Generate with Node.js**
```bash
npx tsx -e "
const { ethers } = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Mnemonic:', wallet.mnemonic.phrase);
console.log('');
console.log('SAVE THESE SECURELY');
"
```

### Step 5.2: Get Test BTC from Faucet

1. Go to https://bridge.testnet3.goat.network/faucet
2. Enter your wallet address
3. Click **Request** to get test BTC
4. Wait for confirmation (~30 seconds)

### Step 5.3: Get Test USDC

At the hackathon:
1. Message the GOAT hackathon bot: https://t.me/goathackbot
2. Request test USDC for your wallet address

### Step 5.4: Register x402 Merchant

At the hackathon (from the onboarding checklist):
1. Use the Telegram Bot Onboarder provided at the event
2. Register as an x402 merchant
3. You'll receive:
   - `GOATX402_API_KEY`
   - `GOATX402_API_SECRET`
   - `GOATX402_MERCHANT_ID`

### Step 5.5: Register ERC-8004 Identity

After getting test BTC for gas:

```bash
# Upload agent-card.json to IPFS first
# Option A: Use Pinata (https://pinata.cloud)
# Option B: Use any IPFS pinning service
# You'll get an IPFS URI like: ipfs://QmXxxxxx

# Then register on-chain
cd /path/to/adclaw
GOAT_PRIVATE_KEY=0x... \
GOAT_RPC_URL=https://rpc.testnet3.goat.network \
npx tsx scripts/register-erc8004.ts ipfs://QmYourAgentCardHash
```

### Step 5.6: Verify on Explorer

1. Go to https://explorer.testnet3.goat.network
2. Search for your wallet address
3. You should see the `register` transaction
4. Confirm on the GOAT Dashboard (from hackathon onboarding)

---

## 6. GA4 Analytics Setup (Optional)

### Step 6.1: Create a GA4 Property

1. Go to https://analytics.google.com/
2. Click **Admin** (gear icon, bottom-left)
3. Click **+ Create Property**
4. Property name: `AdClaw`
5. Timezone: IST, Currency: INR
6. Click **Next** → **Create**

### Step 6.2: Create a Web Data Stream

1. In your new property, go to **Admin** → **Data Streams**
2. Click **Add stream** → **Web**
3. Website URL: your AdClaw public URL (or `localhost`)
4. Stream name: `AdClaw Landing Pages`
5. Click **Create stream**
6. Copy the **Measurement ID** (format: `G-XXXXXXX`)

### Step 6.3: Create Measurement Protocol API Secret

1. In the same data stream, scroll to **Measurement Protocol API secrets**
2. Click **Create**
3. Nickname: `AdClaw Server`
4. Copy the **API Secret**

### Your GA4 Credentials

```
GA4_MEASUREMENT_ID=G-XXXXXXX
GA4_API_SECRET=xxxxxxxxxxxxxxxxxx
```

---

## 7. Telegram Bot Setup

### Step 7.1: Create the Bot

1. Open Telegram → search for `@BotFather`
2. Send `/newbot`
3. Bot name: `AdClaw Marketing Bot`
4. Bot username: `adclaw_yourname_bot` (must end in `bot`, must be unique)
5. **Copy the bot token** (format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Step 7.2: Configure Bot Settings

Still in BotFather:
1. Send `/setdescription` → Select your bot → Enter: `24/7 Autonomous Marketing Agent — plans campaigns, builds landing pages, tracks performance.`
2. Send `/setabouttext` → `AI marketing agency powered by OpenClaw on GOAT Network`
3. Send `/setprivacy` → Select your bot → **Disable** (so it can see group messages)

### Your Telegram Credentials

```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

---

## 8. Verify Everything Works

### Quick Checklist

Run these one by one after filling in `.env`:

```bash
# Load env
set -a; source .env; set +a

# 1. AdClaw Server
cd server && npm run build && PORT=3402 node dist/index.js &
sleep 2
curl -s http://localhost:3402/health | python3 -m json.tool
# Expected: {"status": "ok", ...}

# 2. Google Ads API
node -e "
const {GoogleAdsApi} = require('google-ads-api');
const c = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
});
const cust = c.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
});
cust.query('SELECT campaign.id, campaign.name FROM campaign LIMIT 1')
  .then(r => console.log('Google Ads: CONNECTED, campaigns:', r.length))
  .catch(e => console.log('Google Ads: FAILED -', e.message));
"

# 3. Meta Ads API
curl -s -G \
  -d "access_token=$META_ACCESS_TOKEN" \
  -d "fields=name,account_status" \
  "https://graph.facebook.com/v25.0/$META_AD_ACCOUNT_ID" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'error' in d: print('Meta Ads: FAILED -', d['error']['message'])
else: print('Meta Ads: CONNECTED -', d.get('name','unknown'), '- status:', d.get('account_status'))
"

# 4. GOAT Testnet3 RPC
curl -s -X POST $GOAT_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)
block = int(d['result'], 16)
print(f'GOAT Testnet3: CONNECTED - block #{block}')
"

# 5. GA4 (if configured)
if [ -n "$GA4_MEASUREMENT_ID" ]; then
  curl -s -X POST \
    "https://www.google-analytics.com/mp/collect?measurement_id=$GA4_MEASUREMENT_ID&api_secret=$GA4_API_SECRET" \
    -d '{"client_id":"test","events":[{"name":"test_event"}]}' \
    -w "\nGA4: HTTP %{http_code} (204 = success)\n"
fi

# 6. Telegram Bot
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)
if d.get('ok'): print('Telegram: CONNECTED -', d['result']['username'])
else: print('Telegram: FAILED')
"

echo ""
echo "All checks complete!"
```

### Expected Output

```
AdClaw Server:   {"status": "ok", ...}
Google Ads:      CONNECTED, campaigns: 0
Meta Ads:        CONNECTED - MyAdAccount - status: 1
GOAT Testnet3:   CONNECTED - block #12345678
GA4:             HTTP 204 (204 = success)
Telegram:        CONNECTED - adclaw_bot
```

---

## Quick Reference: All URLs

| Service | URL |
|---------|-----|
| Google Ads Manager | https://ads.google.com |
| Google Cloud Console | https://console.cloud.google.com |
| Google OAuth Playground | https://developers.google.com/oauthplayground |
| Meta Developer Dashboard | https://developers.facebook.com |
| Meta Ads Manager | https://adsmanager.facebook.com |
| Meta Graph API Explorer | https://developers.facebook.com/tools/explorer |
| GOAT Testnet3 Faucet | https://bridge.testnet3.goat.network/faucet |
| GOAT Explorer | https://explorer.testnet3.goat.network |
| GA4 Analytics | https://analytics.google.com |
| Telegram BotFather | https://t.me/BotFather |
| Pinata (IPFS) | https://pinata.cloud |

---

## Troubleshooting

### Google Ads

| Error | Fix |
|-------|-----|
| `DEVELOPER_TOKEN_NOT_APPROVED` | Your token only has test access — make sure you're using the test client customer ID |
| `USER_PERMISSION_DENIED` | Add `login_customer_id` (your manager account ID without hyphens) |
| `OAUTH_TOKEN_EXPIRED` | Regenerate refresh token via OAuth Playground |
| `NOT_ADS_USER` | The Google account used for OAuth must have access to the Ads manager account |

### Meta Ads

| Error | Fix |
|-------|-----|
| `OAuthException: Invalid access token` | Token expired — regenerate via Graph API Explorer |
| `Error validating access token` | Token doesn't have `ads_management` permission — regenerate with correct scopes |
| `User does not have permission` | Your Facebook user needs admin access to the ad account |
| Ads actually spending money | Set `status=PAUSED` on all test campaigns immediately |

### GOAT Network

| Error | Fix |
|-------|-----|
| `insufficient funds` | Get test BTC from faucet: https://bridge.testnet3.goat.network/faucet |
| `execution reverted` | Contract may not be deployed on testnet3 — confirm addresses at hackathon |
| RPC timeout | Public RPC is rate-limited — retry after a few seconds |
