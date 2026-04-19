+++
title = "contact me"
+++

## contact me

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

for some reason a lot of people [have been sending me requests](/feefts) for prices. i do not know for what, or why. all of the people have one word names, ending in feeft. to all the feefts: **please stop.** im begging you.

<form id="contact-form" action="https://resender.natey.sh/contact" method="POST" novalidate>
  <div class="field">
    <input type="text" name="name" placeholder="your name" required>
    <span class="field-hint" id="name-hint"></span>
  </div>
  <div class="field">
    <input type="email" name="email" placeholder="your@email.com" required>
    <span class="field-hint" id="email-hint"></span>
  </div>
  <div class="field">
    <textarea name="message" placeholder="your message" rows="4" required></textarea>
    <span class="field-hint" id="message-hint"></span>
  </div>
  <div class="cf-turnstile" data-sitekey="0x4AAAAAACCIH6LE-pwfc-u6"></div>
  <button type="submit" id="contact-submit" disabled>send message</button>
</form>

<p id="form-status"></p>

<script>
(function() {
  var timers = {};
  var touched = {};
  var formStartTime = null;
  var focusedFields = {};

  function debounce(id, fn, ms) {
    clearTimeout(timers[id]);
    timers[id] = setTimeout(fn, ms || 400);
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
      hint.textContent = name + ' is required';
      hint.className = 'field-hint error';
      posthog.capture('contact_validation_error', { field: name, error: 'required' });
      return;
    }

    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      el.classList.remove('valid');
      el.classList.add('invalid');
      hint.textContent = 'not a valid email';
      hint.className = 'field-hint error';
      posthog.capture('contact_validation_error', { field: name, error: 'invalid_email' });
      return;
    }

    el.classList.remove('invalid');
    el.classList.add('valid');
    hint.textContent = '\u00a0';
    hint.className = 'field-hint ok';
  }

  var form = document.getElementById('contact-form');
  var btn = document.getElementById('contact-submit');
  btn.disabled = false;

  form.addEventListener('focus', function(e) {
    var el = e.target;
    if (!el.name) return;
    if (!formStartTime) formStartTime = Date.now();
    if (!focusedFields[el.name]) {
      focusedFields[el.name] = true;
      posthog.capture('contact_field_focused', { field_name: el.name });
    }
  }, true);

  form.addEventListener('input', function(e) {
    var el = e.target;
    if (!el.name || !document.getElementById(el.name + '-hint')) return;
    touched[el.name] = true;
    if (el.classList.contains('invalid')) {
      validate(el);
    } else {
      debounce(el.name, function() { validate(el); });
    }
  });

  form.addEventListener('blur', function(e) {
    var el = e.target;
    if (!el.name || !document.getElementById(el.name + '-hint')) return;
    clearTimeout(timers[el.name]);
    if (el.value.trim()) touched[el.name] = true;
    validate(el);
  }, true);

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var fields = form.querySelectorAll('input:not([type=hidden]), textarea');
    var ok = true;
    var invalidFields = [];
    for (var i = 0; i < fields.length; i++) {
      touched[fields[i].name] = true;
      validate(fields[i]);
      if (fields[i].classList.contains('invalid')) {
        ok = false;
        invalidFields.push(fields[i].name);
      }
    }
    if (!ok) {
      posthog.capture('contact_form_submit_blocked', { invalid_fields: invalidFields });
      return;
    }

    var email = form.querySelector('input[name="email"]');
    var name = form.querySelector('input[name="name"]');
    var message = form.querySelector('textarea[name="message"]');

    if (email && email.value) {
      posthog.identify(email.value, {
        name: name ? name.value : undefined,
        email: email.value,
      }, {
        first_contact_at: new Date().toISOString(),
      });
    }

    var status = document.getElementById('form-status');
    btn.disabled = true;
    btn.textContent = 'sending...';
    var submitTime = Date.now();

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form)
    }).then(function(res) {
      if (res.ok) {
        status.textContent = 'sent!';
        posthog.capture('contact_form_submitted', {
          message_length: message ? message.value.length : 0,
          time_to_submit_seconds: formStartTime ? Math.round((submitTime - formStartTime) / 1000) : null,
          session_replay_url: posthog.get_session_replay_url({ withTimestamp: true }),
        });
        form.reset();
        touched = {};
        focusedFields = {};
        formStartTime = null;
        fields.forEach(function(f) {
          f.classList.remove('valid', 'invalid');
          var h = document.getElementById(f.name + '-hint');
          if (h) { h.textContent = '\u00a0'; h.className = 'field-hint'; }
        });
        if (window.turnstile) turnstile.reset();
      } else {
        status.textContent = 'something went wrong. try again?';
        posthog.capture('contact_form_error', { status: res.status });
      }
    }).catch(function(err) {
      status.textContent = 'something went wrong. try again?';
      posthog.capture('contact_form_error', { error: err.message || 'network_error' });
    }).finally(function() {
      btn.disabled = false;
      btn.textContent = 'send message';
    });
  });
})();
</script>
