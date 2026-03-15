import { Router, Request, Response } from 'express';
import { readEvents } from './track';

export const reportRouter = Router();

reportRouter.get('/:campaignId', (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const allEvents = readEvents();
    const events = allEvents.filter(e => e.campaignId === campaignId);

    if (events.length === 0) {
      return res.json({ campaignId, message: 'No events recorded yet', events: [] });
    }

    const pageViews = events.filter(e => e.eventName === 'page_view').length;
    const uniqueVisitors = new Set(events.filter(e => e.eventName === 'page_view').map(e => e.clientId)).size;
    const ctaClicks = events.filter(e => e.eventName === 'cta_click').length;
    const interactions = events.filter(e => e.eventName !== 'page_view').length;
    const rsvps = events.filter(e => ['rsvp', 'signup', 'form_submit'].includes(e.eventName)).length;
    const purchases = events.filter(e => e.eventName === 'purchase').length;
    const revenue = events.filter(e => e.eventName === 'purchase').reduce((sum, e) => sum + (e.value || 0), 0);

    const visitorsWithInteraction = new Set(
      events
        .filter(e => e.eventName !== 'page_view' && !e.eventName.startsWith('scroll_'))
        .map(e => e.clientId)
    );
    const bounceRate = uniqueVisitors > 0
      ? Math.round(((uniqueVisitors - visitorsWithInteraction.size) / uniqueVisitors) * 100)
      : 0;

    const report = {
      campaignId,
      period: `${events[0].timestamp} — ${events[events.length - 1].timestamp}`,
      pageViews,
      uniqueVisitors,
      ctaClicks,
      interactions,
      rsvps,
      purchases,
      revenue,
      bounceRate,
      ctr: pageViews > 0 ? Math.round((ctaClicks / pageViews) * 10000) / 100 : 0,
      avgOrderValue: purchases > 0 ? Math.round(revenue / purchases) : null,
      cpa: null as number | null,
      roas: null as number | null,
    };

    res.json({
      report,
      totalEvents: events.length,
      eventBreakdown: Object.entries(
        events.reduce((acc: Record<string, number>, e) => {
          acc[e.eventName] = (acc[e.eventName] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, count]) => ({ name, count })),
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

reportRouter.get('/', (_req: Request, res: Response) => {
  try {
    const events = readEvents();
    const campaigns = [...new Set(events.map(e => e.campaignId))];

    const summaries = campaigns.map(id => {
      const cEvents = events.filter(e => e.campaignId === id);
      return {
        campaignId: id,
        totalEvents: cEvents.length,
        pageViews: cEvents.filter(e => e.eventName === 'page_view').length,
        lastEvent: cEvents[cEvents.length - 1]?.timestamp,
      };
    });

    res.json({ campaigns: summaries });
  } catch (err) {
    console.error('Report list error:', err);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});
