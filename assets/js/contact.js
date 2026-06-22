/**
 * contact.js
 * EmailJS contact form with honeypot, validation, and rate limiting.
 * Requires EmailJS SDK loaded in contact.html.
 *
 * Required: set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY
 */

const EMAILJS_SERVICE_ID  = 'En-Bi_Choi';
const EMAILJS_TEMPLATE_ID = 'template_0052kqn';
const EMAILJS_PUBLIC_KEY  = 'Trx1W5ydjW5iuWfRz';

const RATE_LIMIT_KEY = 'ec-contact-last';
const RATE_LIMIT_MS  = 60 * 1000; // 1 minute

document.addEventListener('DOMContentLoaded', () => {
  const form    = document.getElementById('contact-form');
  const status  = document.getElementById('form-status');

  if (!form) return;

  emailjs.init(EMAILJS_PUBLIC_KEY);

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Honeypot check
    if (form.querySelector('[name="website"]')?.value) return;

    // Rate limiting
    const last = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
    if (Date.now() - last < RATE_LIMIT_MS) {
      showStatus('Please wait before sending another message.', false);
      return;
    }

    // Validation
    const name    = form.querySelector('[name="name"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      showStatus('Please fill in all fields.', false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Please enter a valid email address.', false);
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      showStatus('Message sent. Thank you!', true);
      form.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      showStatus('Failed to send. Please try again later.', false);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send';
    }
  });

  function showStatus(msg, success) {
    status.textContent = msg;
    status.className = `form-status form-status--${success ? 'success' : 'error'}`;
  }
});
