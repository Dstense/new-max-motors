const carGrid = document.getElementById('carGrid');
const carSearch = document.getElementById('carSearch');
const brandFilter = document.getElementById('brandFilter');
const fuelFilter = document.getElementById('fuelFilter');
const sortFilter = document.getElementById('sortFilter');
const resultsCount = document.getElementById('resultsCount');
const noResults = document.getElementById('noResults');
const WHATSAPP_NUMBER = '919257862121';
const CATALOGUE_URL = 'https://wa.me/c/919257862121';
let cars = [];

function escapeHTML(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function safeExternalUrl(value, fallback = '') {
  const url = String(value || '').trim();
  return /^https?:\/\/[^\s]+$/i.test(url) ? url : fallback;
}

function slugify(value) {
  return String(value || '').toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function formatPrice(price, note) {
  if (price === null || price === undefined || price === '' || !Number.isFinite(Number(price))) {
    return note || 'Price on request';
  }
  const amount = Number(price);
  if (amount >= 100000) {
    let lakh = (amount / 100000).toFixed(2).replace(/\.?0+$/, '');
    return '₹' + lakh + ' lakh';
  }
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
}

function makeCard(car) {
  const article = document.createElement('article');
  const brand = slugify(car.brand || car.brandName);
  article.className = 'car-card';
  article.dataset.brand = brand;
  article.dataset.fuel = car.fuel || 'other';
  article.dataset.price = car.price == null ? '' : String(car.price);
  article.dataset.name = [car.name, car.brandName, car.year, (car.specs || []).join(' '), car.description].join(' ');
  const title = escapeHTML(car.name || 'Pre-owned car');
  const year = escapeHTML(car.year || 'Year not stated');
  const imageUrl = safeExternalUrl(car.imageUrl);
  const sourceUrl = safeExternalUrl(car.sourceUrl, CATALOGUE_URL);
  const photoLabel = escapeHTML(car.imageLabel || 'MODEL PHOTO');
  const category = escapeHTML(car.category || 'PRE-OWNED CAR');
  const specItems = Array.isArray(car.specs) ? car.specs.filter(Boolean).slice(0, 7) : [];
  const specsHTML = specItems.length
    ? specItems.map((spec) => '<span>' + escapeHTML(spec) + '</span>').join('')
    : '<span>Ask for vehicle details</span>';
  const description = String(car.description || '').trim();
  const priceText = escapeHTML(formatPrice(car.price, car.priceNote));
  const message = 'Hi NEW MAX MOTORS, I am interested in the ' + (car.year ? car.year + ' ' : '') +
    (car.name || 'used car') + '. Please confirm current availability, asking price, actual vehicle photos and updated details.';
  const enquiryUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  const sourceText = sourceUrl.includes('/item/') || sourceUrl.includes('facebook.com/')
    ? 'View original listing ↗' : 'Open WhatsApp catalogue ↗';
  const imageBlock = imageUrl
    ? '<img src="' + escapeHTML(imageUrl) + '" alt="' + escapeHTML('Photo of ' + (car.name || 'car') + (car.imageLabel === 'VEHICLE PHOTO' ? '' : ' model reference; confirm exact vehicle photos')) + '" loading="lazy"><span class="car-photo-label">' + photoLabel + '</span>'
    : '<span class="photo-placeholder"><span aria-hidden="true">🚘</span><span>Photo coming soon</span></span><span class="car-photo-label">PHOTO NEEDED</span>';
  article.innerHTML =
    '<a class="car-image' + (imageUrl ? '' : ' car-image-empty') + '" href="' + escapeHTML(sourceUrl) + '" target="_blank" rel="noopener" aria-label="' + escapeHTML('View information for ' + (car.name || 'car')) + '">' +
      imageBlock + '<span class="car-year">' + year + '</span></a>' +
    '<div class="car-content">' +
      '<div class="car-topline"><span class="car-category">' + category + '</span><span class="car-stock">Confirm availability</span></div>' +
      '<h3>' + title + '</h3>' +
      '<div class="car-specs">' + specsHTML + '</div>' +
      (description ? '<p class="car-description">' + escapeHTML(description) + '</p>' : '') +
      '<div class="car-price-row"><div><small>Asking price</small><strong>' + priceText + '</strong></div>' +
      '<a class="card-enquire" href="' + escapeHTML(enquiryUrl) + '" target="_blank" rel="noopener">Enquire ↗</a></div>' +
      '<a class="listing-link" href="' + escapeHTML(sourceUrl) + '" target="_blank" rel="noopener">' + sourceText + '</a>' +
    '</div>';
  return article;
}

function populateBrands() {
  const selected = brandFilter.value;
  const brands = new Map();
  cars.forEach((car) => {
    const key = slugify(car.brand || car.brandName);
    if (key) brands.set(key, car.brandName || car.brand || key);
  });
  brandFilter.replaceChildren(new Option('All brands', 'all'));
  [...brands.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([value, label]) => {
    brandFilter.add(new Option(label, value));
  });
  if ([...brands.keys()].includes(selected)) brandFilter.value = selected;
}

function filterCars() {
  const query = carSearch.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const fuel = fuelFilter.value;
  let visible = cars.filter((car) => {
    const searchText = [car.name, car.brandName, car.year, car.category, (car.specs || []).join(' '), car.description].join(' ').toLowerCase();
    return searchText.includes(query) &&
      (brand === 'all' || slugify(car.brand || car.brandName) === brand) &&
      (fuel === 'all' || car.fuel === fuel);
  });
  const priceOf = (car) => car.price == null || car.price === '' ? null : Number(car.price);
  if (sortFilter.value === 'low-high') visible.sort((a, b) => {
    const pa = priceOf(a), pb = priceOf(b);
    if (pa === null) return pb === null ? 0 : 1;
    if (pb === null) return -1;
    return pa - pb;
  });
  if (sortFilter.value === 'high-low') visible.sort((a, b) => {
    const pa = priceOf(a), pb = priceOf(b);
    if (pa === null) return pb === null ? 0 : 1;
    if (pb === null) return -1;
    return pb - pa;
  });
  carGrid.replaceChildren(...visible.map(makeCard));
  resultsCount.textContent = visible.length + ' featured ' + (visible.length === 1 ? 'listing' : 'listings');
  noResults.hidden = visible.length !== 0;
  carGrid.hidden = visible.length === 0;
}

async function loadInventory() {
  try {
    const response = await fetch('/cars.json?ts=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load inventory');
    const data = await response.json();
    cars = Array.isArray(data.cars) ? data.cars : [];
    populateBrands();
    filterCars();
  } catch (error) {
    carGrid.innerHTML = '<p class="inventory-loading">Inventory could not be loaded. Please contact NEW MAX MOTORS on WhatsApp for current cars.</p>';
    resultsCount.textContent = 'Inventory unavailable';
    noResults.hidden = true;
  }
}

[carSearch, brandFilter, fuelFilter, sortFilter].forEach((control) => {
  control.addEventListener(control === carSearch ? 'input' : 'change', filterCars);
});

const menuToggle = document.getElementById('menuToggle');
const primaryNav = document.getElementById('primaryNav');
if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu');
    primaryNav.classList.toggle('open', !expanded);
  });
  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
    });
  });
}

const sellForm = document.getElementById('sellForm');
if (sellForm) {
  sellForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const model = String(form.get('model') || '').trim();
    const year = String(form.get('year') || '').trim();
    const km = String(form.get('km') || '').trim();
    const fuel = String(form.get('fuel') || '').trim();
    const price = String(form.get('price') || '').trim() || 'Not specified';
    const message = "Hi NEW MAX MOTORS, I'd like to sell or exchange my car. Name: " + name + '. Car: ' + model +
      '. Year: ' + year + '. Kilometres: ' + km + '. Fuel: ' + fuel + '. Expected price: ' + price + '. Please let me know the next steps.';
    window.open('https://wa.me/919987951585?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  });
}

const currentYear = document.getElementById('currentYear');
if (currentYear) currentYear.textContent = new Date().getFullYear();

loadInventory();
