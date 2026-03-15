import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const API_URL = process.env.GOATX402_API_URL || 'https://api.x402.goat.network';
const API_KEY = process.env.GOATX402_API_KEY || '';
const API_SECRET = process.env.GOATX402_API_SECRET || '';
const MERCHANT_ID = process.env.GOATX402_MERCHANT_ID || '';

interface PricingRule {
  price: string;
  token: string;
  description: string;
}

function signRequest(method: string, reqPath: string, body: string, timestamp: string): string {
  const message = `${method}\n${reqPath}\n${body}\n${timestamp}`;
  return crypto.createHmac('sha256', API_SECRET).update(message).digest('hex');
}

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 10000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function createOrder(amount: string, token: string, description: string): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const reqPath = '/api/v1/orders';
  const body = JSON.stringify({
    merchantId: MERCHANT_ID,
    amount,
    token,
    chain: 'goat-testnet3',
    description,
  });

  const signature = signRequest('POST', reqPath, body, timestamp);

  const res = await fetchWithTimeout(`${API_URL}${reqPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'X-Timestamp': timestamp,
      'X-Sign': signature,
    },
    body,
  });

  return res.json();
}

async function checkOrderStatus(orderId: string): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const reqPath = `/api/v1/orders/${orderId}`;
  const signature = signRequest('GET', reqPath, '', timestamp);

  const res = await fetchWithTimeout(`${API_URL}${reqPath}`, {
    headers: {
      'X-API-Key': API_KEY,
      'X-Timestamp': timestamp,
      'X-Sign': signature,
    },
  });

  return res.json();
}

const PRICING: Record<string, PricingRule> = {
  'POST /api/campaign': { price: '0.10', token: 'USDC', description: 'Campaign strategy' },
  'POST /api/landing':  { price: '0.30', token: 'USDC', description: 'Landing page generation' },
  'POST /api/event':    { price: '0.20', token: 'USDC', description: 'Event page generation' },
  'GET /api/report':    { price: '0.05', token: 'USDC', description: 'Analytics report' },
};

export function x402PaymentGate(pricing: Record<string, PricingRule> = PRICING) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const routeKey = `${req.method} ${req.baseUrl}`;
    const rule = pricing[routeKey];

    if (!rule) return next();

    const orderId = req.headers['x-order-id'] as string;

    if (orderId) {
      try {
        const status = await checkOrderStatus(orderId);
        if (status.status === 'settled' || status.status === 'completed') {
          return next();
        }
      } catch (_e) {
        // Fall through to payment required
      }
    }

    try {
      const order = await createOrder(rule.price, rule.token, rule.description);

      return res.status(402).json({
        error: 'Payment Required',
        x402: true,
        order: {
          id: order.orderId || order.id,
          amount: rule.price,
          token: rule.token,
          chain: 'goat-testnet3',
          chainId: 48816,
          description: rule.description,
          paymentAddress: order.paymentAddress,
          expiresAt: order.expiresAt,
        },
        instructions: 'Send payment to the specified address, then retry with X-Order-Id header.',
      });
    } catch (e) {
      console.error('x402 API error, allowing through:', e);
      return next();
    }
  };
}
