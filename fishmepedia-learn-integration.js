/*
 FishMepedia Learn Integration
 1) Adds a "คลังความรู้" button to the main FishMepedia hero.
 2) Supports deep links from learn.html: index.html?entity=PL001
 Designed to sit beside the existing v6 index.html without changing its core logic.
*/
(function () {
  'use strict';

  const LEARN_URL = 'learn.html';
  const ENTITY_PARAM = 'entity';
  const MAX_WAIT_MS = 15000;
  const POLL_MS = 120;

  function addLearnButton() {
    const actions = document.querySelector('.hero-actions');
    if (!actions || document.getElementById('fmLearnButton')) return;

    const link = document.createElement('a');
    link.id = 'fmLearnButton';
    link.href = LEARN_URL;
    link.className = 'social-btn';
    link.innerHTML = '<i class="fa-solid fa-book-open"></i> คลังความรู้';
    link.setAttribute('aria-label', 'เปิดคลังความรู้ FishMepedia');

    // Put Learn before the random buttons so it reads like a main destination.
    actions.insertBefore(link, actions.firstChild);
  }

  function getRequestedEntityId() {
    const params = new URLSearchParams(window.location.search);
    return (params.get(ENTITY_PARAM) || '').trim();
  }

  function findEntity(id) {
    if (typeof allData === 'undefined' || !Array.isArray(allData)) return null;

    const key = String(id).trim().toLowerCase();
    return allData.find(item => {
      const candidates = [
        item && item.ID,
        item && item.NameTH,
        item && item.NameEN,
        item && item.ScientificName
      ].filter(Boolean).map(v => String(v).trim().toLowerCase());

      return candidates.includes(key);
    }) || null;
  }

  function clearEntityParam() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete(ENTITY_PARAM);
      history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash);
    } catch (_) {}
  }

  function revealEntity(item) {
    if (!item || typeof openModal !== 'function') return false;

    openModal(item);
    clearEntityParam();
    return true;
  }

  function waitForEntity(id) {
    if (!id) return;

    const started = Date.now();

    const tryOpen = () => {
      const item = findEntity(id);

      if (item && revealEntity(item)) return;

      if (Date.now() - started < MAX_WAIT_MS) {
        setTimeout(tryOpen, POLL_MS);
        return;
      }

      // Graceful fallback: put the ID into the normal search field if available.
      const search = document.getElementById('searchInput');
      if (search) {
        search.value = id;
        search.dispatchEvent(new Event('input', { bubbles: true }));
        search.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      console.warn('FishMepedia: entity deep link not found:', id);
    };

    tryOpen();
  }

  function initLearnIntegration() {
    addLearnButton();
    waitForEntity(getRequestedEntityId());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLearnIntegration, { once: true });
  } else {
    initLearnIntegration();
  }
})();