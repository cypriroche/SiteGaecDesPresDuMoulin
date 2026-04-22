'use strict';

// ─── BURGER MENU ─────────────────────────────────────────────
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus();
    }
  });
}

// ─── NAV SCROLL ──────────────────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  if (document.body.dataset.page === 'inner') {
    nav.classList.add('scrolled');
  } else {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }
}


// ─── HERO VIDEO MUTE TOGGLE ───────────────────────────────────
const heroVideo   = document.querySelector('.hero-video');
const heroMuteBtn = document.getElementById('hero-mute-btn');
let userUnmuted = false;
let audioFade   = null;

function fadeVolume(video, targetVol, onDone) {
  clearInterval(audioFade);
  const step = targetVol > video.volume ? 0.04 : -0.04;
  audioFade = setInterval(() => {
    const next = video.volume + step;
    if ((step > 0 && next >= targetVol) || (step < 0 && next <= targetVol)) {
      video.volume = targetVol;
      clearInterval(audioFade);
      if (onDone) onDone();
    } else {
      video.volume = Math.max(0, Math.min(1, next));
    }
  }, 40); // ~1 s pour atteindre le volume cible
}

if (heroVideo && heroMuteBtn) {
  heroMuteBtn.addEventListener('click', () => {
    userUnmuted = !userUnmuted;
    heroMuteBtn.classList.toggle('active', userUnmuted);
    heroMuteBtn.setAttribute('aria-label', userUnmuted ? 'Couper le son' : 'Activer le son');
    heroMuteBtn.setAttribute('aria-pressed', String(userUnmuted));

    if (userUnmuted) {
      heroVideo.muted = false;
      heroVideo.volume = 0;
      fadeVolume(heroVideo, 1);
    } else {
      fadeVolume(heroVideo, 0, () => { heroVideo.muted = true; });
    }
  });

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    new IntersectionObserver((entries) => {
      if (!userUnmuted) return;
      if (entries[0].isIntersecting) {
        heroVideo.muted = false;
        fadeVolume(heroVideo, 1);
      } else {
        fadeVolume(heroVideo, 0, () => { heroVideo.muted = true; });
      }
    }, { threshold: 0.1 }).observe(heroSection);
  }
}

// ─── PARALLAX HERO ───────────────────────────────────────────
const heroBg = document.getElementById('hero-bg');
if (heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `translateY(${y * 0.28}px) scale(1.1)`;
    }
  }, { passive: true });
}

// ─── REVEAL ON SCROLL ─────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ─── LEAFLET MAP ──────────────────────────────────────────────
if (typeof L !== 'undefined' && document.getElementById('map-pv')) {
const POINTS = [
  { nom: "La Ferme des Prés du Moulin", adresse: "Les Chièzes, 07570 Désaignes", note: "Samedi 8h30–12h · Espèces uniquement", lat: 44.9853, lng: 4.5741, type: "ferme" },
  { nom: "Intermarché Lamastre", adresse: "Route de Désaignes, 07270 Lamastre", lat: 45.0996, lng: 4.5774, type: "store" },
  { nom: "Super U Tournon-sur-Rhône", adresse: "Av. du Président Wilson, 07300 Tournon", lat: 45.0672, lng: 4.8320, type: "store" },
  { nom: "Intermarché Saint-Agrève", adresse: "Route du Puy, 07320 Saint-Agrève", lat: 45.0113, lng: 4.3933, type: "store" },
  { nom: "Carrefour Market Privas", adresse: "Av. de la Résistance, 07000 Privas", lat: 44.7350, lng: 4.5993, type: "store" },
  { nom: "Super U Le Cheylard", adresse: "Route de Vernoux, 07160 Le Cheylard", lat: 44.9061, lng: 4.4228, type: "store" },
  { nom: "Intermarché Annonay", adresse: "Rue Pierre Brossolette, 07100 Annonay", lat: 45.2393, lng: 4.6696, type: "store" },
  { nom: "Bio c' Bon Valence", adresse: "12 Rue Bouffier, 26000 Valence", lat: 44.9334, lng: 4.8924, type: "store" },
  { nom: "Épicerie du Terroir — Vernoux", adresse: "Place de la Mairie, 07240 Vernoux-en-Vivarais", lat: 44.8964, lng: 4.6522, type: "store" },
  { nom: "Marché de Lamastre", adresse: "Place Rampon, 07270 Lamastre · Mercredi matin", lat: 45.1010, lng: 4.5800, type: "store" }
];

const map = L.map('map-pv', { scrollWheelZoom: true, zoomControl: true })
  .setView([45.03, 4.62], 10);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

const markers = POINTS.map(p => {
  const color = p.type === 'ferme' ? '#C4622D' : '#7A8C6A';
  const size = p.type === 'ferme' ? 18 : 14;
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25)" role="img" aria-label="${p.nom}"></div>`,
    iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -14]
  });
  const note = p.note ? `<br><em style="color:#888;font-size:12px">${p.note}</em>` : '';
  return L.marker([p.lat, p.lng], { icon })
    .addTo(map)
    .bindPopup(
      `<strong style="color:#2A3820">${p.nom}</strong><br><span style="font-size:13px;color:#666">${p.adresse}</span>${note}`,
      { autoPan: false }
    );
});

