import { Router, Request, Response } from 'express';
import { ethers } from 'ethers';

export const x402DemoRouter = Router();

const RPC = process.env.GOAT_RPC_URL || 'https://rpc.testnet3.goat.network';
const MERCHANT_WALLET = '0x256C5610C19043C8660389f68ec903C75F01A432';
const PAYER_PK = process.env.X402_DEMO_PAYER_PK || '';
const USDC_ADDRESS = process.env.GOAT_USDC_ADDRESS || '0x29d1ee93e9ecf6e50f309f498e40a6b42d352fa1';
const EXPLORER = process.env.GOAT_EXPLORER_URL || 'https://explorer.testnet3.goat.network';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

// Optional: route through OpenClaw gateway instead of direct OpenAI
const OPENCLAW_URL = process.env.OPENCLAW_API_URL || ''; // e.g., http://openclaw-gateway:18789
const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// GET /api/x402/demo/status
x402DemoRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const decimals = await usdc.decimals();
    const merchantBal = await usdc.balanceOf(MERCHANT_WALLET);
    let payerBal = 0n;
    let payerAddr = '';
    if (PAYER_PK) {
      const payer = new ethers.Wallet(PAYER_PK, provider);
      payerAddr = payer.address;
      payerBal = await usdc.balanceOf(payer.address);
    }
    res.json({
      merchant: { address: MERCHANT_WALLET, usdc: ethers.formatUnits(merchantBal, decimals) },
      payer: { address: payerAddr, usdc: ethers.formatUnits(payerBal, decimals) },
      configured: !!PAYER_PK,
      aiEnabled: !!OPENAI_KEY,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/x402/demo/pay
x402DemoRouter.post('/pay', async (req: Request, res: Response) => {
  if (!PAYER_PK) return res.status(400).json({ error: 'Demo payer wallet not configured' });

  const service = req.body.service || 'campaign-plan';
  const amounts: Record<string, string> = {
    'campaign-plan': '0.10',
    'landing-page': '0.30',
    'event-page': '0.20',
    'analytics-report': '0.05',
  };
  const amount = amounts[service] || '0.10';

  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const payer = new ethers.Wallet(PAYER_PK, provider);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, payer);
    const decimals = await usdc.decimals();
    const amountWei = ethers.parseUnits(amount, decimals);

    const balance = await usdc.balanceOf(payer.address);
    if (balance < amountWei) {
      return res.status(400).json({ error: `Insufficient USDC: have ${ethers.formatUnits(balance, decimals)}, need ${amount}` });
    }

    const tx = await usdc.transfer(MERCHANT_WALLET, amountWei);
    const receipt = await tx.wait();

    const payerBal = await usdc.balanceOf(payer.address);
    const merchantBal = await usdc.balanceOf(MERCHANT_WALLET);

    res.json({
      success: true,
      payment: {
        txHash: receipt.hash,
        block: receipt.blockNumber,
        from: payer.address,
        to: MERCHANT_WALLET,
        amount: `${amount} USDC`,
        service,
        chain: 'GOAT Testnet3',
        chainId: 48816,
        explorer: `${EXPLORER}/tx/${receipt.hash}`,
      },
      balances: {
        payer: { address: payer.address, usdc: ethers.formatUnits(payerBal, decimals) },
        merchant: { address: MERCHANT_WALLET, usdc: ethers.formatUnits(merchantBal, decimals) },
      },
    });
  } catch (err: any) {
    console.error('x402 demo pay error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/x402/demo/generate — AI-powered campaign generation after payment
x402DemoRouter.post('/generate', async (req: Request, res: Response) => {
  const { description, txHash, service, backend } = req.body;
  // backend: "openai" (default) | "openclaw"

  if (!description) {
    return res.status(400).json({ error: 'description is required' });
  }

  const useOpenClaw = backend === 'openclaw' && OPENCLAW_URL && OPENCLAW_TOKEN;
  const hasAI = useOpenClaw || !!OPENAI_KEY;

  if (!hasAI) {
    return res.json({
      generated: true,
      ai: false,
      backend: 'fallback',
      plan: fallbackPlan(description),
    });
  }

  try {
    const prompt = buildPrompt(description, service);
    let text = '';

    if (useOpenClaw) {
      // Route through OpenClaw gateway (OpenAI-compatible endpoint)
      console.log('x402 generate: using OpenClaw gateway at', OPENCLAW_URL);

      const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'openclaw:main',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: prompt,
          }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('OpenClaw API error:', response.status, errText);
        // Fall back to OpenAI if OpenClaw fails
        if (OPENAI_KEY) {
          text = await callOpenAI(prompt);
        } else {
          return res.json({ generated: true, ai: false, backend: 'fallback', plan: fallbackPlan(description) });
        }
      } else {
        const data = await response.json() as any;
        text = data.choices?.[0]?.message?.content || '';
      }
    } else {
      // Direct OpenAI
      text = await callOpenAI(prompt);
    }

    if (!text) {
      return res.json({ generated: true, ai: false, backend: 'fallback', plan: fallbackPlan(description) });
    }

    // Try to parse JSON from the response
    let plan: any;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        plan = JSON.parse(jsonMatch[0]);
      } catch {
        plan = { raw: text };
      }
    } else {
      plan = { raw: text };
    }

    res.json({
      generated: true,
      ai: true,
      backend: useOpenClaw ? 'openclaw' : 'openai',
      txHash,
      plan,
    });
  } catch (err: any) {
    console.error('AI generation error:', err.message);
    res.json({ generated: true, ai: false, backend: 'fallback', plan: fallbackPlan(description) });
  }
});

