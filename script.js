const carGrid = document.getElementById('carGrid');
const cards = Array.from(carGrid.querySelectorAll('.car-card'));
const carSearch = document.getElementById('carSearch');
const brandFilter = document.getElementById('brandFilter');
const fuelFilter = document.getElementById('fuelFilter');
const sortFilter = document.getElementById('sortFilter');
const resultsCount = document.getElementById('resultsCount');
const noResults = document.getElementById('noResults');

function filterCars() {
  const query = carSearch.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const fuel = fuelFilter.value;
  const visibleCards = cards.filter((card) => {
    const matchesText = `${card.dataset.name} ${card.textContent}`.toLowerCase().includes(query);
    return matchesText && (brand === 'all' || card.dataset.brand === brand) && (fuel === 'all' || card.dataset.fuel === fuel);
  });
  const sortedCards = [...visibleCards];
  const priceOf = (card) => card.dataset.price && card.dataset.price.trim() !== '' ? Number(card.dataset.price) : null;
  if (sortFilter.value === 'low-high') sortedCards.sort((a, b) => { const pa = priceOf(a); const pb = priceOf(b); if (pa === null) return pb === null ? 0 : 1; if (pb === null) return -1; return pa - pb; });
  if (sortFilter.value === 'high-low') sortedCards.sort((a, b) => { const pa = priceOf(a); const pb = priceOf(b); if (pa === null) return pb === null ? 0 : 1; if (pb === null) return -1; return pb - pa; });
  cards.forEach((card) => { card.hidden = true; });
  sortedCards.forEach((card) => { card.hidden = false; carGrid.appendChild(card); });
  resultsCount.textContent = `${visibleCards.length} featured ${visibleCards.length === 1 ? 'listing' : 'listings'}`;
  noResults.hidden = visibleCards.length !== 0;
  carGrid.hidden = visibleCards.length === 0;
}

[carSearch, brandFilter, fuelFilter, sortFilter].forEach((control) => {
  control.addEventListener(control === carSearch ? 'input' : 'change', filterCars);
});

const menuToggle = document.getElementById('menuToggle');
const primaryNav = document.getElementById('primaryNav');
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

document.getElementById('sellForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get('name') || '').trim();
  const model = String(form.get('model') || '').trim();
  const year = String(form.get('year') || '').trim();
  const km = String(form.get('km') || '').trim();
  const fuel = String(form.get('fuel') || '').trim();
  const price = String(form.get('price') || '').trim() || 'Not specified';
  const message = `Hi NEW MAX MOTORS, I'd like to sell or exchange my car. Name: ${name}. Car: ${model}. Year: ${year}. Kilometres: ${km}. Fuel: ${fuel}. Expected price: ${price}. Please let me know the next steps.`;
  window.open(`https://wa.me/919987951585?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

document.getElementById('currentYear').textContent = new Date().getFullYear();

document.querySelectorAll('img').forEach((img) => {
  img.addEventListener('error', () => {
    img.classList.add('image-unavailable');
    img.alt = `${img.alt}. Image unavailable; ask the dealer for a current photo.`;
  }, { once: true });
});
