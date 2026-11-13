/**
 * Inspireshift Technologies - Contact Form Handler
 * Web3Forms Fetch Integration with client-side validation, cooldown, honeypot, and fallbacks.
 */

const WEB3FORMS_KEY = "42171169-7469-4c91-a955-4c166d72333b";

// In-memory runtime state (no persistent browser storage)
let lastSubmissionTime = 0;
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const btnOriginalText = submitBtn ? submitBtn.innerHTML : 'Send Message';
  const statusAlert = document.getElementById('form-status-alert');
  const formContainer = document.getElementById('form-container');

  // Input fields
  const fields = {
    name: form.querySelector('#contact-name'),
    email: form.querySelector('#contact-email'),
    phone: form.querySelector('#contact-phone'),
    company: form.querySelector('#contact-company'),
    service: form.querySelector('#contact-service'),
    message: form.querySelector('#contact-message'),
    botcheck: form.querySelector('input[name="botcheck"]')
  };

  // Real-time error clearing on input
  Object.keys(fields).forEach(key => {
    const input = fields[key];
    if (input && input.tagName !== 'INPUT' || (input && input.type !== 'checkbox')) {
      input.addEventListener('input', () => {
        clearFieldError(input);
      });
      input.addEventListener('blur', () => {
        validateSingleField(key, fields);
      });
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Honeypot check (anti-spam botcheck)
    if (fields.botcheck && fields.botcheck.value.trim() !== '') {
      console.warn('Bot detected by honeypot field.');
      return;
    }

    // 2. Prevent concurrent / double submission
    if (isSubmitting) return;

    // 3. 30-Second Client Cooldown Check
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastSubmissionTime) / 1000);
    const cooldownDuration = 30;

    if (lastSubmissionTime > 0 && elapsedSeconds < cooldownDuration) {
      const waitTime = cooldownDuration - elapsedSeconds;
      showStatusAlert(
        `Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before submitting another enquiry.`,
        'cooldown'
      );
      return;
    }

    // 4. Validate All Fields
    const isValid = validateAllFields(fields);
    if (!isValid) {
      showStatusAlert('Please correct the highlighted fields before sending.', 'error', false);
      return;
    }

    // Clear any previous alerts
    hideStatusAlert();

    // 5. Set Loading State
    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 24 24" style="width:18px;height:18px;animation:spin 1s linear infinite;fill:none;stroke:currentColor;stroke-width:2.5;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        Sending…
      `;
    }

    // 6. Build payload
    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: "New website enquiry – Inspireshift",
      from_name: "Inspireshift Website",
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone ? fields.phone.value.trim() : '',
      company: fields.company ? fields.company.value.trim() : '',
      service: fields.service ? fields.service.value : 'General Enquiry',
      message: fields.message.value.trim()
    };

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.success || data.message === 'Form submitted successfully')) {
        // Successful submission
        lastSubmissionTime = Date.now();
        renderSuccessView(formContainer);
      } else {
        // API response error or invalid key
        const errMsg = data.message || 'Unable to submit enquiry. Please use our direct channels below.';
        handleSubmissionFailure(errMsg, submitBtn, btnOriginalText);
      }
    } catch (networkError) {
      // Network failure / offline
      handleSubmissionFailure(
        'Network error. Please verify your connection or reach us directly via email, phone, or WhatsApp.',
        submitBtn,
        btnOriginalText
      );
    } finally {
      isSubmitting = false;
    }
  });

  function handleSubmissionFailure(message, btn, originalText) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
    showStatusAlert(message, 'error', true);
  }

  function renderSuccessView(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="form-success-card" role="alert" aria-live="polite">
        <div class="form-success-icon">
          <svg viewBox="0 0 24 24"><path d="M9 16.2l-3.5-3.5a.984.984 0 0 0-1.4 0 .984.984 0 0 0 0 1.4l4.2 4.2c.39.39 1.01.39 1.4 0l11-11a.984.984 0 0 0 0-1.4.984.984 0 0 0-1.4 0L9 16.2z"/></svg>
        </div>
        <h3 class="form-success-title">Message Received!</h3>
        <p class="form-success-msg">Thanks, we'll reply within 1 business day.</p>
        <button type="button" class="btn btn--secondary btn--sm" onclick="location.reload()">
          Send Another Enquiry
        </button>
      </div>
    `;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showStatusAlert(message, type = 'error', showFallbacks = true) {
    if (!statusAlert) return;
    statusAlert.className = `form-status-alert form-status-alert--${type} is-visible`;

    let html = `<strong>${type === 'cooldown' ? 'Please note:' : 'Enquiry Notice:'}</strong> ${escapeHTML(message)}`;

    if (showFallbacks) {
      html += `
        <div class="form-status-fallback-links">
          <span>Reach us directly:</span>
          <a href="mailto:inspireshifttechnologies@gmail.com">inspireshifttechnologies@gmail.com</a>
          <a href="tel:+919284348694">+91 92843 48694</a>
          <a href="https://wa.me/919284348694" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      `;
    }

    statusAlert.innerHTML = html;
  }

  function hideStatusAlert() {
    if (statusAlert) {
      statusAlert.className = 'form-status-alert';
      statusAlert.innerHTML = '';
    }
  }

  function validateAllFields(f) {
    let valid = true;
    if (!validateSingleField('name', f)) valid = false;
    if (!validateSingleField('email', f)) valid = false;
    if (!validateSingleField('phone', f)) valid = false;
    if (!validateSingleField('message', f)) valid = false;
    return valid;
  }

  function validateSingleField(fieldKey, f) {
    const input = f[fieldKey];
    if (!input) return true;

    const val = input.value.trim();
    let errorMsg = '';

    if (fieldKey === 'name') {
      if (!val) {
        errorMsg = 'Please enter your name.';
      } else if (val.length < 2) {
        errorMsg = 'Name must be at least 2 characters.';
      }
    } else if (fieldKey === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!val) {
        errorMsg = 'Please enter your email address.';
      } else if (!emailPattern.test(val)) {
        errorMsg = 'Please enter a valid email address (e.g., name@company.com).';
      }
    } else if (fieldKey === 'phone') {
      if (val) {
        // Allows digits, spaces, hyphens, parentheses, and leading '+'
        const phonePattern = /^\+?[0-9\s\-()]{7,20}$/;
        if (!phonePattern.test(val)) {
          errorMsg = 'Phone must contain only numbers and optional + country code.';
        }
      }
    } else if (fieldKey === 'message') {
      if (!val) {
        errorMsg = 'Please enter a brief project overview or message.';
      } else if (val.length < 10) {
        errorMsg = 'Message must be at least 10 characters long.';
      }
    }

    if (errorMsg) {
      setFieldError(input, errorMsg);
      return false;
    } else {
      clearFieldError(input);
      return true;
    }
  }

  function setFieldError(input, msg) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    const errContainer = input.parentElement.querySelector('.field-error');
    if (errContainer) {
      errContainer.textContent = msg;
    }
  }

  function clearFieldError(input) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    const errContainer = input.parentElement.querySelector('.field-error');
    if (errContainer) {
      errContainer.textContent = '';
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}
