const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (window.lucide) {
  window.lucide.createIcons();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');

    menuToggle.innerHTML = isOpen
      ? '<i data-lucide="x" aria-hidden="true"></i>'
      : '<i data-lucide="menu" aria-hidden="true"></i>';

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
      menuToggle.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';

      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  });
}
