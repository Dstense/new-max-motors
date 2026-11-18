const API_URL = '/api/admin-cars';
const CATALOGUE_URL = 'https://wa.me/c/919257862121';
const loginPanel = document.getElementById('loginPanel');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const adminPassword = document.getElementById('adminPassword');
const loginButton = document.getElementById('loginButton');
const loginStatus = document.getElementById('loginStatus');
const logoutButton = document.getElementById('logoutButton');
const carForm = document.getElementById('carForm');
const formStatus = document.getElementById('formStatus');
const formTitle = document.getElementById('formTitle');
const formStep = document.getElementById('formStep');
const submitCarButton = document.getElementById('submitCarButton');
const cancelEditButton = document.getElementById('cancelEditButton');
const adminInventory = document.getElementById('adminInventory');
const adminSearch = document.getElementById('adminSearch');
const inventoryBadge = document.getElementById('inventoryBadge');
let token = sessionStorage.getItem('nmm_admin_token') || '';
let cars = [];
let saving = false;

function setStatus(element, message, kind) {
  element.textContent = message || '';
  element.classList.toggle('is-error', kind === 'error');
  element.classList.toggle('is-success', kind === 'success');
}

function escapeHTML(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function safeUrl(value) {
  const url = String(value || '').trim();
  if (/^\/car-images\/[a-z0-9][a-z0-9._-]*\.jpg$/i.test(url)) return url;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

function slugify(value) {
  return String(value || '').toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

async function callApi(payload, useToken = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (useToken && token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify(payload), cache: 'no-store' });
  let result;
  try { result = await response.json(); } catch { result = {}; }
  if (!response.ok || !result.ok) {
    if (response.status === 401 && useToken) {
      sessionStorage.removeItem('nmm_admin_token');
      token = '';
    }
    throw new Error(result.error || 'Something went wrong. Please try again.');
  }
  return result;
}

function setLoggedIn(isLoggedIn) {
  loginPanel.hidden = isLoggedIn;
  dashboard.hidden = !isLoggedIn;
  logoutButton.hidden = !isLoggedIn;
  if (isLoggedIn) {
    setStatus(loginStatus, '', '');
    loadInventory();
  } else {
    setStatus(loginStatus, '', '');
  }
}

async function loadInventory() {
  adminInventory.innerHTML = '<div class="empty-state">Loading latest inventory from GitHub…</div>';
  try {
    const result = await callApi({ action: 'load' });
    cars = Array.isArray(result.cars) ? result.cars : [];
    renderInventory();
    updateStats();
  } catch (error) {
    adminInventory.innerHTML = '<div class="empty-state">' + escapeHTML(error.message) + '</div>';
    if (!token) setLoggedIn(false);
  }
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Price on request';
  const amount = Number(price);
  if (!Number.isFinite(amount)) return 'Price on request';
  if (amount >= 100000) {
    return '₹' + (amount / 100000).toFixed(2).replace(/\.?0+$/, '') + ' lakh';
  }
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
}

function renderInventory() {
  const query = adminSearch.value.trim().toLowerCase();
  const filtered = cars.filter((car) => [car.name, car.brandName, car.year, car.category].join(' ').toLowerCase().includes(query));
  inventoryBadge.textContent = cars.length + (cars.length === 1 ? ' car' : ' cars');
  if (!filtered.length) {
    adminInventory.innerHTML = '<div class="empty-state">' + (cars.length ? 'No cars match this search.' : 'Your inventory is empty. Add your first car using the form.') + '</div>';
    return;
  }
  adminInventory.innerHTML = filtered.map((car) => {
    const image = safeUrl(car.imageUrl);
    const imageHtml = image
      ? '<img src="' + escapeHTML(image) + '" alt="" loading="lazy">'
      : '<span aria-hidden="true">🚘</span>';
    const meta = [car.year, car.brandName || car.brand, car.fuel].filter(Boolean).join(' · ');
    return '<article class="admin-car" data-id="' + escapeHTML(car.id) + '">' +
      '<div class="admin-car-image">' + imageHtml + '</div>' +
      '<div class="admin-car-body"><div class="admin-car-top"><h3>' + escapeHTML(car.name) + '</h3></div>' +
      '<div class="admin-car-price">' + escapeHTML(formatPrice(car.price)) + '</div>' +
      '<div class="admin-car-meta">' + escapeHTML(meta) + '</div>' +
      '<div class="admin-car-actions"><button class="mini-button" type="button" data-action="edit" data-id="' + escapeHTML(car.id) + '">Edit details</button>' +
      '<button class="mini-button delete" type="button" data-action="delete" data-id="' + escapeHTML(car.id) + '">Remove car</button></div></div></article>';
  }).join('');
}

function updateStats() {
  document.getElementById('totalCount').textContent = String(cars.length);
  document.getElementById('pricedCount').textContent = String(cars.filter((car) => car.price !== null && car.price !== undefined && car.price !== '').length);
  document.getElementById('photoCount').textContent = String(cars.filter((car) => !car.imageUrl || car.imageLabel !== 'VEHICLE PHOTO').length);
}

function clearForm() {
  carForm.reset();
  document.getElementById('carPhotoFile').value = '';
  updatePhotoPreview('', '');
  setStatus(document.getElementById('photoUploadStatus'), '', '');
  document.getElementById('carId').value = '';
  document.getElementById('carSource').value = CATALOGUE_URL;
  formTitle.textContent = 'Add a car';
  formStep.textContent = '01';
  submitCarButton.innerHTML = 'Add car to website <span aria-hidden="true">→</span>';
  cancelEditButton.hidden = true;
  setStatus(formStatus, '', '');
}

function updatePhotoPreview(value, name = '') {
  const path = safeUrl(value);
  const preview = document.getElementById('photoPreview');
  const previewImage = document.getElementById('photoPreviewImage');
  const previewName = document.getElementById('photoPreviewName');
  const previewMeta = document.getElementById('photoPreviewMeta');
  if (!path) {
    preview.hidden = true;
    previewImage.removeAttribute('src');
    previewName.textContent = '';
    previewMeta.textContent = '';
    return;
  }
  previewImage.src = path;
  previewName.textContent = name || path.split('/').pop() || 'Car photo';
  previewMeta.textContent = path.startsWith('/car-images/') ? 'Saved in the New Max Motors repository' : 'External image URL';
  preview.hidden = false;
}

function fileToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read this photo. Please choose another image.'));
    reader.readAsDataURL(blob);
  });
}

