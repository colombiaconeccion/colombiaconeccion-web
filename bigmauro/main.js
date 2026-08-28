// main.js completo — Colombia Coneccion & BigMauro

// Variables globales
let swiperInstance;
let wakeLock = null;
let currentSongTitle = '';
let currentSongSlug = '';

const MODAL_TRANSITION_TIME = 400;

// Colores oficiales de cada plataforma
const platformColors = {
    spotify:      '#1DB954',
    apple:        '#fc3c44',
    youtube:      '#FF0000',
    youtubemusic: '#FF0000',
    deezer:       '#A238FF',
    tidal:        '#00FFFF',
    soundcloud:   '#FF5500',
    amazon:       '#00A8E8',
    audiomack:    '#FFA500',
};

// --- FUNCIÓN: cargar contenido del modal desde un slide ---
const loadModalContent = (slideElement) => {
    if (!slideElement) return;

    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const streamingLinksContainer = document.getElementById('streamingLinks');

    const slideImage = slideElement.querySelector('img');
    if (slideImage) {
        modalImage.src = slideImage.src;
        modalImage.alt = slideImage.alt || '';
    }

    // GUARDAR EL TÍTULO Y EL SLUG EN VARIABLES GLOBALES
    currentSongTitle = slideElement.dataset.title || '';
    currentSongSlug = slideElement.dataset.shareSlug || slideElement.dataset.title.toLowerCase().replace(/\s+/g, '-');

    if (modalTitle) modalTitle.innerText = currentSongTitle;

    const platforms = [
        { key: 'spotify',      label: 'Spotify',       logo: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png' },
        { key: 'apple',        label: 'Apple Music',   logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/120px-Apple_Music_icon.svg.png' },
        { key: 'youtube',      label: 'YouTube',       logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/120px-YouTube_full-color_icon_%282017%29.svg.png' },
        { key: 'youtubemusic', label: 'YouTube Music', logo: 'https://music.youtube.com/favicon.ico' },
        { key: 'deezer',       label: 'Deezer',        logo: 'https://www.deezer.com/favicon.ico' },
        { key: 'tidal',        label: 'Tidal',         logo: 'https://tidal.com/favicon.ico' },
        { key: 'soundcloud',   label: 'SoundCloud',    logo: 'https://soundcloud.com/favicon.ico' },
        { key: 'amazon',       label: 'Amazon Music', logo: 'https://www.amazon.com/favicon.ico' },
        { key: 'audiomack',    label: 'Audiomack',     logo: 'https://audiomack.com/favicon.ico' },
    ];

    streamingLinksContainer.innerHTML = '';

    platforms.forEach(({ key, label, logo }) => {
        const href = slideElement.dataset[key];
        if (!href || href.includes('link-')) return;

        const color = platformColors[key] || '#01A8FF';

        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.dataset.service = key;
        a.innerHTML = `
            <img src="${logo}" alt="${label}" class="platform-logo">
            <span>${label}</span>
        `;

        // Glow hover con el color oficial de la plataforma
        a.addEventListener('mouseenter', () => {
            a.style.borderColor = color;
            a.style.boxShadow = `0 0 18px ${color}80`;
            a.style.transform = 'translateY(-3px)';
        });
        a.addEventListener('mouseleave', () => {
            a.style.borderColor = '#01A8FF';
            a.style.boxShadow = '0 0 6px rgba(1, 166, 255, 0.25)';
            a.style.transform = 'translateY(0)';
        });

        streamingLinksContainer.appendChild(a);
    });
};

// --- FUNCIÓN: mover swiper y actualizar modal ---
window.moveSwiper = (direction) => {
    if (!swiperInstance) return;
    const modal = document.getElementById('streamingModal');
    if (modal.classList.contains('hidden')) return;

    if (direction === 'next') swiperInstance.slideNext();
    if (direction === 'prev') swiperInstance.slidePrev();

    // Espera a que Swiper termine la transición y carga el nuevo slide
    setTimeout(() => {
        const activeSlide = document.querySelector('.swiper-slide-active');
        if (activeSlide) loadModalContent(activeSlide);
    }, 300);
};

// --- DOM READY: inicialización y eventos ---
document.addEventListener('DOMContentLoaded', () => {
    // -------------- GIF del logo --------------
    const logo = document.getElementById("logoGif");
    if (logo) {
        const restartGif = () => {
            const srcBase = logo.src.split("?")[0];
            logo.src = `${srcBase}?t=${Date.now()}`;
        };
        logo.addEventListener("mouseenter", restartGif);
    }

    // -------------- elementos del DOM --------------
    const modal = document.getElementById('streamingModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const openModalButtons = document.querySelectorAll('.open-modal-btn');

    // -------------- inicialización Swiper --------------
    if (document.querySelector('.album-slider')) {
        swiperInstance = new Swiper('.album-slider', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 15,
            coverflowEffect: {
                rotate: 10,
                stretch: 0,
                depth: 400,
                modifier: 0,
                slideShadows: false,
            },
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            allowTouchMove: true,
            simulateTouch: true,
            breakpoints: {
                768: {
                    slidesPerView: 10,
                    coverflowEffect: { rotate: 2, stretch: 100, depth: 310, modifier: -1, slideShadows: false }
                }
            }
        });
    }

    // -------------- abrir modal --------------
    const openModal = (e) => {
        const btn = e.currentTarget;
        const clickedSlide = btn.closest('.swiper-slide');
        if (!clickedSlide) return;
        loadModalContent(clickedSlide);
        modal.classList.remove('hidden');
        if (swiperInstance) {
            if (swiperInstance.autoplay) swiperInstance.autoplay.stop();
            swiperInstance.allowTouchMove = false;
        }
    };

    // -------------- cerrar modal --------------
    const closeModal = () => {
        if (!modal) return;
        modal.classList.add('hidden');
        if (swiperInstance) swiperInstance.allowTouchMove = true;
        if (swiperInstance && swiperInstance.autoplay) swiperInstance.autoplay.start();
    };

    openModalButtons.forEach(btn => btn.addEventListener('click', openModal));
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    // -------------- DETECCIÓN DE PARÁMETROS EN URL PARA AUTOPLAY/MODAL --------------
    const params = new URLSearchParams(window.location.search);
    const songParam = params.get('song');

    if (songParam) {
        setTimeout(() => {
            openModalByTitle(songParam);
        }, 600);
    }

    // Iniciar Reloj y Detección
    initWatch();
    checkWatchDevice();
});

// ====================== MODO RELOJ: WAKE LOCK ======================
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');

            const statusMsg = document.createElement('div');
            statusMsg.innerText = "MODO SIEMPRE ENCENDIDO ACTIVO";
            statusMsg.style = "position:fixed; bottom:20px; font-size:8px; color:#01A8FF; width:100%; text-align:center; z-index:9999; letter-spacing:1px;";
            document.body.appendChild(statusMsg);
            setTimeout(() => statusMsg.remove(), 4000);

            document.addEventListener('visibilitychange', async () => {
                if (wakeLock !== null && document.visibilityState === 'visible') {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            });
        }
    } catch (err) {
        console.log("Wake Lock no soportado o denegado.");
    }
}

// ====================== FLIP COUNTDOWN ======================
const launchDate = new Date("2026-05-12T23:59:59").getTime();
const flipElements = {
    days:    { top: document.getElementById("daysTop"),    bottom: document.getElementById("daysBottom") },
    hours:   { top: document.getElementById("hoursTop"),   bottom: document.getElementById("hoursBottom") },
    minutes: { top: document.getElementById("minutesTop"), bottom: document.getElementById("minutesBottom") },
    seconds: { top: document.getElementById("secondsTop"), bottom: document.getElementById("secondsBottom") },
};
let previousTime = {};

function updateFlipCountdown() {
    const now = new Date().getTime();
    const distance = launchDate - now;
    if (distance < 0) {
        const el = document.getElementById("flipCountdown");
        if (el) el.innerHTML = "<span>¡Ya disponible!</span>";
        return;
    }
    const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const currentTime = { days, hours, minutes, seconds };

    Object.keys(flipElements).forEach(unit => {
        if (flipElements[unit].top && previousTime[unit] !== currentTime[unit]) {
            flipElements[unit].top.textContent = currentTime[unit].toString().padStart(2, "0");
            const parent = flipElements[unit].top.parentElement;
            parent.classList.remove("flip-animate");
            void parent.offsetWidth;
            parent.classList.add("flip-animate");
        }
    });
    previousTime = currentTime;
}
setInterval(updateFlipCountdown, 1000);

// ====================== RELOJ ANALÓGICO Y DIGITAL ======================
function initWatch() {
    const digitalClock = document.getElementById('digitalClock');
    const watchDate    = document.getElementById('watchDate');
    const hHand        = document.getElementById('hourHand');
    const mHand        = document.getElementById('minHand');
    const sHand        = document.getElementById('secHand');

    if (!digitalClock) return;

    function updateTime() {
        const now = new Date();
        digitalClock.innerText = now.toLocaleTimeString('es-ES', { hour12: false });

        const dateOptions = { weekday: 'short', day: 'numeric', month: 'short' };
        watchDate.innerText = now.toLocaleDateString('es-ES', dateOptions).replace('.', '').toUpperCase();

        const s = now.getSeconds();
        const m = now.getMinutes();
        const h = now.getHours();

        sHand.style.transform = `translateX(-50%) rotate(${s * 6}deg)`;
        mHand.style.transform = `translateX(-50%) rotate(${(m * 6) + (s * 0.1)}deg)`;
        hHand.style.transform = `translateX(-50%) rotate(${(h * 30) + (m * 0.5)}deg)`;
    }
    setInterval(updateTime, 1000);
    updateTime();
}

// ====================== DETECCIÓN DE SMARTWATCH ======================
function checkWatchDevice() {
    const ua = navigator.userAgent.toLowerCase();
    const isWatch  = ua.includes("watch") || ua.includes("wearos") || ua.includes("samsung") || (window.innerWidth < 320);
    const isMobile = /iphone|ipad|ipod|android/.test(ua);

    if (isWatch || (isMobile && window.innerWidth < 380)) {
        setTimeout(() => {
            const overlay = document.getElementById('facerInvite');
            if (overlay) overlay.style.setProperty('display', 'flex', 'important');
        }, 2500);
    }
}

// ====================== LASER EFFECT ======================
function laserEffect(card) {
    const laser = document.createElement('div');
    laser.className = 'laser-effect';
    card.appendChild(laser);
    laser.addEventListener('animationend', () => laser.remove());
}

const minTop = document.getElementById('minutesTop');
setInterval(() => {
    if (minTop) laserEffect(minTop.parentElement);
}, 60000);

// ====================== ABRIR MODAL POR NOMBRE / SLUG ======================
function openModalByTitle(titleOrSlug) {
    const slides = document.querySelectorAll('.swiper-slide');
    const target = titleOrSlug.toLowerCase().trim();

    for (let slide of slides) {
        const slideTitle = (slide.dataset.title || '').toLowerCase();
        const slideSlug = (slide.dataset.shareSlug || '').toLowerCase();

        if (slideTitle === target || slideSlug === target) {
            loadModalContent(slide);
            document.getElementById('streamingModal').classList.remove('hidden');
            if (swiperInstance) {
                if (swiperInstance.autoplay) swiperInstance.autoplay.stop();
                swiperInstance.allowTouchMove = false;
            }
            break;
        }
    }
}

// ====================== COMPARTIR CANCIÓN (GENERA SUBPÁGINA CON PORTADA PROPIA) ======================
window.shareSong = () => {
    if (!currentSongTitle) {
        alert('No hay canción seleccionada');
        return;
    }

    // Generar la URL hacia la subcarpeta independiente SIN la barra al final /
    const slug = currentSongSlug || currentSongTitle.toLowerCase().replace(/\s+/g, '-');
    const shareUrl = `https://colombiaconeccion.com/bigmauro/sin-límites-2026/${slug}`;

    // Mensaje adaptado para audiencia internacional (ES / EN / DE)
    const shareText = `BigMauro — ${currentSongTitle}\n🇪🇸 Escucha el sencillo | 🇬🇧 Out now! | 🇩🇪 Jetzt streamen!`;

    if (navigator.share) {
        navigator.share({
            title: `BigMauro - ${currentSongTitle}`,
            text: shareText,
            url: shareUrl
        }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`¡Enlace de "${currentSongTitle}" copiado al portapapeles! 🔗`);
        }).catch(() => {
            alert(`URL: ${shareUrl}`);
        });
    }
};
