if (window.lucide) {
  window.lucide.createIcons();
}

const API_BASE = 'https://api.veiswap.com';

const passwordToggles = document.querySelectorAll('.password-toggle');
passwordToggles.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;

    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    button.setAttribute('aria-label', shouldShow ? 'Ocultar contraseña' : 'Mostrar contraseña');
    button.innerHTML = `<i data-lucide="${shouldShow ? 'eye-off' : 'eye'}" aria-hidden="true"></i>`;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
});

const registerStep = document.getElementById('registerStep');
const otpStep = document.getElementById('otpStep');
const registerForm = document.getElementById('registerForm');
const formMessage = document.getElementById('formMessage');
const registerButton = document.getElementById('registerButton');
const otpForm = document.getElementById('otpForm');
const otpMessage = document.getElementById('otpMessage');
const verifyButton = document.getElementById('verifyButton');
const otpEmail = document.getElementById('otpEmail');
const otpBack = document.getElementById('otpBack');
const otpInputs = Array.from(document.querySelectorAll('.otp-input'));

let pendingEmail = '';

function setButtonLoading(button, loading, normalText, loadingText) {
  if (!button) return;
  button.disabled = loading;
  const label = button.querySelector('span');
  if (label) {
    label.textContent = loading ? loadingText : normalText;
  }
}

function showMessage(element, text, isError = true) {
  if (!element) return;
  element.textContent = text;
  element.style.color = isError ? '#a33a3a' : 'rgba(23, 23, 23, 0.58)';
}

async function readApiError(response, fallback) {
  try {
    const data = await response.json();
    return data.detail || data.message || fallback;
  } catch {
    return fallback;
  }
}

function showOtpStep(email) {
  pendingEmail = email;
  otpEmail.textContent = email;
  registerStep.hidden = true;
  otpStep.hidden = false;
  otpInputs.forEach((input) => {
    input.value = '';
    input.classList.remove('filled');
  });
  otpMessage.textContent = '';
  setTimeout(() => otpInputs[0]?.focus(), 50);
}

function showRegisterStep() {
  otpStep.hidden = true;
  registerStep.hidden = false;
  otpMessage.textContent = '';
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

if (registerForm && formMessage) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    showMessage(formMessage, '', false);

    if (!email.value.trim() || !password.value || !confirmPassword.value) {
      showMessage(formMessage, 'Completa todos los campos para continuar.');
      return;
    }

    if (password.value.length < 8) {
      showMessage(formMessage, 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password.value !== confirmPassword.value) {
      showMessage(formMessage, 'Las contraseñas no coinciden.');
      return;
    }

    const normalizedEmail = email.value.trim().toLowerCase();
    setButtonLoading(registerButton, true, 'Continuar con correo', 'Enviando código...');

    try {
      const response = await fetch(`${API_BASE}/api/auth/request-register-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: password.value,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readApiError(response, 'No se pudo enviar el código. Inténtalo de nuevo.');
        showMessage(formMessage, errorMessage);
        return;
      }

      showOtpStep(normalizedEmail);
    } catch {
      showMessage(formMessage, 'No pudimos conectar con VeiSwap. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setButtonLoading(registerButton, false, 'Continuar con correo', 'Enviando código...');
    }
  });
}

otpInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(-1);
    input.classList.toggle('filled', Boolean(input.value));

    if (input.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !input.value && index > 0) {
      otpInputs[index - 1].focus();
      otpInputs[index - 1].value = '';
      otpInputs[index - 1].classList.remove('filled');
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      otpInputs[index - 1].focus();
    }

    if (event.key === 'ArrowRight' && index < otpInputs.length - 1) {
      event.preventDefault();
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener('paste', (event) => {
    event.preventDefault();
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    digits.split('').forEach((digit, digitIndex) => {
      if (otpInputs[digitIndex]) {
        otpInputs[digitIndex].value = digit;
        otpInputs[digitIndex].classList.add('filled');
      }
    });

    otpInputs[Math.min(digits.length, 6) - 1]?.focus();
  });
});

if (otpForm) {
  otpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const code = otpInputs.map((input) => input.value).join('');
    otpMessage.textContent = '';

    if (!/^\d{6}$/.test(code)) {
      showMessage(otpMessage, 'Introduce los 6 dígitos del código.');
      return;
    }

    setButtonLoading(verifyButton, true, 'Verificar código', 'Verificando...');

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-register-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          code,
        }),
      });

      if (!response.ok) {
        const errorMessage = await readApiError(response, 'El código no pudo verificarse.');
        showMessage(otpMessage, errorMessage);
        return;
      }

      showMessage(otpMessage, 'Cuenta verificada. Redirigiendo...', false);
      setTimeout(() => {
        window.location.href = 'login.html?registered=1';
      }, 700);
    } catch {
      showMessage(otpMessage, 'No pudimos conectar con VeiSwap. Inténtalo de nuevo.');
    } finally {
      setButtonLoading(verifyButton, false, 'Verificar código', 'Verificando...');
    }
  });
}

if (otpBack) {
  otpBack.addEventListener('click', showRegisterStep);
}
