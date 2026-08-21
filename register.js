if (window.lucide) {
  window.lucide.createIcons();
}

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

const registerForm = document.getElementById('registerForm');
const formMessage = document.getElementById('formMessage');

if (registerForm && formMessage) {
  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    formMessage.textContent = '';

    if (!email.value.trim() || !password.value || !confirmPassword.value) {
      formMessage.textContent = 'Completa todos los campos para continuar.';
      return;
    }

    if (password.value.length < 8) {
      formMessage.textContent = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (password.value !== confirmPassword.value) {
      formMessage.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    formMessage.textContent = 'Interfaz lista. Conectaremos el registro al backend después.';
    formMessage.style.color = 'rgba(23, 23, 23, 0.58)';
  });
}
