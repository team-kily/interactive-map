const form = document.getElementById('store-form');
const notice = document.getElementById('form-notice');
const setNotice = (message, error = false) => { notice.textContent = message; notice.hidden = false; notice.classList.toggle('error', error); };

async function loadStores() {
  const stores = await fetch('api/stores.php').then(response => response.json());
  document.getElementById('admin-count').textContent = `${stores.length} Einträge`;
  document.getElementById('admin-list').innerHTML = stores.map(store => `<article><div><strong>${escapeHtml(store.name)}</strong><span>${escapeHtml(store.street)}, ${escapeHtml(store.postalCode)} ${escapeHtml(store.city)}</span></div><button class="danger" type="button" data-delete="${escapeHtml(store.id)}">Löschen</button></article>`).join('');
  document.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', async () => {
    if (!confirm('Diesen Markt wirklich löschen?')) return;
    const response = await fetch('api/stores.php', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: button.dataset.delete }) });
    if (response.ok) loadStores(); else setNotice('Der Markt konnte nicht gelöscht werden.', true);
  }));
}
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

document.getElementById('search-address').addEventListener('click', async () => {
  const query = document.getElementById('address-query').value.trim();
  const target = document.getElementById('search-results');
  if (query.length < 4) return;
  target.innerHTML = '<p>Suche …</p>';
  const response = await fetch(`api/geocode.php?q=${encodeURIComponent(query)}`);
  const results = await response.json();
  if (!response.ok) { target.innerHTML = `<p>${escapeHtml(results.error || 'Suche fehlgeschlagen.')}</p>`; return; }
  target.innerHTML = results.length ? results.map((result, index) => `<button type="button" data-result="${index}">${escapeHtml(result.display_name)}</button>`).join('') : '<p>Keine Adresse gefunden.</p>';
  target.querySelectorAll('[data-result]').forEach(button => button.addEventListener('click', () => {
    const result = results[Number(button.dataset.result)];
    const address = result.address || {};
    form.elements.street.value = [address.road || address.pedestrian || '', address.house_number || ''].filter(Boolean).join(' ');
    form.elements.postalCode.value = address.postcode || '';
    form.elements.city.value = address.city || address.town || address.village || address.municipality || '';
    form.elements.lat.value = result.lat;
    form.elements.lng.value = result.lon;
    target.innerHTML = `<p class="selected">Ausgewählt: ${escapeHtml(result.display_name)}</p>`;
    form.elements.name.focus();
  }));
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form));
  const response = await fetch('api/stores.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok) { setNotice(result.error || 'Speichern fehlgeschlagen.', true); return; }
  form.reset(); document.getElementById('search-results').innerHTML = ''; setNotice('Der Markt wurde gespeichert.'); loadStores();
});
loadStores();
