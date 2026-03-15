import { Request, Response, NextFunction } from 'express';

const API_URL = process.env.GOATX402_API_URL || 'https://api.x402.goat.network';
const API_KEY = process.env.GOATX402_API_KEY || '';
const API_SECRET = process.env.GOATX402_API_SECRET || '';
const MERCHANT_ID = process.env.GOATX402_MERCHANT_ID || 'adclaw';

const CHAIN_ID = parseInt(process.env.GOAT_CHAIN_ID || '48816');
const USDC_CONTRACT = process.env.GOAT_USDC_ADDRESS || '0x29d1ee93e9ecf6e50f309f498e40a6b42d352fa1';

interface PricingRule {
  price: string;
  amountWei: string;
  description: string;
}

// Lazy-load ESM SDK
let sdkClient: any = null;
let sdkLoaded = false;

async function getClient(): Promise<any> {
  if (sdkLoaded) return sdkClient;
  sdkLoaded = true;

  if (!API_KEY || !API_SECRET) {
    console.log('x402: No API credentials — demo/fallback mode');
    return null;
  }

  try {
    // Use Function to prevent TypeScript from transforming dynamic import to require
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const { GoatX402Client } = await dynamicImport('goatx402-sdk-server');
    sdkClient = new GoatX402Client({
      baseUrl: API_URL,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
    });
    console.log('x402: SDK client initialized');
    return sdkClient;
  } catch (e: any) {
    console.error('x402: SDK init failed:', e.message);
    return null;
  }
}

// USDC has 6 decimals
// Gate ALL methods on these base routes (both GET and POST)
const PRICING: Record<string, PricingRule> = {
  '/api/campaign': { price: '0.10', amountWei: '100000', description: 'Campaign strategy' },
  '/api/landing':  { price: '0.30', amountWei: '300000', description: 'Landing page generation' },
  '/api/event':    { price: '0.20', amountWei: '200000', description: 'Event page generation' },
  '/api/report':   { price: '0.05', amountWei: '50000',  description: 'Analytics report' },
};

export function x402PaymentGate(pricing: Record<string, PricingRule> = PRICING) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rule = pricing[req.baseUrl];

    if (!rule) return next();

    // Check for existing paid order
    const orderId = req.headers['x-order-id'] as string;
    if (orderId) {
      const client = await getClient();
      if (client) {
        try {
          const status = await client.getOrderStatus(orderId);
          if (status.status === 'PAYMENT_CONFIRMED' || status.status === 'INVOICED') {
            return next();
          }
        } catch (_e) {
          // Fall through
        }
      }
    }

    // Try creating a real order via SDK
    const client = await getClient();
    if (client) {
      try {
        const order = await client.createOrder({
          dappOrderId: `adclaw_${Date.now()}`,
          chainId: CHAIN_ID,
          tokenSymbol: 'USDC',
          tokenContract: USDC_CONTRACT,
          fromAddress: (req.headers['x-payer-address'] as string) || '0x0000000000000000000000000000000000000000',
          amountWei: rule.amountWei,
        });

        return res.status(402).json({
          error: 'Payment Required',
          x402: true,
          order,
          pricing: {
            amount: rule.price,
            token: 'USDC',
            chain: 'goat-testnet3',
            chainId: CHAIN_ID,
            description: rule.description,
          },
          instructions: 'Pay the order, then retry with X-Order-Id header.',
        });
      } catch (e: any) {
        console.error('x402: Order creation failed:', e.message || e);
      }
    }

    // Fallback: return static 402 with pricing info
    return res.status(402).json({
      error: 'Payment Required',
      x402: true,
      order: {
        amount: rule.price,
        amountWei: rule.amountWei,
        token: 'USDC',
        tokenContract: USDC_CONTRACT,
        chain: 'goat-testnet3',
        chainId: CHAIN_ID,
        description: rule.description,
        merchantId: MERCHANT_ID,
      },
      instructions: 'Send USDC to the merchant, then retry with X-Order-Id header.',
    });
  };
}
