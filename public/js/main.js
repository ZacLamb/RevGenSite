// Minimal, dependency-free site JS
(function () {
  // Contact form: sent to our server (which files it in the CRM). If that fails, fall back to the visitor's email app.
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var note = document.getElementById('contact-form-note');
      var btn = form.querySelector('button[type=submit]');
      if (btn) btn.disabled = true;
      var payload = { page: location.pathname };
      data.forEach(function (v, k) { payload[k] = v; });
      function viaEmail() {
        var subject = encodeURIComponent('New inquiry from ' + (data.get('business') || data.get('name')));
        var body = encodeURIComponent(
          'Name: ' + data.get('name') + '\n' +
          'Business: ' + data.get('business') + '\n' +
          'Email: ' + data.get('email') + '\n' +
          'Phone: ' + (data.get('phone') || '') + '\n\n' +
          (data.get('message') || '')
        );
        window.location.href = 'mailto:hello@revenuegeneratingsolutions.com?subject=' + subject + '&body=' + body;
        if (note) note.textContent = "Opening your email app to send this. Or call/text us directly at (617) 877-5608.";
        if (btn) btn.disabled = false;
      }
      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
        .then(function () {
          form.reset();
          if (note) note.textContent = "Thanks! We got it and will reach out shortly. Want to skip the wait? Pick a time at /book/.";
          if (btn) btn.disabled = false;
        })
        .catch(viaEmail);
    });
  }

  // Booking intent: the GoHighLevel calendar is an embedded widget we can't see into, so we note clicks on booking buttons.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (!/^(\/book(-1)?\/?(#.*)?|#book)$/.test(h)) return;
    try {
      fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, body: JSON.stringify({ kind: 'booking_intent', path: location.pathname }) });
    } catch (err) { /* never block the click */ }
  });

  // Mobile nav toggle
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
