const state = { stores: [], filtered: [], markers: new Map(), activeCity: '', query: '' };
const map = L.map('map', { zoomControl: false }).setView([51.1, 10.2], 6);
L.control.zoom({ position: 'bottomright' }).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
}).addTo(map);

const pinIcon = L.divIcon({
  className: 'custom-marker',
  html: '<span></span>',
  iconSize: [34, 42],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38]
});

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

function address(store) {
  return [store.street, [store.postalCode, store.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

function focusStore(id) {
  const store = state.stores.find(item => item.id === id);
  const marker = state.markers.get(id);
  if (!store || !marker) return;
  map.flyTo([store.lat, store.lng], 15, { duration: 0.8 });
  marker.openPopup();
  document.querySelectorAll('.store-card').forEach(card => card.classList.toggle('active', card.dataset.id === id));
  document.querySelector(`.store-card[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function render() {
  const query = state.query.toLocaleLowerCase('de');
  state.filtered = state.stores.filter(store => {
    const matchesCity = !state.activeCity || store.city === state.activeCity;
    const haystack = `${store.name} ${store.city} ${store.street} ${store.postalCode}`.toLocaleLowerCase('de');
    return matchesCity && haystack.includes(query);
  });

  const visibleIds = new Set(state.filtered.map(store => store.id));
  state.markers.forEach((marker, id) => {
    if (visibleIds.has(id)) marker.addTo(map); else marker.remove();
  });

  document.getElementById('result-count').textContent = state.filtered.length;
  document.getElementById('empty-state').hidden = state.filtered.length > 0;
  document.getElementById('store-list').innerHTML = state.filtered.map(store => `
    <button class="store-card" type="button" data-id="${escapeHtml(store.id)}">
      <span class="card-top"><span class="city-label">${escapeHtml(store.city)}</span><span aria-hidden="true">↗</span></span>
      <strong>${escapeHtml(store.name)}</strong>
      <span>${escapeHtml(address(store))}</span>
      ${store.hours ? `<span class="hours"><i></i>${escapeHtml(store.hours)}</span>` : ''}
    </button>`).join('');
  document.querySelectorAll('.store-card').forEach(card => card.addEventListener('click', () => focusStore(card.dataset.id)));
}

async function init() {
  const response = await fetch('api/stores.php');
  if (!response.ok) throw new Error('Standorte konnten nicht geladen werden.');
  state.stores = await response.json();

  state.stores.forEach(store => {
    const popup = `<div class="map-popup"><span>${escapeHtml(store.city)}</span><strong>${escapeHtml(store.name)}</strong><p>${escapeHtml(address(store))}</p>${store.hours ? `<p class="popup-hours">● ${escapeHtml(store.hours)}</p>` : ''}</div>`;
    const marker = L.marker([store.lat, store.lng], { icon: pinIcon }).bindPopup(popup, { closeButton: true, minWidth: 210 });
    marker.on('click', () => focusStore(store.id));
    state.markers.set(store.id, marker);
  });

  const cities = [...new Set(state.stores.map(store => store.city))].sort((a, b) => a.localeCompare(b, 'de')).slice(0, 6);
  document.getElementById('city-buttons').innerHTML = cities.map(city => `<button class="chip" type="button" data-city="${escapeHtml(city)}">${escapeHtml(city)}</button>`).join('');
  document.querySelectorAll('.chip').forEach(button => button.addEventListener('click', () => {
    state.activeCity = button.dataset.city;
    document.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip === button));
    render();
    const cityStores = state.filtered;
    if (cityStores.length) map.fitBounds(cityStores.map(store => [store.lat, store.lng]), { padding: [50, 50], maxZoom: 13 });
  }));
  render();
  if (state.stores.length) map.fitBounds(state.stores.map(store => [store.lat, store.lng]), { padding: [60, 60], maxZoom: 8 });
}

document.getElementById('city-search').addEventListener('input', event => {
  state.query = event.target.value;
  render();
});
document.getElementById('reset-map').addEventListener('click', () => {
  if (state.filtered.length) map.fitBounds(state.filtered.map(store => [store.lat, store.lng]), { padding: [50, 50], maxZoom: 10 });
});

init().catch(error => {
  document.getElementById('empty-state').textContent = error.message;
  document.getElementById('empty-state').hidden = false;
});
