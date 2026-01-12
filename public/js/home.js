document.addEventListener('DOMContentLoaded', function() {
  setCurrentYear();
  initMobileMenu();
  initHeroSlider();
  initGallery();
  initContactForm();
  initServiceFilters();
  initSmoothScrolling();
  initBackToTop();
  initActiveNavOnScroll();
  initScrollAnimations();
  initHashScroll();
  // admin filters (if on admin projects page)
  try { initAdminFilters(); } catch (e) { /* silent */ }
  try { initDeleteConfirm(); } catch (e) { /* silent */ }
  try { initAdminGalleryForm(); } catch (e) { /* silent */ }
});

function setCurrentYear() {
  const yearElements = document.querySelectorAll('#currentYear');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(element => element.textContent = currentYear);
}

function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      const icon = this.querySelector('i');
      if (mainNav.classList.contains('active')) {
        icon.classList.remove('fa-bars'); icon.classList.add('fa-times'); document.body.style.overflow = 'hidden';
      } else {
        icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); document.body.style.overflow = '';
      }
    });
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => link.addEventListener('click', function() {
      mainNav.classList.remove('active'); mobileMenuBtn.querySelector('i').classList.remove('fa-times'); mobileMenuBtn.querySelector('i').classList.add('fa-bars'); document.body.style.overflow = '';
    }));
  }
}

function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  if (slides.length === 0) return;
  let currentSlide = 0; let slideInterval;
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }
  function nextSlide(){ showSlide(currentSlide + 1); }
  function prevSlide(){ showSlide(currentSlide - 1); }
  dots.forEach((dot, index) => dot.addEventListener('click', function(){ showSlide(index); resetInterval(); }));
  if (prevBtn) prevBtn.addEventListener('click', function(){ prevSlide(); resetInterval(); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ nextSlide(); resetInterval(); });
  function resetInterval(){ clearInterval(slideInterval); startAutoPlay(); }
  function startAutoPlay(){ slideInterval = setInterval(nextSlide, 5000); }
  startAutoPlay();
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    heroSlider.addEventListener('mouseenter', function(){ clearInterval(slideInterval); });
    heroSlider.addEventListener('mouseleave', function(){ startAutoPlay(); });
  }
}

function initCardCarousels(){
  const carousels = document.querySelectorAll('.card-carousel');
  console.debug('initCardCarousels: found', carousels.length, 'carousels');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prev = carousel.querySelector('.carousel-nav.prev');
    const next = carousel.querySelector('.carousel-nav.next');
    console.debug('initCardCarousels: carousel slides=', slides.length);
    if (!track || slides.length === 0) return;
    // reset position to prevent weird offsets
    track.style.transform = 'translateX(0)';
    if (slides.length === 1) {
      // hide navs when only one
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      return;
    }
    let idx = 0;
    let autoplayInterval = null;
    const AUTOPLAY_DELAY = 3500;
    function update(){ track.style.transform = `translateX(-${idx * 100}%)`; }
    if (prev) prev.addEventListener('click', (e) => { e.stopPropagation(); idx = (idx - 1 + slides.length) % slides.length; update(); resetAutoplay(); });
    if (next) next.addEventListener('click', (e) => { e.stopPropagation(); idx = (idx + 1) % slides.length; update(); resetAutoplay(); });

    // Autoplay
    function startAutoplay(){ if (autoplayInterval) clearInterval(autoplayInterval); autoplayInterval = setInterval(()=>{ idx = (idx + 1) % slides.length; update(); }, AUTOPLAY_DELAY); }
    function pauseAutoplay(){ if (autoplayInterval) { clearInterval(autoplayInterval); autoplayInterval = null; } }
    function resetAutoplay(){ pauseAutoplay(); startAutoplay(); }
    carousel.addEventListener('mouseenter', pauseAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    startAutoplay();

    // Swipe support
    let startX = null;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; pauseAutoplay(); });
    track.addEventListener('touchend', e => {
      if (startX === null) return;
      const diff = (e.changedTouches[0].clientX - startX);
      if (Math.abs(diff) > 40) { if (diff < 0) idx = (idx + 1) % slides.length; else idx = (idx - 1 + slides.length) % slides.length; update(); }
      startX = null;
      resetAutoplay();
    });

    // Resize handling: reset index so oversized images don't overflow on layout change
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { idx = 0; update(); }, 150);
    });

  });
}