async function makeUploadImage(file) {
  if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type)) {
    throw new Error('Choose a JPG, PNG or WebP photo.');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('This photo is over 20 MB. Choose a smaller original image.');
  }
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Could not open this image. Try a JPG or PNG photo instead.');
  }
  try {
    let scale = Math.min(1, 1500 / Math.max(bitmap.width, bitmap.height));
    const targetBytes = 540 * 1024;
    let blob = null;
    const qualities = [0.84, 0.78, 0.72, 0.66, 0.60];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('Your browser could not prepare this photo.');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const quality = qualities[Math.min(attempt % qualities.length, qualities.length - 1)];
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= targetBytes) break;
      scale *= 0.82;
    }
    if (!blob || blob.size > targetBytes) {
      throw new Error('Could not resize the photo small enough. Try a smaller photo.');
    }
    const dataUrl = await fileToDataUrl(blob);
    return { imageData: dataUrl.split(',')[1], bytes: blob.size };
  } finally {
    if (bitmap && typeof bitmap.close === 'function') bitmap.close();
  }
}

function startEditing(car) {
  document.getElementById('carId').value = car.id || '';
  document.getElementById('carName').value = car.name || '';
  document.getElementById('carBrand').value = car.brandName || car.brand || '';
  document.getElementById('carYear').value = car.year || '';
  document.getElementById('carPrice').value = car.price == null ? '' : car.price;
  document.getElementById('carFuel').value = car.fuel || 'other';
  document.getElementById('carCategory').value = car.category || '';
  document.getElementById('carSpecs').value = Array.isArray(car.specs) ? car.specs.join('\n') : '';
  document.getElementById('carDescription').value = car.description || '';
  document.getElementById('carImage').value = car.imageUrl || '';
  document.getElementById('carPhotoFile').value = '';
  updatePhotoPreview(car.imageUrl || '', car.name || '');
  setStatus(document.getElementById('photoUploadStatus'), '', '');
  document.getElementById('exactPhoto').checked = car.imageLabel === 'VEHICLE PHOTO';
  document.getElementById('carSource').value = car.sourceUrl || CATALOGUE_URL;
  formTitle.textContent = 'Edit car';
  formStep.textContent = '02';
  submitCarButton.innerHTML = 'Save car changes <span aria-hidden="true">→</span>';
  cancelEditButton.hidden = false;
  setStatus(formStatus, 'Editing: ' + car.name, '');
  document.querySelector('.editor-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function saveInventory(nextCars) {
  if (saving) return false;
  saving = true;
  submitCarButton.disabled = true;
  formStatus.textContent = 'Saving inventory to GitHub…';
  try {
    const result = await callApi({ action: 'save', cars: nextCars });
    cars = result.cars;
    renderInventory();
    updateStats();
    setStatus(formStatus, result.message || 'Saved. Netlify will publish the changes shortly.', 'success');
    return true;
  } catch (error) {
    setStatus(formStatus, error.message, 'error');
    if (!token) setLoggedIn(false);
    return false;
  } finally {
    saving = false;
    submitCarButton.disabled = false;
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginButton.disabled = true;
  setStatus(loginStatus, 'Checking access…', '');
  try {
    const result = await callApi({ action: 'login', password: adminPassword.value }, false);
    token = result.token;
    sessionStorage.setItem('nmm_admin_token', token);
    adminPassword.value = '';
    setLoggedIn(true);
  } catch (error) {
    setStatus(loginStatus, error.message, 'error');
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener('click', () => {
  token = '';
  sessionStorage.removeItem('nmm_admin_token');
  clearForm();
  setLoggedIn(false);
  adminPassword.focus();
});

carForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (saving) return;
  const name = document.getElementById('carName').value.trim();
  const brandName = document.getElementById('carBrand').value.trim();
  const year = Number(document.getElementById('carYear').value);
  const rawPrice = document.getElementById('carPrice').value.trim();
  const price = rawPrice === '' ? null : Number(rawPrice);
  const fuel = document.getElementById('carFuel').value;
  const category = document.getElementById('carCategory').value.trim().toUpperCase();
  const specs = document.getElementById('carSpecs').value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean).slice(0, 16);
  const description = document.getElementById('carDescription').value.trim();
  const rawImage = document.getElementById('carImage').value.trim();
  const imageUrl = rawImage ? safeUrl(rawImage) : '';
  const rawSource = document.getElementById('carSource').value.trim();
  const sourceUrl = rawSource ? safeUrl(rawSource) : CATALOGUE_URL;
  const editingId = document.getElementById('carId').value;
  if (!name || !brandName || !Number.isInteger(year) || year < 1980 || year > 2100) {
    setStatus(formStatus, 'Enter the car name, brand and a valid model year.', 'error');
    return;
  }
  if (rawPrice !== '' && (!Number.isSafeInteger(price) || price < 0 || price > 500000000)) {
    setStatus(formStatus, 'Enter the asking price in rupees, for example 675000, or leave it empty.', 'error');
    return;
  }
  if (rawImage && !imageUrl) {
    setStatus(formStatus, 'Use a valid http:// or https:// image URL, or a photo uploaded through this panel.', 'error');
    return;
  }
  if (rawSource && !sourceUrl) {
    setStatus(formStatus, 'The source link must use a valid http:// or https:// URL.', 'error');
    return;
  }
  const id = editingId || (slugify(name) + '-' + Date.now().toString().slice(-9));
  const car = {
    id, name, brand: slugify(brandName), brandName, fuel, category: category || 'PRE-OWNED CAR',
    year, price, priceNote: price === null ? 'Price on request' : '',
    imageUrl, imageLabel: document.getElementById('exactPhoto').checked ? 'VEHICLE PHOTO' : 'MODEL PHOTO',
    specs, description, sourceUrl
  };
  const nextCars = editingId
    ? cars.map((item) => item.id === editingId ? car : item)
    : [car, ...cars];
  const saved = await saveInventory(nextCars);
  if (saved) {
    clearForm();
    document.getElementById('adminSearch').value = '';
    renderInventory();
    setStatus(formStatus, 'Saved to GitHub. Netlify will redeploy the public website.', 'success');
  }
});


document.getElementById('carImage').addEventListener('input', (event) => {
  updatePhotoPreview(event.currentTarget.value.trim(), '');
});

document.getElementById('uploadPhotoButton').addEventListener('click', async () => {
  const fileInput = document.getElementById('carPhotoFile');
  const file = fileInput.files && fileInput.files[0];
  const uploadButton = document.getElementById('uploadPhotoButton');
  const status = document.getElementById('photoUploadStatus');
  if (!file) {
    setStatus(status, 'Choose a photo first.', 'error');
    fileInput.focus();
    return;
  }
  uploadButton.disabled = true;
  setStatus(status, 'Resizing photo for the website…', '');
  try {
    const prepared = await makeUploadImage(file);
    setStatus(status, 'Uploading photo to GitHub…', '');
    const result = await callApi({
      action: 'uploadImage',
      imageName: file.name || document.getElementById('carName').value || 'car-photo',
      imageType: 'image/jpeg',
      imageData: prepared.imageData
    });
    document.getElementById('carImage').value = result.path;
    document.getElementById('exactPhoto').checked = true;
    updatePhotoPreview(result.path, file.name || 'Uploaded car photo');
    fileInput.value = '';
    setStatus(status, 'Photo uploaded (' + Math.round(prepared.bytes / 1024) + ' KB). Save the car listing to attach it. Netlify must finish deploying before the image appears publicly.', 'success');
  } catch (error) {
    setStatus(status, error.message || 'Could not upload this photo.', 'error');
  } finally {
    uploadButton.disabled = false;
  }
});

document.getElementById('clearPhotoButton').addEventListener('click', () => {
  document.getElementById('carImage').value = '';
  document.getElementById('carPhotoFile').value = '';
  document.getElementById('exactPhoto').checked = false;
  updatePhotoPreview('', '');
  setStatus(document.getElementById('photoUploadStatus'), 'Photo cleared from this listing. Save the car to apply the change.', '');
});

cancelEditButton.addEventListener('click', clearForm);
adminSearch.addEventListener('input', renderInventory);
adminInventory.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || saving) return;
  const id = button.dataset.id;
  const car = cars.find((item) => item.id === id);
  if (!car) return;
  if (button.dataset.action === 'edit') {
    startEditing(car);
    return;
  }
  if (button.dataset.action === 'delete') {
    const confirmed = window.confirm('Remove "' + car.name + '" from the website inventory? This change will be saved to GitHub.');
    if (!confirmed) return;
    const nextCars = cars.filter((item) => item.id !== id);
    const saved = await saveInventory(nextCars);
    if (saved) {
      if (document.getElementById('carId').value === id) clearForm();
      setStatus(formStatus, car.name + ' removed. Netlify will redeploy the public website.', 'success');
    }
  }
});

async function restoreSession() {
  if (!token) return;
  try {
    await callApi({ action: 'check' });
    setLoggedIn(true);
  } catch {
    token = '';
    sessionStorage.removeItem('nmm_admin_token');
    setLoggedIn(false);
  }
}

clearForm();
restoreSession();
