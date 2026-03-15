import { Router, Request, Response } from 'express';

export const x402WebhookRouter = Router();

// x402 sends webhook when order is invoiced (payment confirmed + settled)
x402WebhookRouter.post('/', (req: Request, res: Response) => {
  try {
    const event = req.body;

    console.log('x402 webhook received:', JSON.stringify(event, null, 2));

    const orderId = event.order_id || event.orderId;
    const status = event.status;
    const txHash = event.tx_hash || event.txHash;
    const amount = event.amount_wei || event.amountWei;

    console.log(`x402 Payment: order=${orderId} status=${status} tx=${txHash} amount=${amount}`);

    // Store confirmed payments for verification
    if (status === 'INVOICED' || status === 'PAYMENT_CONFIRMED') {
      const g = global as Record<string, any>;
      if (!g._x402ConfirmedOrders) {
        g._x402ConfirmedOrders = new Set();
      }
      g._x402ConfirmedOrders.add(orderId);
      console.log(`x402: Order ${orderId} confirmed and stored`);
    }

    res.json({ status: 'ok', received: true });
  } catch (err) {
    console.error('x402 webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