async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('OpenAI API error:', response.status, errText);
    return '';
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || '';
}

function buildPrompt(description: string, service?: string): string {
  return `You are AdClaw, an AI marketing agent. A client just paid USDC on GOAT Network (Bitcoin L2) for your services.

Client request: "${description}"
Service: ${service || 'campaign-plan'}

Generate a complete marketing campaign plan. Respond ONLY with a JSON object (no markdown, no explanation), with this exact structure:

{
  "campaignName": "...",
  "objective": "...",
  "targetAudience": {
    "demographics": "...",
    "interests": ["...", "..."],
    "location": "..."
  },
  "budget": {
    "total": "...",
    "currency": "...",
    "allocation": {
      "google_search": "...%",
      "meta_instagram": "...%",
      "landing_page": "...%"
    }
  },
  "channels": [
    {"name": "...", "purpose": "...", "budget_pct": "..."}
  ],
  "kpis": {
    "target_ctr": "...",
    "target_conversions": "...",
    "expected_roas": "..."
  },
  "adCopy": {
    "google": [
      {"headline": "...", "description": "..."}
    ],
    "meta": [
      {"primary_text": "...", "headline": "...", "cta": "..."}
    ]
  },
  "landingPageConcept": {
    "headline": "...",
    "subheadline": "...",
    "sections": ["...", "...", "..."],
    "cta_text": "..."
  },
  "timeline": "...",
  "recommendations": ["...", "..."]
}`;
}

function fallbackPlan(description: string): any {
  return {
    campaignName: `Campaign for: ${description.slice(0, 50)}`,
    objective: 'Brand awareness + lead generation',
    targetAudience: {
      demographics: 'Derived from description',
      interests: ['Relevant interests'],
      location: 'Target market',
    },
    budget: {
      total: 'As specified',
      allocation: { google_search: '40%', meta_instagram: '35%', landing_page: '25%' },
    },
    channels: [
      { name: 'Google Search', purpose: 'Intent capture', budget_pct: '40%' },
      { name: 'Meta/Instagram', purpose: 'Awareness', budget_pct: '35%' },
      { name: 'Landing Page', purpose: 'Conversion', budget_pct: '25%' },
    ],
    kpis: { target_ctr: '>2%', target_conversions: '50+', expected_roas: '>3x' },
    adCopy: {
      google: [{ headline: 'Generated based on description', description: 'AI-powered copy' }],
      meta: [{ primary_text: 'Generated based on description', headline: 'Engaging hook', cta: 'Learn More' }],
    },
    landingPageConcept: {
      headline: 'Compelling headline',
      subheadline: 'Value proposition',
      sections: ['Hero', 'Benefits', 'Social Proof', 'CTA'],
      cta_text: 'Get Started',
    },
    timeline: '4 weeks',
    recommendations: ['Configure ANTHROPIC_API_KEY for AI-generated plans', 'Provide detailed description for better results'],
    note: 'AI not configured — this is a template. Add ANTHROPIC_API_KEY to .env for real AI generation.',
  };
}
