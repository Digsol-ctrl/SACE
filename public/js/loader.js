// public/js/loader.js
(function () {
  const loader = document.getElementById('site-loader');
  if (!loader) return;

  function hide() {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 800);
  }

  // Hide when page fully loads
  window.addEventListener('load', hide);

  // Fallback: hide after 6s to avoid stuck loader
  setTimeout(() => {
    if (document.readyState !== 'complete') hide();
  }, 6000);
})();