/* North Hills Brief signup bridge for Buttondown.
   A form marked data-buttondown="USERNAME" sends its email address to that
   Buttondown newsletter first, then posts to Netlify Forms as before, so
   Netlify keeps a backup copy of every signup. If Buttondown does not answer
   within four seconds, the Netlify post goes ahead anyway.
   Buttondown is reached in no-cors mode, so its answer can't be read: the
   Netlify post always runs afterward, whatever happened.
   Sample-request forms still use kit-forms.js. November 1, 2026. */
(function () {
  var forms = document.querySelectorAll('form[data-buttondown]');
  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (ev) {
      if (form.dataset.bdSent === 'yes') return;
      if (form.dataset.bdPending === 'yes') { ev.preventDefault(); return; }
      var user = form.getAttribute('data-buttondown');
      var email = form.querySelector('input[type="email"]');
      var honeypot = form.querySelector('input[name="bot-field"]');
      if (!user || !email || !email.value || (honeypot && honeypot.value)) return;
      ev.preventDefault();
      form.dataset.bdPending = 'yes';
      var button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      var finished = false;
      var finish = function () {
        if (finished) return;
        finished = true;
        form.dataset.bdSent = 'yes';
        if (button) button.disabled = false;
        if (typeof form.requestSubmit === 'function') form.requestSubmit(); else form.submit();
      };
      var timer = setTimeout(finish, 4000);
      var body = new FormData();
      body.append('email', email.value);
      body.append('embed', '1');
      fetch('https://buttondown.com/api/emails/embed-subscribe/' + encodeURIComponent(user), {
        method: 'POST',
        mode: 'no-cors',
        body: body,
        keepalive: true
      }).then(function () { clearTimeout(timer); finish(); }, function () { clearTimeout(timer); finish(); });
    });
  });
})();