document.querySelectorAll('.pvente-item').forEach((card, i) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.pvente-item').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    map.setView([POINTS[i].lat, POINTS[i].lng], 13, { animate: true });
    markers[i].openPopup();
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Voir ${POINTS[i].nom} sur la carte`);
});

// ─── RECHERCHE MAGASIN MOBILE ─────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function findNearestStore() {
  const input = document.getElementById('pvente-search-input');
  const result = document.getElementById('pvente-search-result');
  const query = input?.value.trim();
  if (!query) return;

  result.innerHTML = '<p class="pvente-search-msg">Recherche en cours…</p>';

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=fr`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data = await res.json();

    if (!data.length) {
      result.innerHTML = '<p class="pvente-search-msg">Ville ou code postal introuvable. Essayez une autre saisie.</p>';
      return;
    }

    const userLat = parseFloat(data[0].lat);
    const userLng = parseFloat(data[0].lon);

    let minDist = Infinity, nearest = null, nearestIdx = 0;
    POINTS.forEach((p, i) => {
      const d = haversine(userLat, userLng, p.lat, p.lng);
      if (d < minDist) { minDist = d; nearest = p; nearestIdx = i; }
    });

    const distText = minDist < 1 ? "moins d'1 km" : `${Math.round(minDist)} km`;
    const noteHtml = nearest.note ? `<span>${nearest.note}</span>` : '';

    result.innerHTML = `
      <div class="pvente-search-card">
        <strong>${nearest.nom}</strong>
        <span>${nearest.adresse}</span>
        ${noteHtml}
        <p class="pvente-search-dist">À environ ${distText} de votre localisation</p>
      </div>`;

    map.setView([nearest.lat, nearest.lng], 13, { animate: true });
    markers[nearestIdx].openPopup();

    document.querySelectorAll('.pvente-item').forEach(c => c.classList.remove('active'));
    document.querySelector(`.pvente-item[data-index="${nearestIdx}"]`)?.classList.add('active');

  } catch {
    result.innerHTML = '<p class="pvente-search-msg">Erreur de connexion. Vérifiez votre accès internet.</p>';
  }
}

const searchBtn   = document.getElementById('pvente-search-btn');
const searchInput = document.getElementById('pvente-search-input');

searchBtn?.addEventListener('click', findNearestStore);

// ─── AUTOCOMPLETE VILLE ────────────────────────────────────────
const pvSearch  = document.getElementById('pvente-search');
const searchWrap = pvSearch?.querySelector('.pvente-search-wrap');

// Crée un pivot position:relative autour du champ pour que la liste
// soit positionnée par rapport au champ uniquement (pas à pvente-search entier)
const acAnchor = document.createElement('div');
acAnchor.className = 'pvente-search-anchor';
if (pvSearch && searchWrap) {
  pvSearch.insertBefore(acAnchor, searchWrap);
  acAnchor.appendChild(searchWrap);
}

const acList = document.createElement('ul');
acList.id = 'pvente-autocomplete';
acList.className = 'pvente-autocomplete';
acList.setAttribute('role', 'listbox');
acList.setAttribute('aria-label', 'Suggestions de villes');
acAnchor.appendChild(acList);

let acTimer   = null;
let acFocused = -1;
let acItems   = [];

function closeAC() {
  acList.innerHTML = '';
  acList.classList.remove('open');
  acFocused = -1;
  acItems   = [];
}

function buildLabel(s) {
  const parts = s.display_name.split(', ');
  return parts.slice(0, Math.min(3, parts.length)).join(', ');
}

function renderAC(data) {
  acList.innerHTML = '';
  acFocused = -1;
  if (!data.length) { acList.classList.remove('open'); return; }
  data.forEach(s => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    li.textContent = buildLabel(s);
    li.addEventListener('mousedown', e => {
      e.preventDefault();
      searchInput.value = buildLabel(s);
      closeAC();
      findNearestStore();
    });
    acList.appendChild(li);
  });
  acItems = [...acList.querySelectorAll('li')];
  acList.classList.add('open');
}

searchInput?.addEventListener('input', () => {
  clearTimeout(acTimer);
  const q = searchInput.value.trim();
  if (q.length < 2) { closeAC(); return; }
  acTimer = setTimeout(async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=fr`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      renderAC(await res.json());
    } catch { closeAC(); }
  }, 350);
});

searchInput?.addEventListener('keydown', e => {
  const listOpen = acList.classList.contains('open');
  if (listOpen) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      acFocused = Math.min(acFocused + 1, acItems.length - 1);
      acItems.forEach((li, i) => li.classList.toggle('focused', i === acFocused));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      acFocused = Math.max(acFocused - 1, 0);
      acItems.forEach((li, i) => li.classList.toggle('focused', i === acFocused));
      return;
    }
    if (e.key === 'Enter' && acFocused >= 0) {
      e.preventDefault();
      acItems[acFocused].dispatchEvent(new MouseEvent('mousedown'));
      return;
    }
    if (e.key === 'Escape') { closeAC(); return; }
  }
  if (e.key === 'Enter') findNearestStore();
});

searchInput?.addEventListener('blur', () => setTimeout(closeAC, 200));
document.addEventListener('click', e => {
  if (!pvSearch?.contains(e.target)) closeAC();
});

} // end Leaflet guard
