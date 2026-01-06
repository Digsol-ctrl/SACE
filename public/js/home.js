document.addEventListener('DOMContentLoaded', function() {
  setCurrentYear();
  initMobileMenu();
  initHeroSlider();
  initGallery();
  initContactForm();
  initSmoothScrolling();
  initBackToTop();
  initActiveNavOnScroll();
  initScrollAnimations();
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

function initGallery() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
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

  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxTitle = lightbox.querySelector('.lightbox-title');
  const lightboxCategory = lightbox.querySelector('.lightbox-category');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
  const nextBtn = lightbox.querySelector('.lightbox-nav.next');
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  let current = 0;
  const images = items.map((item, index) => ({ src: item.querySelector('img').getAttribute('src'), title: item.querySelector('h3') ? item.querySelector('h3').textContent : '', category: item.querySelector('p') ? item.querySelector('p').textContent : '', index }));
  items.forEach((item, index) => item.addEventListener('click', () => openLightbox(index)));
  function openLightbox(index){ current = index; updateLightbox(); lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeLightbox(){ lightbox.classList.remove('active'); document.body.style.overflow = ''; }
  function updateLightbox(){ const image = images[current]; lightboxImage.setAttribute('src', image.src); lightboxImage.setAttribute('alt', image.title); lightboxTitle.textContent = image.title; lightboxCategory.textContent = image.category; }
  function showNextImage(){ current = (current + 1) % images.length; updateLightbox(); }
  function showPrevImage(){ current = (current - 1 + images.length) % images.length; updateLightbox(); }
  closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
  if (nextBtn) nextBtn.addEventListener('click', showNextImage);
  lightbox.addEventListener('click', function(e){ if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function(e){ if (!lightbox.classList.contains('active')) return; switch(e.key){ case 'Escape': closeLightbox(); break; case 'ArrowLeft': showPrevImage(); break; case 'ArrowRight': showNextImage(); break; } });
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

function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.addEventListener('click', function(e) { e.preventDefault(); const targetId = this.getAttribute('href'); const targetSection = document.querySelector(targetId); if (targetSection) { const headerHeight = document.querySelector('.header').offsetHeight; const targetPosition = targetSection.offsetTop - headerHeight; window.scrollTo({ top: targetPosition, behavior: 'smooth' }); } }));
}

function initBackToTop() { const backToTopBtn = document.querySelector('.back-to-top'); if (!backToTopBtn) return; window.addEventListener('scroll', function() { if (window.pageYOffset > 300) { backToTopBtn.classList.add('visible'); } else { backToTopBtn.classList.remove('visible'); } }); backToTopBtn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); }); }

function initActiveNavOnScroll(){ const sections = document.querySelectorAll('section'); const navLinks = document.querySelectorAll('.nav-link'); window.addEventListener('scroll', function(){ let current = ''; sections.forEach(section => { const sectionTop = section.offsetTop; const sectionHeight = section.clientHeight; const headerHeight = document.querySelector('.header').offsetHeight; if (window.pageYOffset >= (sectionTop - headerHeight - 100)) { current = section.getAttribute('id'); } }); navLinks.forEach(link => { link.classList.remove('active'); if (link.getAttribute('href') === `#${current}`) link.classList.add('active'); }); const header = document.querySelector('.header'); if (window.pageYOffset > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }); }

function initScrollAnimations() { const animateElements = document.querySelectorAll('.service-card, .mission-card, .stat-item, .gallery-item'); const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; } }); }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }); animateElements.forEach(element => { element.style.opacity = '0'; element.style.transform = 'translateY(20px)'; element.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; observer.observe(element); }); }
