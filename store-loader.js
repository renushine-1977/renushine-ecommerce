(async function loadStoreSettings() {
  const safeText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && typeof value === 'string') el.textContent = value;
  };
  const safeHtmlLines = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && typeof value === 'string') el.innerHTML = value.split('\n').map(s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))).join('<br>');
  };
  try {
    const response = await fetch('store-data.json?v=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data.products) || !data.products.length) return;
    const root = document.documentElement;
    const theme = data.theme || {};
    if (theme.pink) root.style.setProperty('--pink', theme.pink);
    if (theme.pinkDark) root.style.setProperty('--pink-dark', theme.pinkDark);
    if (theme.pinkSoft) root.style.setProperty('--pink-soft', theme.pinkSoft);
    if (theme.ink) root.style.setProperty('--ink', theme.ink);
    if (theme.muted) root.style.setProperty('--muted', theme.muted);

    safeText('.announcement', data.announcement);
    if (data.hero) {
      safeText('.hero-copy .eyebrow', data.hero.eyebrow);
      safeHtmlLines('.hero-copy h1', data.hero.title);
      safeText('.hero-copy p', data.hero.description);
      safeText('.hero-copy .cta', data.hero.button);
    }
    if (Array.isArray(data.benefits)) {
      const box = document.querySelector('.benefits');
      if (box) box.innerHTML = data.benefits.map(item => '<span class="benefit"></span>').join('');
      if (box) box.querySelectorAll('.benefit').forEach((el, i) => { el.textContent = data.benefits[i] || ''; });
    }
    if (data.shop) {
      safeText('.shop .section-head .eyebrow', data.shop.eyebrow);
      safeText('.shop .section-head h2', data.shop.title);
    }
    if (data.about) {
      safeText('.story-copy .eyebrow', data.about.eyebrow);
      safeText('.story-copy h2', data.about.title);
      safeText('.story-copy p', data.about.description);
      safeText('.story-copy .cta', data.about.button);
    }
    if (data.contact) {
      safeText('.newsletter .eyebrow', data.contact.eyebrow);
      safeText('.newsletter h2', data.contact.title);
      const contactParagraphs = document.querySelectorAll('.newsletter p');
      if (contactParagraphs[0]) contactParagraphs[0].textContent = data.contact.description || '';
      const phoneLink = document.querySelector('.newsletter a[href^="tel:"]');
      const emailLink = document.querySelector('.newsletter a[href^="mailto:"]');
      const phone = data.contact.phone || '';
      const email = data.contact.email || '';
      if (phoneLink) { phoneLink.textContent = phone; phoneLink.href = 'tel:' + phone.replace(/[^+\d]/g, ''); }
      if (emailLink) { emailLink.textContent = email; emailLink.href = 'mailto:' + email; }
      const wa = String(data.contact.whatsapp || '').replace(/\D/g, '');
      document.querySelectorAll('a[href*="wa.me/"]').forEach(a => { if (wa) a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + wa); });
      const footerPhone = document.querySelector('footer span:nth-child(3)');
      if (footerPhone) footerPhone.textContent = phone;
    }
    if (Array.isArray(data.products) && typeof products !== 'undefined') {
      products.splice(0, products.length, ...data.products.filter(p => p.visible !== false));
      drawProducts();
      const oldUpdateCart = updateCart;
      updateCart = function () {
        oldUpdateCart();
        const current = String(data.contact && data.contact.whatsapp || '917010589092').replace(/\D/g, '');
        const message = cart.length
          ? 'Hello Renu Shine, I would like to order:\n' + cart.map(item => {
              const product = products.find(p => p.id === item.id);
              return `- ${product ? product.name : 'Product'}, ${item.size.label} × ${item.qty} (₹${item.size.price == null ? 'price on request' : Number(item.size.price).toLocaleString('en-IN')} each)`;
            }).join('\n') + '\nPlease confirm availability, final total and delivery.'
          : 'Hello Renu Shine, I would like to know about your products.';
        const checkout = document.getElementById('checkout');
        if (checkout) checkout.href = 'https://wa.me/' + current + '?text=' + encodeURIComponent(message);
      };
      updateCart();
    }
  } catch (error) {
    console.warn('Store settings could not be loaded; showing the built-in storefront content.', error);
  }
})();