function initGallery(){
  // prevent double initialization
  if (window.__galleryInitialized) return;
  window.__galleryInitialized = true;

  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const filterValue = this.getAttribute('data-filter');
        galleryItems.forEach(item => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block'; setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 100);
          } else {
            item.style.opacity = '0'; item.style.transform = 'scale(0.8)'; setTimeout(() => { item.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  let lightbox = document.getElementById('lightbox');
  let lightboxContent = null, lightboxTitle = null, lightboxCategory = null, closeBtn = null;
  if (!lightbox) {
    // Create a fallback lightbox dynamically so admin pages (which don't include the public lightbox markup) still work
    const fallback = `
      <div class="lightbox" id="lightbox" role="dialog" aria-hidden="true" aria-modal="true" aria-label="Project image lightbox">
        <div class="lightbox-content" tabindex="-1">
          <button class="lightbox-close" aria-label="Close lightbox"><i class="fas fa-times"></i></button>
          <div class="lightbox-carousel-wrapper"><!-- dynamic lightbox carousel injected here --></div>
          <div class="lightbox-info"><h3 class="lightbox-title"></h3><p class="lightbox-category"></p></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', fallback);
    lightbox = document.getElementById('lightbox');
  }
  if (lightbox) {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxContent = lightbox.querySelector('.lightbox-content');
    lightboxTitle = lightbox.querySelector('.lightbox-title');
    lightboxCategory = lightbox.querySelector('.lightbox-category');
    closeBtn = lightbox.querySelector('.lightbox-close');
  }
  const projectCards = Array.from(document.querySelectorAll('.project-card'));
  const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));

  // sanitize remote images (avoid violating CSP by replacing external hosts with local fallback)
  function sanitizeSrc(src){
    if (!src) return '/images/construction_team.webp';
    try {
      // allow data: urls and same-origin
      if (src.startsWith('data:')) return src;
      const u = new URL(src, window.location.origin);
      if (u.origin !== window.location.origin) return '/images/construction_team.webp';
      return src;
    } catch (e) {
      return '/images/construction_team.webp';
    }
  }
  // include gallery-card images for admin list
  document.querySelectorAll('.project-card img, .gallery-item img, .gallery-card img').forEach(img => {
    const src = img.getAttribute('src') || '';
    const safe = sanitizeSrc(src);
    if (src !== safe) img.setAttribute('src', safe);
  });

  // If there are no gallery items, no project cards, and no gallery cards, nothing to do
  if (galleryItems.length === 0 && projectCards.length === 0 && galleryCards.length === 0) return;
  // Keep `items` name for downstream code; it may be empty when only project cards exist
  const items = galleryItems;
  if (galleryItems.length === 0) console.debug('initGallery: no gallery items found; proceeding to initialize project-only page');

  // Build per-project images arrays from any gallery items (supports data-images attribute or single img fallback)
  const projects = items.map((item, index) => {
    let imgs = [];
    try {
      if (item.dataset.images) imgs = JSON.parse(item.dataset.images);
    } catch (e) { imgs = []; }
    if ((!imgs || !imgs.length) && item.querySelector('img')) imgs = [item.querySelector('img').getAttribute('src')];
    return {
      images: imgs,
      title: item.querySelector('h3') ? item.querySelector('h3').textContent : '',
      category: item.querySelector('p') ? item.querySelector('p').textContent : '',
      index
    };
  });

  let currentProject = 0;
  let currentImageIndex = 0;
  let lastFocusedElement = null;
  let lightboxAutoplay = null;
  const LIGHTBOX_AUTOPLAY_DELAY = 3000;

  // wrapper for injected lightbox carousel (so we don't overwrite close button/info)
  const lightboxWrapper = lightbox ? lightbox.querySelector('.lightbox-carousel-wrapper') : null;

  console.debug('initGallery: found', items.length, 'gallery items');
  items.forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    // clicking a slide should open the lightbox at that slide; otherwise open at 0
    item.addEventListener('click', (e) => {
      const slide = e.target.closest('.carousel-slide');
      const startIndex = slide ? parseInt(slide.getAttribute('data-index') || 0, 10) : 0;
      openLightbox(index, startIndex);
    });
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); } });
  });

  // initialize card carousels everywhere (admin, public, projects)
  console.debug('initGallery: initializing card carousels');
  initCardCarousels();
  console.debug('initGallery: card carousels initialized');

  // Project-cards behavior: attach click handlers and integrate them into shared lightbox
  function initProjectsGallery(){
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    if (!projectCards.length) return;
    console.debug('initProjectsGallery: found', projectCards.length, 'project cards');
    const offset = projects.length; // keep gallery items first
    projectCards.forEach((card, idx) => {
      let imgs = [];
      try { if (card.dataset.images) imgs = JSON.parse(card.dataset.images); } catch (e) { imgs = []; }
      const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
      const category = card.querySelector('.project-badge') ? card.querySelector('.project-badge').textContent : '';
      const projectObj = { images: imgs, title, category, index: offset + idx };
      projects.push(projectObj);

      card.setAttribute('tabindex', '0');
      card.addEventListener('click', (e) => {
        const slide = e.target.closest('.carousel-slide');
        const startIndex = slide ? parseInt(slide.getAttribute('data-index') || 0, 10) : 0;
        openLightbox(offset + idx, startIndex);
      });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(offset + idx, 0); } });
    });
    // ensure internal carousels initialize too
    initCardCarousels();
  }

  // Similar to project cards, initialize admin gallery-card click handlers and include them in shared lightbox
  function initGalleryCards(){
    const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
    if (!galleryCards.length) return;
    console.debug('initGalleryCards: found', galleryCards.length, 'gallery cards');
    const offset = projects.length; // append after any gallery items
    galleryCards.forEach((card, idx) => {
      let imgs = [];
      try { if (card.dataset.images) imgs = JSON.parse(card.dataset.images); } catch (e) { imgs = []; }
      const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
      const category = card.querySelector('.gallery-category') ? card.querySelector('.gallery-category').textContent : '';
      const projectObj = { images: imgs, title, category, index: offset + idx };
      projects.push(projectObj);

      card.setAttribute('tabindex', '0');
      card.addEventListener('click', (e) => {
        const slide = e.target.closest('.carousel-slide');
        const startIndex = slide ? parseInt(slide.getAttribute('data-index') || 0, 10) : 0;
        openLightbox(offset + idx, startIndex);
      });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(offset + idx, 0); } });
    });
    initCardCarousels();
  }

  try { if (document.querySelectorAll('.project-card').length) { console.debug('initGallery: project-cards present — initializing project gallery'); initProjectsGallery(); } } catch(e) { console.error('initGallery: initProjectsGallery error', e); }
  try { if (document.querySelectorAll('.gallery-card').length) { console.debug('initGallery: gallery-cards present — initializing admin gallery handlers'); initGalleryCards();
      // Ensure admin gallery cards are visible and images are sane (diagnostic / defensive)
      const galleryCardsDiag = Array.from(document.querySelectorAll('.gallery-card'));
      console.debug('initGallery: gallery-cards count', galleryCardsDiag.length);
      galleryCardsDiag.forEach(card => {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        const img = card.querySelector('img');
        // determine the first available src (data-images or inline img)
        let firstSrc = '';
        try {
          const dataImages = card.getAttribute('data-images');
          if (dataImages) {
            const arr = JSON.parse(dataImages);
            if (Array.isArray(arr) && arr.length) firstSrc = arr[0];
          }
        } catch(e) { /* ignore */ }
        if (!firstSrc && img) firstSrc = img.getAttribute('src') || '';
        const safe = sanitizeSrc(firstSrc);

        // Ensure <img> uses a safe src and alt
        if (img) {
          const imgSrc = img.getAttribute('src') || '';
          const safeImgSrc = sanitizeSrc(imgSrc || firstSrc || '');
          if (imgSrc !== safeImgSrc) img.setAttribute('src', safeImgSrc);
          if (!img.getAttribute('alt')) img.setAttribute('alt', 'Project image');
        }

        // Add a robust background fallback so thumbnails always show in admin list
        try {
          const wrap = card.querySelector('.gallery-card-image');
          if (wrap && safe) {
            wrap.style.backgroundImage = `url('${safe}')`;
            wrap.style.backgroundSize = 'cover';
            wrap.style.backgroundPosition = 'center';
          }
        } catch (e) { /* ignore */ }

        console.debug('initGallery: gallery card initialized', { title: card.getAttribute('data-title'), src: firstSrc, safe });
      });
    } } catch(e) { console.error('initGallery: initGalleryCards error', e); }

  function buildLightboxCarousel(project){
    const images = (project && project.images) || [];
    if (!lightboxWrapper) return;
    // build a carousel inside the lightbox wrapper (preserve close button and info)
    const carouselHtml = `
      <div class="lightbox-carousel" role="region" aria-label="Project images">
        <button class="lightbox-nav prev" aria-label="Previous image">&lt;</button>
        <div class="carousel-track">
          ${images.map((src, idx) => {
            const safe = sanitizeSrc(src);
            return `<div class="carousel-slide" data-index="${idx}"><img src="${safe}" alt="${project.title || ''} - image ${idx+1}" loading="lazy"></div>`;
          }).join('')}
        </div>
        <button class="lightbox-nav next" aria-label="Next image">&gt;</button>
      </div>
    `;
    lightboxWrapper.innerHTML = carouselHtml;
  }

  function openLightbox(projectIndex, startIndex = 0){
    console.debug('openLightbox', projectIndex, 'startIndex', startIndex);
    currentProject = projectIndex;
    currentImageIndex = parseInt(startIndex || 0, 10);
    const project = projects[currentProject] || {};
    lightboxTitle.textContent = project.title || '';
    lightboxCategory.textContent = project.category || '';
    buildLightboxCarousel(project);
    // set up controls and start autoplay
    const carousel = lightboxWrapper ? lightboxWrapper.querySelector('.lightbox-carousel') : null;
    const track = carousel ? carousel.querySelector('.carousel-track') : null;
    const slides = carousel ? carousel.querySelectorAll('.carousel-slide') : [];
    const prevBtn = carousel ? carousel.querySelector('.lightbox-nav.prev') : null;
    const nextBtn = carousel ? carousel.querySelector('.lightbox-nav.next') : null;

    function showSlide(i){ if (!track || slides.length === 0) return; currentImageIndex = (i + slides.length) % slides.length; track.style.transform = `translateX(-${currentImageIndex * 100}%)`; }
    function showNext(){ showSlide(currentImageIndex + 1); resetLightboxAutoplay(); }
    function showPrev(){ showSlide(currentImageIndex - 1); resetLightboxAutoplay(); }

    if (prevBtn) prevBtn.addEventListener('click', showPrev);
    if (nextBtn) nextBtn.addEventListener('click', showNext);

    // Autoplay inside lightbox
    function startLightboxAutoplay(){ stopLightboxAutoplay(); if (!slides || slides.length <= 1) return; lightboxAutoplay = setInterval(()=>{ showSlide(currentImageIndex + 1); }, LIGHTBOX_AUTOPLAY_DELAY); }
    function stopLightboxAutoplay(){ if (lightboxAutoplay) { clearInterval(lightboxAutoplay); lightboxAutoplay = null; } }
    function resetLightboxAutoplay(){ stopLightboxAutoplay(); startLightboxAutoplay(); }
    if (carousel){ carousel.addEventListener('mouseenter', stopLightboxAutoplay); carousel.addEventListener('mouseleave', startLightboxAutoplay); }

    showSlide(0);
    startLightboxAutoplay();

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    lastFocusedElement = document.activeElement;
    if (closeBtn) closeBtn.focus();
    document.body.style.overflow = 'hidden';

    // cleanup on close to avoid leaking intervals/listeners
    const cleanup = () => {
      stopLightboxAutoplay();
    };
    // attach cleanup to a dataset for close handler to call
    lightbox.dataset.cleanup = '1';
    lightbox._cleanup = cleanup;
  }

  function closeLightbox(){
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightbox && lightbox._cleanup) lightbox._cleanup();
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
  }

  // keyboard & overlay interactions (only if lightbox exists)
  if (lightbox) {
    const overlayClickHandler = function(e){ if (e.target === lightbox) closeLightbox(); };
    lightbox.addEventListener('click', overlayClickHandler);
    document.addEventListener('keydown', function(e){ if (!lightbox.classList.contains('active')) return; switch(e.key){ case 'Escape': closeLightbox(); break; case 'ArrowLeft': {
        // find prev inside current lightbox carousel if exists
        const carousel = lightbox.querySelector('.lightbox-carousel'); if (carousel){ const prev = carousel.querySelector('.lightbox-nav.prev'); if (prev) prev.click(); } break; }
      case 'ArrowRight': {
        const carousel = lightbox.querySelector('.lightbox-carousel'); if (carousel){ const next = carousel.querySelector('.lightbox-nav.next'); if (next) next.click(); } break; }
    } });

    // close button
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  }
}

// Admin / projects page filters (moved from inline script to external file for CSP compatibility)
function initAdminFilters(){
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return; // only run on admin view

  const categoryFilter = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortSelect');
  const galleryCards = document.querySelectorAll('.gallery-card');

  // Search function
  function filterGallery() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter ? categoryFilter.value : '';

    galleryCards.forEach(card => {
      const title = card.getAttribute('data-title') || '';
      const category = card.getAttribute('data-category') || '';

      const matchesSearch = !searchTerm || title.includes(searchTerm);
      const matchesCategory = !selectedCategory || category === selectedCategory;

      if (matchesSearch && matchesCategory) {
        card.style.display = 'block';
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 100);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => { card.style.display = 'none'; }, 300);
      }
    });
  }

  // Sort function
  function sortGallery() {
    if (!sortSelect) return;
    const sortBy = sortSelect.value;
    const galleryList = document.querySelector('.gallery-list');
    const cards = Array.from(galleryCards);

    cards.sort((a, b) => {
      switch(sortBy) {
        case 'az':
          return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
        case 'za':
          return b.getAttribute('data-title').localeCompare(a.getAttribute('data-title'));
        case 'newest':
          return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));
        case 'oldest':
          return new Date(a.getAttribute('data-date')) - new Date(b.getAttribute('data-date'));
        default:
          return 0;
      }
    });

    // Reorder cards
    cards.forEach(card => { galleryList.appendChild(card); });
  }

  // Event listeners
  searchInput.addEventListener('input', filterGallery);
  if (categoryFilter) categoryFilter.addEventListener('change', filterGallery);
  if (sortSelect) sortSelect.addEventListener('change', sortGallery);

  // Initialize
  filterGallery();
}

// centralized delete confirm handler (moved from inline script to external file for CSP)
function initDeleteConfirm(){
  const forms = document.querySelectorAll('.delete-form');
  if (!forms || !forms.length) return;
  forms.forEach(form => {
    form.addEventListener('submit', function(e){
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) e.preventDefault();
    });
  });
}

// Admin gallery form: file & URL previews, client-side validation (moved from inline script to external for CSP)
function initAdminGalleryForm(){
  const inputFiles = document.getElementById('imageFiles');
  const urlArea = document.getElementById('imageUrl');
  const previewWrap = document.getElementById('previewWrap');
  const form = document.querySelector('.admin-form');
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (!previewWrap) return; // not the gallery form page

  function clearPreviews(){ previewWrap.innerHTML = ''; }
  function addPreviewSrc(src){ const img = document.createElement('img'); img.className = 'admin-image-preview'; img.src = src; previewWrap.appendChild(img); }

  if (inputFiles) inputFiles.addEventListener('change', function(){
    clearPreviews();
    const files = Array.from(this.files).slice(0,6);
    if (files.length === 0) { previewWrap.innerHTML = '<div class="muted">No images selected</div>'; return; }
    // client-side size validation
    const oversized = files.find(f => f.size > MAX_SIZE);
    if (oversized) {
      alert('One or more selected files exceed the 5MB limit. Please choose smaller files.');
      this.value = '';
      previewWrap.innerHTML = '<div class="muted">No images selected</div>';
      return;
    }
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = function(e){ addPreviewSrc(e.target.result); }
      reader.readAsDataURL(f);
    });
    // clear URL textarea when files chosen
    if (urlArea) urlArea.value = '';
  });

  if (urlArea) urlArea.addEventListener('input', function(){
    clearPreviews();
    const lines = this.value.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0,6);
    if (lines.length === 0) { previewWrap.innerHTML = '<div class="muted">No images selected</div>'; return; }
    lines.forEach(addPreviewSrc);
    // clear file input when URLs entered
    if (inputFiles) inputFiles.value = '';
  });

  // Final check on submit
  if (form) form.addEventListener('submit', function(e){
    if (!inputFiles) return;
    const files = Array.from(inputFiles.files);
    if (files.length > 6) { e.preventDefault(); alert('You can upload up to 6 images only.'); return; }
    const oversized = files.find(f => f.size > MAX_SIZE);
    if (oversized) { e.preventDefault(); alert('One or more files exceed the 5MB size limit. Please choose smaller images.'); return; }
  });
}

// Service page filtering (moved from inline script to external for CSP)
function initServiceFilters(){
  const categoryButtons = document.querySelectorAll('.category-btn');
  const serviceCards = document.querySelectorAll('.service-card');
  if (!categoryButtons || categoryButtons.length === 0) return; // not on services page

  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      categoryButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      this.classList.add('active');

      const category = this.getAttribute('data-category');

      // Show/hide service cards based on category
      serviceCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || category === cardCategory) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 100);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

function initContactForm() {
  const contactForm = document.getElementById('contactForm'); if (!contactForm) return;
  const successMessage = document.getElementById('formSuccess');
  contactForm.addEventListener('submit', async function(e){
    e.preventDefault(); clearErrors(); if (!validateForm()) return; 
    const submitBtn = contactForm.querySelector('button[type="submit"]'); const originalText = submitBtn.innerHTML; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; submitBtn.disabled = true;
    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      service: document.getElementById('service').value,
      message: document.getElementById('message').value.trim()
    };
    try {
      const res = await fetch('/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Submission failed');
      // show success
      submitBtn.innerHTML = originalText; submitBtn.disabled = false; successMessage.style.display = 'flex'; contactForm.reset(); successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // If server returned WhatsApp link, open it in new tab
      if (data.whatsapp) window.open(data.whatsapp, '_blank');
      setTimeout(() => { successMessage.style.display = 'none'; }, 10000);
    } catch (err) {
      submitBtn.innerHTML = originalText; submitBtn.disabled = false; alert(err.message || 'Submission failed');
    }
  });

  function validateForm(){ let isValid = true; const name = document.getElementById('name'); const nameError = document.getElementById('nameError'); if (!name.value.trim()) { nameError.textContent = 'Please enter your full name.'; name.style.borderColor = '#e74c3c'; isValid = false; } else if (name.value.trim().length < 2) { nameError.textContent = 'Name must be at least 2 characters long.'; name.style.borderColor = '#e74c3c'; isValid = false; }
    const email = document.getElementById('email'); const emailError = document.getElementById('emailError'); const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!email.value.trim()) { emailError.textContent = 'Please enter your email address.'; email.style.borderColor = '#e74c3c'; isValid = false; } else if (!emailRegex.test(email.value)) { emailError.textContent = 'Please enter a valid email address.'; email.style.borderColor = '#e74c3c'; isValid = false; }
    const phone = document.getElementById('phone'); const phoneError = document.getElementById('phoneError'); const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/; if (phone.value.trim() && !phoneRegex.test(phone.value.replace(/[\s\-\(\)]/g, ''))) { phoneError.textContent = 'Please enter a valid phone number.'; phone.style.borderColor = '#e74c3c'; isValid = false; }
    const message = document.getElementById('message'); const messageError = document.getElementById('messageError'); if (!message.value.trim()) { messageError.textContent = 'Please enter your message.'; message.style.borderColor = '#e74c3c'; isValid = false; } else if (message.value.trim().length < 10) { messageError.textContent = 'Message must be at least 10 characters long.'; message.style.borderColor = '#e74c3c'; isValid = false; }
    return isValid; }
  function clearErrors(){ document.querySelectorAll('.error-message').forEach(e => e.textContent = ''); document.querySelectorAll('input, textarea, select').forEach(i => i.style.borderColor = '#ddd'); }
}

// Fallback initializer: if initGallery didn't run for any reason, call it after 700ms (external script to satisfy CSP)
setTimeout(function(){ try { if (typeof initGallery === 'function' && !window.__galleryInitialized) { console.debug('Fallback (external): calling initGallery'); initGallery(); } } catch(e) { console.error('Fallback initGallery error', e); } }, 700);


function initSmoothScrolling() {
  // delegated click handler — only handle anchors within the main-nav
  document.addEventListener('click', function(e) {
    const anchor = e.target.closest && e.target.closest('a');
    if (!anchor) return;
    const mainNav = document.querySelector('.main-nav');
    if (!mainNav || !mainNav.contains(anchor)) return; // only handle nav links here

    const href = anchor.getAttribute('href') || '';
    if (!href.includes('#')) return; // not an anchor link

    // determine target hash and path
    let pathPart = '';
    let hashPart = '';
    try {
      const url = new URL(href, window.location.origin);
      pathPart = url.pathname || '';
      hashPart = url.hash || '';
    } catch (err) {
      // fallback for relative or malformed hrefs
      const parts = href.split('#');
      pathPart = parts[0] || '';
      hashPart = parts[1] ? '#' + parts[1] : '';
    }

    const currentPath = window.location.pathname || '/';
    const targetPath = pathPart === '' ? currentPath : (pathPart === '/' ? '/' : pathPart);

    // if the link targets a different page, allow navigation (browser will navigate, then initHashScroll will act on load)
    if (targetPath !== currentPath && targetPath !== '/') return;

    if (!hashPart) return; // nothing to scroll to

    // resolve target by id or name
    let target = document.querySelector(hashPart);
    if (!target) {
      const id = hashPart.replace(/^#/, '');
      target = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
    }

    // Handle special 'home' target -> scroll to top
    if (!target && (hashPart === '#home' || hashPart === '#top')) {
      e.preventDefault();
      const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try { history.replaceState(null, '', targetPath + hashPart); } catch (err) {}
      document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
      anchor.classList.add('active');
      return;
    }

    // if still no target found, allow normal navigation
    if (!target) return;

    // Prevent default navigation and perform a reliable smooth scroll (with a retry)
    e.preventDefault();

    // close mobile nav if open
    if (mainNav && mainNav.classList.contains('active')) {
      mainNav.classList.remove('active');
      const btnIcon = document.querySelector('.mobile-menu-btn i');
      if (btnIcon) { btnIcon.classList.remove('fa-times'); btnIcon.classList.add('fa-bars'); document.body.style.overflow = ''; }
    }

    const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
    const computeTop = () => Math.round(target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8);

    const performScroll = () => {
      const top = computeTop();
      // debug log to help diagnose problems (remove if noisy)
      console.debug('nav-scroll', { href, hashPart, targetExists: !!target, top });
      window.scrollTo({ top, behavior: 'smooth' });
      // try a small nudge after layout settles
      setTimeout(() => { window.scrollTo({ top: computeTop(), behavior: 'smooth' }); }, 200);
    };

    // do the scroll, and update URL + active classes
    performScroll();
    try { history.replaceState(null, '', targetPath + hashPart); } catch (err) {}
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    anchor.classList.add('active');
  }, { passive: false });
}

function initHashScroll() {
  // If the page was opened with a hash (e.g. /#contact), scroll smoothly to the target and set the active nav link
  if (window.location.hash) {
    const id = window.location.hash;
    const target = document.querySelector(id);
    if (target) {
      const header = document.querySelector('.header');
      const headerHeight = header ? header.offsetHeight : 0;
      // small timeout to allow layout and header calc
      setTimeout(() => {
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;
        window.scrollTo({ top, behavior: 'smooth' });
        // set active nav link that matches the hash (works for '/#hash' and '#hash')
        const selector = `.nav-link[href$="${id}"]`;
        document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
        const link = document.querySelector(selector);
        if (link) link.classList.add('active');
      }, 80);
    }
  }
}

function initBackToTop() { const backToTopBtn = document.querySelector('.back-to-top'); if (!backToTopBtn) return; window.addEventListener('scroll', function() { if (window.pageYOffset > 300) { backToTopBtn.classList.add('visible'); } else { backToTopBtn.classList.remove('visible'); } }); backToTopBtn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); }); }

function initActiveNavOnScroll(){ const sections = document.querySelectorAll('section'); const navLinks = document.querySelectorAll('.nav-link'); window.addEventListener('scroll', function(){ let current = ''; sections.forEach(section => { const sectionTop = section.offsetTop; const sectionHeight = section.clientHeight; const headerHeight = document.querySelector('.header').offsetHeight; if (window.pageYOffset >= (sectionTop - headerHeight - 100)) { current = section.getAttribute('id'); } }); navLinks.forEach(link => { link.classList.remove('active'); const href = link.getAttribute('href') || ''; let hash = ''; try { hash = new URL(href, window.location.origin).hash || ''; } catch(e) { if (href.includes('#')) hash = '#' + href.split('#').pop(); } if (hash === `#${current}`) link.classList.add('active'); }); const header = document.querySelector('.header'); if (window.pageYOffset > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }); }

function initScrollAnimations() { const animateElements = document.querySelectorAll('.animate-on-scroll, .service-card, .mission-card, .stat-item, .gallery-item, .project-card'); const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } }); }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }); animateElements.forEach(element => { element.style.opacity = '0'; element.style.transform = 'translateY(20px)'; element.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; observer.observe(element); }); }
