// Minimal, dependency-free site JS
(function () {
  // Contact form: no backend wired up yet, so hand off to email with a prefilled message.
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var subject = encodeURIComponent('New inquiry from ' + (data.get('business') || data.get('name')));
      var body = encodeURIComponent(
        'Name: ' + data.get('name') + '\n' +
        'Business: ' + data.get('business') + '\n' +
        'Email: ' + data.get('email') + '\n' +
        'Phone: ' + (data.get('phone') || '') + '\n\n' +
        (data.get('message') || '')
      );
      window.location.href = 'mailto:hello@revenuegeneratingsolutions.com?subject=' + subject + '&body=' + body;
      var note = document.getElementById('contact-form-note');
      if (note) note.textContent = "Opening your email app to send this — or call/text us directly at (617) 877-5608.";
    });
  }

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
