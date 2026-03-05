// main.js completo — Colombia Coneccion & BigMauro

// Variable global para almacenar la instancia Swiper
let swiperInstance;
const MODAL_TRANSITION_TIME = 400;

// Variable global para controlar el bloqueo de pantalla (Wake Lock)
let wakeLock = null;

// --- FUNCIÓN: cargar contenido del modal desde un slide ---
const loadModalContent = (slideElement) => {
    if (!slideElement) return;

    const modalImage = document.getElementById('modalImage');
    const streamingLinksContainer = document.getElementById('streamingLinks');

    const spotifyLink = slideElement.dataset.spotify;
    const appleLink = slideElement.dataset.apple;
    const youtubeLink = slideElement.dataset.youtube;

    const slideImage = slideElement.querySelector('img');
    if (slideImage) {
        modalImage.src = slideImage.src;
        modalImage.alt = slideImage.alt || '';
    }

    streamingLinksContainer.innerHTML = '';
    const createLink = (href, text, service) => {
        if (!href) return;
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        a.target = '_blank';
        a.dataset.service = service;
        streamingLinksContainer.appendChild(a);
    };

    createLink(spotifyLink, 'Escuchar en Spotify', 'spotify');
    createLink(appleLink, 'Escuchar en Apple Music', 'apple');
    createLink(youtubeLink, 'Ver en YouTube', 'youtube');
};

// --- FUNCIÓN: mover swiper (usada por los botones del modal) ---
window.moveSwiper = (direction) => {
    const modal = document.getElementById('streamingModal');
    if (!swiperInstance) return;
    if (!modal.classList.contains('hidden')) {
        if (direction === 'next') swiperInstance.slideNext();
        if (direction === 'prev') swiperInstance.slidePrev();
    }
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
    const albumSliderEl = document.querySelector('.album-slider');

    // -------------- inicialización Swiper --------------
    if (document.querySelector('.album-slider')) {
        swiperInstance = new Swiper('.album-slider', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            loop: true,
            slidesPerView: 15,
            coverflowEffect: {
                rotate: 10,
                stretch: 0,
                depth: 400,
                modifier: 0,
                slideShadows: false,
            },
            autoplay: {
                delay: 2500,
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

    // Iniciar Reloj y Detección
    initWatch();
    checkWatchDevice();
});

// ====================== MODO RELOJ: WAKE LOCK (MANTENER ENCENDIDO) ======================

// Función que se activa al darle a "LUEGO" en el reloj
async function closeInvite() {
    const overlay = document.getElementById('facerInvite');
    if(overlay) overlay.style.display = 'none';

    // Activar Wake Lock para que no se apague la web en el reloj
    await requestWakeLock();
}

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            
            // Mensaje de confirmación visual en el reloj
            const statusMsg = document.createElement('div');
            statusMsg.innerText = "MODO SIEMPRE ENCENDIDO ACTIVO";
            statusMsg.style = "position:fixed; bottom:20px; font-size:8px; color:#01A8FF; width:100%; text-align:center; z-index:9999; letter-spacing:1px;";
            document.body.appendChild(statusMsg);
            setTimeout(() => statusMsg.remove(), 4000);

            // Reactivar si el usuario minimiza y vuelve
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


// ====================== RELOJ ANALÓGICO Y DIGITAL ======================
function initWatch() {
    const digitalClock = document.getElementById('digitalClock');
    const watchDate = document.getElementById('watchDate');
    const hHand = document.getElementById('hourHand');
    const mHand = document.getElementById('minHand');
    const sHand = document.getElementById('secHand');

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
    const isWatch = ua.includes("watch") || ua.includes("wearos") || ua.includes("samsung") || (window.innerWidth < 320);
    const isMobile = /iphone|ipad|ipod|android/.test(ua);

    if (isWatch || (isMobile && window.innerWidth < 380)) {
        setTimeout(() => {
            const overlay = document.getElementById('facerInvite');
            if (overlay) overlay.style.setProperty('display', 'flex', 'important');
        }, 2500);
    }
}


function laserEffect(card) {
    const laser = document.createElement('div');
    laser.className = 'laser-effect';
    card.appendChild(laser);

    // Lo eliminamos después de la animación
    laser.addEventListener('animationend', () => laser.remove());
}

// Ejemplo: disparar al cambiar minutos
const minTop = document.getElementById('minutesTop');
setInterval(() => {
    // cada cambio de minuto
    laserEffect(minTop.parentElement); // la tarjeta del minuto
}, 60000); // 60000 ms = 1 minuto

/* ===============================================================
   SISTEMA DE DETECCIÓN DE DISPOSITIVOS PARA INSTALACIÓN DE RELOJ
   (Redirección inteligente: Apple Watch vs Wear OS)
   =============================================================== */

function openWatchInvite() {
    // Referencias a los elementos del DOM
    const invite = document.getElementById('facerInvite');
    const link = document.getElementById('installLink');
    const text = document.getElementById('inviteText');
    
    // Identificador del navegador/dispositivo
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // TUS ENLACES OFICIALES
    const linkApple = "https://www.facer.io/watchface/MgxSeGAaKp";
    const linkWearOS = "https://www.facer.io/watchface/CsaOIcSK2T";

    // LÓGICA DE DETECCIÓN
    
    // Caso A: Dispositivos Apple (iPhone detectado)
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        link.href = linkApple;
        link.style.display = "inline-block";
        text.innerText = "Lleva el estilo de BigMauro en tu Apple Watch";
    } 
    
    // Caso B: Dispositivos Android (Samsung, Pixel, Huawei, etc.)
    else if (/android/i.test(userAgent)) {
        link.href = linkWearOS;
        link.style.display = "inline-block";
        text.innerText = "Lleva el estilo de BigMauro en tu Smartwatch Wear OS";
    } 
    
    // Caso C: Otros (PC, Mac, etc.)
    else {
        text.innerText = "Diseños para Smartwatch disponibles próximamente para tu sistema.";
        link.style.display = "none"; // Oculta el botón si no es móvil
    }

    // Muestra el cartel con efecto flex (para que el blur y el centrado funcionen)
    invite.style.display = "flex";
}

/* FUNCIÓN PARA CERRAR EL CARTEL */
function closeInvite() {
    const invite = document.getElementById('facerInvite');
    invite.style.display = "none";
}