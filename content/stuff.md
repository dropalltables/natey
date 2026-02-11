+++
title = "stuff i do"
+++

## stuff i do

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

if you want you can get updates on stuff i do:

<form id="stuff-form" action="https://resender.viruus.zip/subscribe" method="POST" novalidate>
  <div class="field">
    <input type="email" name="email" placeholder="your@email.com" required>
    <span class="field-hint" id="email-hint"></span>
  </div>
  <input type="hidden" name="audience" value="blog">
  <div class="cf-turnstile" data-sitekey="0x4AAAAAACCIH6LE-pwfc-u6"></div>
  <button type="submit" id="stuff-submit" disabled>signup</button>
</form>

<p id="form-status"></p>

<script>
(function() {
  var timer;
  var touched = {};

  function debounce(fn, ms) {
    clearTimeout(timer);
    timer = setTimeout(fn, ms || 400);
  }

  function validate(el) {
    var name = el.name;
    var val = el.value.trim();
    var hint = document.getElementById(name + '-hint');
    if (!hint) return;

    if (!touched[name]) {
      el.classList.remove('valid', 'invalid');
      hint.textContent = '\u00a0';
      hint.className = 'field-hint';
      return;
    }

    if (!val) {
      el.classList.remove('valid');
      el.classList.add('invalid');
      hint.textContent = 'email is required';
      hint.className = 'field-hint error';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      el.classList.remove('valid');
      el.classList.add('invalid');
      hint.textContent = 'not a valid email';
      hint.className = 'field-hint error';
      return;
    }

    el.classList.remove('invalid');
    el.classList.add('valid');
    hint.textContent = '\u00a0';
    hint.className = 'field-hint ok';
  }

  var form = document.getElementById('stuff-form');
  var btn = document.getElementById('stuff-submit');
  btn.disabled = false;

  form.addEventListener('input', function(e) {
    var el = e.target;
    if (!el.name || !document.getElementById(el.name + '-hint')) return;
    touched[el.name] = true;
    if (el.classList.contains('invalid')) {
      validate(el);
    } else {
      debounce(function() { validate(el); });
    }
  });

  form.addEventListener('blur', function(e) {
    var el = e.target;
    if (!el.name || !document.getElementById(el.name + '-hint')) return;
    clearTimeout(timer);
    if (el.value.trim()) touched[el.name] = true;
    validate(el);
  }, true);

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var emailEl = form.querySelector('input[name=email]');
    touched.email = true;
    validate(emailEl);
    if (emailEl.classList.contains('invalid')) return;

    var status = document.getElementById('form-status');
    btn.disabled = true;
    btn.textContent = 'signing up...';
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form)
    }).then(function(res) {
      if (res.ok) {
        status.textContent = 'check your email to confirm your subscription (check in spam!)';
        form.reset();
        touched = {};
        emailEl.classList.remove('valid', 'invalid');
        var h = document.getElementById('email-hint');
        if (h) { h.textContent = '\u00a0'; h.className = 'field-hint'; }
        if (window.turnstile) turnstile.reset();
      } else {
        status.textContent = 'something went wrong. try again?';
      }
    }).catch(function() {
      status.textContent = 'something went wrong. try again?';
    }).finally(function() {
      btn.disabled = false;
      btn.textContent = 'signup';
    });
  });
})();
</script>
