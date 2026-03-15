// AdClaw Lightweight Tracker
(function() {
  var script = document.querySelector('script[data-campaign]');
  var campaignId = script ? script.getAttribute('data-campaign') : 'unknown';
  var pageSlug = script ? script.getAttribute('data-page') : 'unknown';
  var serverUrl = script ? (script.getAttribute('data-server') || '') : '';

  var clientId;
  try {
    clientId = localStorage.getItem('adclaw_cid');
    if (!clientId) {
      clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('adclaw_cid', clientId);
    }
  } catch(e) {
    clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  function track(eventName, value) {
    var baseUrl = serverUrl || window.location.origin;
    fetch(baseUrl + '/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaignId,
        pageSlug: pageSlug,
        eventName: eventName,
        clientId: clientId,
        value: value || 0,
        userAgent: navigator.userAgent,
        referrer: document.referrer
      })
    }).catch(function() {});
  }

  track('page_view');

  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), el.getAttribute('data-value') || 0);
  });

  var scrolled = {};
  var scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(function() {
        var scrollable = document.body.scrollHeight - window.innerHeight;
        if (scrollable <= 0) { scrollTicking = false; return; }
        var pct = Math.round((window.scrollY / scrollable) * 100);
        [25, 50, 75, 100].forEach(function(threshold) {
          if (pct >= threshold && !scrolled[threshold]) {
            scrolled[threshold] = true;
            track('scroll_' + threshold);
          }
        });
        scrollTicking = false;
      });
    }
  });

  document.addEventListener('submit', function(e) {
    var form = e.target;
    var trackAttr = form.getAttribute('data-track');
    if (trackAttr) track(trackAttr);
    else track('form_submit');
  });

  window.adclaw = { track: track };
})();
