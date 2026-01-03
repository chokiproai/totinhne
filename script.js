/* ========================================
   WEB TỎ TÌNH - JavaScript
   Version 2.1 - Simplified
   ======================================== */

// ========== DOM ELEMENTS ==========
const elements = {
    // Main sections
    loadingScreen: document.getElementById('loading-screen'),
    entranceOverlay: document.getElementById('entrance-overlay'),
    mainContent: document.getElementById('main-content'),
    setupModal: document.getElementById('setup-modal'),
    askSection: document.getElementById('ask-section'),
    successSection: document.getElementById('success-section'),

    // Buttons
    btnYes: document.getElementById('btn-yes'),
    btnNo: document.getElementById('btn-no'),
    createLinkBtn: document.getElementById('create-link-btn'),
    copyBtn: document.getElementById('copy-btn'),
    goToLinkBtn: document.getElementById('go-to-link-btn'),
    musicToggle: document.getElementById('music-toggle'),

    // Form elements
    loverNameInput: document.getElementById('lover-name'),
    customMsgInput: document.getElementById('custom-msg'),
    genderSelect: document.getElementById('gender-select'),
    generatedLinkInput: document.getElementById('generated-link'),
    resultArea: document.getElementById('result-area'),
    qrCodeContainer: document.getElementById('qr-code-container'),
    downloadQrBtn: document.getElementById('download-qr-btn'),

    // Display elements
    greeting: document.getElementById('greeting'),
    questionText: document.getElementById('question-text'),

    // Share buttons
    shareFb: document.getElementById('share-fb'),
    shareZalo: document.getElementById('share-zalo'),
    shareMessenger: document.getElementById('share-messenger'),
    shareNative: document.getElementById('share-native'),
    shareSuccessFb: document.getElementById('share-success-fb'),
    shareSuccessNative: document.getElementById('share-success-native'),

    // Media
    bgMusic: document.getElementById('bg-music'),
    mainImage: document.getElementById('main-image'),
    successImage: document.getElementById('success-image'),

    // Containers
    heartsContainer: document.getElementById('hearts-container'),


    giftBox: document.querySelector('.gift-box')
};

// ========== CONFIGURATION ==========
const CONFIG = {
    heartEmojis: {
        pink: ['❤️', '💖', '🥰', '✨', '💕'],
        blue: ['💙', '🤍', '✨', '🦋', '💎']
    },
    loveMessages: {
        female: [
            "Nhớ cậu quá àaa 🥺", "Yêu cậu 3000 ❤️", "Hong bé ơi!",
            "Xinh quá đi 😍", "Bé ngoan của tớ", "Moahzz 😘",
            "Trái tim tớ thuộc về cậu", "Cậu cười xinh lắm á", "Mãi yêu cậu 💕",
            "Công chúa của tớ 👑", "Bé iu ơi 🌻", "Cậu là tất cả của tớ",
            "Yêu bé nhiều lắm", "Cậu cute xỉu 😝", "Nụ cười tỏa nắng ☀️",
            "Nhớ bé nhiều", "Bé ăn cơm chưa?", "Đừng thức khuya nha 🌙",
            "Yêu mình cậu thôi", "Cậu là điều tuyệt vời nhất", "Hạnh phúc khi có cậu",
            "Bên cậu bình yên lắm", "Thương cậu nhất trần đời", "Love you forever ❤️",
            "Cậu là ánh sáng của tớ ✨", "Yêu cậu không lối thoát", "Cậu là cả thế giới 🌍",
            "Bé ngoan ăn nhiều vào nha", "Thương thương ❤️", "Cục nợ đáng yêu",
            "Yêu cậu nhất hệ mặt trời ☀️"
        ],
        male: [
            "Nhớ cậu quá àaa 🥺", "Yêu cậu 3000 ❤️", "Đẹp trai quá nhe 😎",
            "Ngầu quá đi!", "Chàng trai của tớ", "Moahzz 😘",
            "Cậu là tuyệt nhất", "Cười cái coi nào 😁", "Yêu cậu mất rồi 💙",
            "Anh người yêu xịn xò", "Hoàng tử của tớ 👑", "Nhớ anh nhiều",
            "Cậu là superman 💪", "Thương cậu lắm á", "Đồ đáng yêu 🥰",
            "Mê cậu quá đi", "Chồng iu của tớ", "Cậu là số 1 🥇",
            "Yêu anh nhất", "Cậu ấm áp lắm", "Bên cậu tớ thấy an toàn",
            "Người hùng của tớ 🦸‍♂️", "Soái ca trong lòng tớ", "Love you to the moon 🌙",
            "Cậu là định mệnh của tớ", "Yêu anh không hối tiếc", "Cậu giỏi lắm 👍",
            "Tự hào về cậu", "Chàng trai năm 17 tuổi", "Yêu cậu nhất trần đời",
            "Cậu là tất cả 💙"
        ]
    },
    slideImages: [
        "img/bear_hug.gif",
        "img/cat_love.gif",
        "img/heart.gif"
    ],
    successImages: [
        "img/dance.gif",
        "img/kiss.gif",
        "img/bear_hug.gif",
        "img/heart.gif"
    ],
    base64Fallback: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmNGQ2ZCI+PHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjUgMiA1LjQyIDQuNDIgMyA3LjUgM2MxLjc0IDAgMy40MS44MSA0LjUgMi4wOUMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzIDE5LjU4IDMgMjIgNS40MiAyMiA4LjVjMCAzLjc4LTMuNCA2Ljg2LTguNTUgMTEuNTRMMTIgMjEuMzV6Ii8+PC9zdmc+",
    wishes: [
        { icon: "❤️", text: "Cảm ơn cậu vì đã đồng ý bên tớ" },
        { icon: "👵👴", text: "Cùng nhau già đi cậu nhé?" },
        { icon: "🏠", text: "Mọi bão giông bên ngoài cứ để tớ lo" },
        { icon: "✨", text: "Tớ hứa sẽ trân trọng cậu mỗi ngày" },
        { icon: "🧸", text: "Bờ vai này luôn dành cho cậu tựa vào" },
        { icon: "🌍", text: "Với tớ, cậu quan trọng hơn cả thế giới" },
        { icon: "🥰", text: "Chỉ cần thấy cậu cười là tớ vui rồi" },
        { icon: "🤝", text: "Nắm tay tớ đi hết đoạn đường đời nhé" },
        { icon: "💌", text: "Yêu cậu hôm nay, ngày mai và mãi mãi" }
    ]
};

// ========== STATE ==========
let state = {
    isPlaying: false,
    currentTheme: 'pink',
    currentSlide: 0,
    successSlide: 0,
    slideshowInterval: null,
    genderParam: null,
    toName: null,
    questionText: ''
};

// ========== INITIALIZATION ==========
function init() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    state.toName = urlParams.get('to');
    state.genderParam = urlParams.get('g');

    // Apply theme based on gender
    if (state.genderParam === 'm') {
        document.body.classList.add('theme-blue');
        state.currentTheme = 'blue';
    }

    // Setup mode based on URL
    if (state.toName) {
        setupRecipientMode(urlParams);
    } else {
        setupCreatorMode();
    }

    // Initialize features
    initMusic();
    initEffects();
    initShareButtons();

    // Hide loading screen
    setTimeout(() => {
        elements.loadingScreen?.classList.add('hidden');
    }, 600);
}

// ========== MODE SETUP ==========
function setupRecipientMode(urlParams) {
    elements.setupModal?.classList.add('hidden');
    elements.mainContent?.classList.remove('hidden');

    // Set greeting
    if (elements.greeting) {
        elements.greeting.innerHTML = `Gửi <span class="highlight-name">${state.toName}</span> người thương,`;
    }
    document.title = `Gửi ${state.toName} ❤️`;

    // Setup entrance overlay
    if (elements.entranceOverlay) {
        elements.entranceOverlay.addEventListener('click', handleEntranceClick);
    }

    // Get custom message
    const urlMsg = urlParams.get('msg');
    let defaultMsg = state.genderParam === 'm'
        ? "Tớ đã thích cậu từ lâu lắm rồi. Cậu đồng ý làm 'gà bông' của tớ nha?"
        : "Tớ đã thích cậu từ lâu lắm rồi. Cậu đồng ý làm người yêu tớ nha?";

    state.questionText = urlMsg || defaultMsg;

    // Setup confession buttons
    initConfessionButtons();

    // Start slideshow
    startMainSlideshow();


}

function setupCreatorMode() {
    // Hide entrance overlay
    if (elements.entranceOverlay) {
        elements.entranceOverlay.style.display = 'none';
    }

    elements.setupModal?.classList.remove('hidden');
    elements.mainContent?.classList.add('hidden');

    // Dynamic theme preview based on gender
    if (elements.genderSelect) {
        // Sync initial state (handle browser autofill)
        state.genderParam = elements.genderSelect.value;
        if (state.genderParam === 'm') {
            document.body.classList.add('theme-blue');
            state.currentTheme = 'blue';
        }
    }

    elements.genderSelect?.addEventListener('change', (e) => {
        state.genderParam = e.target.value;

        // Clear existing bubbles immediately so new ones appear
        document.querySelectorAll('.love-bubble').forEach(el => el.remove());
        createFloatingMessage(); // Spawn one immediately

        if (e.target.value === 'm') {
            document.body.classList.add('theme-blue');
            state.currentTheme = 'blue';
        } else {
            document.body.classList.remove('theme-blue');
            state.currentTheme = 'pink';
        }
    });

    // Create link button
    elements.createLinkBtn?.addEventListener('click', createLink);

    // Copy button
    elements.copyBtn?.addEventListener('click', copyLink);

    // Download QR button
    elements.downloadQrBtn?.addEventListener('click', downloadQRCode);

    // Go to link button
    elements.goToLinkBtn?.addEventListener('click', () => {
        window.location.href = elements.generatedLinkInput.value;
    });
}

// ========== ENTRANCE HANDLING ==========
function handleEntranceClick() {
    // Play music
    toggleMusic();

    // Open gift box
    elements.giftBox?.classList.add('open');

    // Confetti explosion
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 150,
            spread: 360,
            origin: { y: 0.5 },
            zIndex: 10000,
            colors: getThemeColors()
        });
    }

    // Hide overlay after animation
    setTimeout(() => {
        elements.entranceOverlay?.classList.add('hidden');
        setTimeout(() => {
            if (elements.entranceOverlay) {
                elements.entranceOverlay.style.display = 'none';
            }
            // Start typewriter
            setTimeout(typeWriter, 500);
        }, 1000);
    }, 800);
}

// ========== TYPEWRITER EFFECT ==========
let charIndex = 0;

function typeWriter() {
    if (!elements.questionText || !state.questionText) return;

    if (charIndex < state.questionText.length) {
        elements.questionText.textContent += state.questionText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 40);
    } else {
        elements.questionText.classList.remove('typing-cursor');
    }
}

// ========== THEME COLORS ==========
function getThemeColors() {
    return state.currentTheme === 'blue'
        ? ['#00a8ff', '#74b9ff', '#dfe6e9']
        : ['#ff4d6d', '#ff758f', '#ffe5ec'];
}

// ========== MUSIC ==========
function initMusic() {
    elements.musicToggle?.addEventListener('click', toggleMusic);
}

function toggleMusic() {
    if (state.isPlaying) {
        elements.bgMusic?.pause();
        elements.musicToggle?.classList.remove('playing');
        const icon = elements.musicToggle?.querySelector('i');
        if (icon) icon.className = 'fas fa-music';
    } else {
        elements.bgMusic?.play().then(() => {
            elements.musicToggle?.classList.add('playing');
            const icon = elements.musicToggle?.querySelector('i');
            if (icon) icon.className = 'fas fa-pause';
        }).catch(err => console.log('Autoplay blocked:', err));
    }
    state.isPlaying = !state.isPlaying;
}

// ========== CONFESSION BUTTONS ==========
function initConfessionButtons() {
    elements.btnYes?.addEventListener('click', handleYesClick);

    elements.btnNo?.addEventListener('mouseover', moveBtnNo);
    elements.btnNo?.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveBtnNo();
    });
    elements.btnNo?.addEventListener('click', (e) => {
        e.preventDefault();
        moveBtnNo();
    });
}

function handleYesClick() {
    // Epic confetti
    if (typeof confetti !== 'undefined') {
        const duration = 4000;
        const animationEnd = Date.now() + duration;
        const colors = getThemeColors();

        const frame = () => {
            if (Date.now() > animationEnd) return;

            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            requestAnimationFrame(frame);
        };
        frame();
    }

    // Hide No button
    if (elements.btnNo) {
        elements.btnNo.style.display = 'none';
    }

    // Switch sections
    if (elements.askSection) elements.askSection.style.display = 'none';
    if (elements.successSection) elements.successSection.style.display = 'block';

    // Start success slideshow
    startSuccessSlideshow();

    // Init wishes
    initWishes();


}

function moveBtnNo() {
    const btn = elements.btnNo;
    if (!btn) return;

    if (btn.parentNode !== document.body) {
        document.body.appendChild(btn);
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const btnRect = btn.getBoundingClientRect();

    const minTop = 100;
    const maxTop = Math.max(minTop, viewportHeight - btnRect.height - 150);
    const minLeft = 20;
    const maxLeft = Math.max(minLeft, viewportWidth - btnRect.width - 20);

    const randomX = Math.floor(Math.random() * (maxLeft - minLeft + 1)) + minLeft;
    const randomY = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;

    btn.style.position = 'fixed';
    btn.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    btn.style.left = `${randomX}px`;
    btn.style.top = `${randomY}px`;
    btn.style.zIndex = '1000';

    const phrases = [
        "Không được đâu!", "Sao nỡ từ chối?", "Bấm nút kia đi!",
        "Đừng mà!", "Suy nghĩ lại điii", "Nút này bị hư r",
        "Chê à? 😢", "Huhu đồng ý đi", "Tớ buồn lắm 🥺"
    ];
    btn.innerHTML = `<i class="fas fa-times"></i> ${phrases[Math.floor(Math.random() * phrases.length)]}`;
}

// ========== SWIPEABLE WISHES ==========
function initWishes() {
    const stack = document.getElementById('card-stack');
    if (!stack) return;

    // Clear existing
    stack.innerHTML = '';

    // Reverse to stack correctly (last in DOM is top)
    const cards = [...CONFIG.wishes].reverse();

    cards.forEach(wish => {
        const card = document.createElement('div');
        card.className = 'wish-card';
        card.innerHTML = `
            <div class="wish-icon">${wish.icon}</div>
            <div class="wish-content">${wish.text}</div>
        `;
        stack.appendChild(card);

        // Add events
        addSwipeEvents(card);
    });
}

function addSwipeEvents(card) {
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    const handleStart = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        card.classList.add('moving');
    };

    const handleMove = (e) => {
        if (!isDragging) return;

        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        currentX = x - startX;

        // Rotate and move
        const rotate = currentX * 0.05;
        card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

        // Fade opacity slightly if moving far
        const opacity = 1 - Math.abs(currentX) / 500;
        card.style.opacity = opacity;
    };

    const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove('moving');

        const threshold = 100; // px to dismiss

        if (Math.abs(currentX) > threshold) {
            // Swipe away
            const direction = currentX > 0 ? 1 : -1;
            const endX = window.innerWidth * direction;

            card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            card.style.transform = `translateX(${endX}px) rotate(${direction * 30}deg)`;
            card.style.opacity = '0';

            setTimeout(() => {
                card.remove();
                // Check if empty, maybe reload stack or show special message?
                // For now just loop reuse if needed, or leave empty
                if (document.querySelectorAll('.wish-card').length === 0) {
                    // Reload stack for endless fun
                    setTimeout(initWishes, 500);
                }
            }, 500);
        } else {
            // Reset
            card.style.transform = '';
            card.style.opacity = '';
        }

        currentX = 0;
    };

    // Touch events
    card.addEventListener('touchstart', handleStart, { passive: true });
    card.addEventListener('touchmove', handleMove, { passive: true });
    card.addEventListener('touchend', handleEnd);

    // Mouse events
    card.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
}



// ========== LINK CREATION ==========
function createLink() {
    const name = elements.loverNameInput?.value.trim();
    const customMsg = elements.customMsgInput?.value.trim();
    const gender = elements.genderSelect?.value;

    if (!name) {
        showToast('Vui lòng nhập tên người ấy nha! 💕');
        elements.loverNameInput?.focus();
        return;
    }

    const baseUrl = window.location.href.split('?')[0];
    let fullUrl = `${baseUrl}?to=${encodeURIComponent(name)}`;

    if (gender) {
        fullUrl += `&g=${gender}`;
    }

    if (customMsg) {
        fullUrl += `&msg=${encodeURIComponent(customMsg)}`;
    }

    if (elements.generatedLinkInput) {
        elements.generatedLinkInput.value = fullUrl;
    }

    generateQRCode(fullUrl);
    elements.resultArea?.classList.remove('hidden');
    elements.createLinkBtn?.classList.add('hidden');

    // Mini confetti
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
        });
    }
}

function copyLink() {
    const link = elements.generatedLinkInput?.value;
    if (!link) return;

    navigator.clipboard.writeText(link).then(() => {
        showToast('Đã copy link! 📋');
        if (elements.copyBtn) {
            const icon = elements.copyBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-check';
                setTimeout(() => icon.className = 'fas fa-copy', 2000);
            }
        }
    }).catch(() => {
        elements.generatedLinkInput?.select();
        document.execCommand('copy');
        showToast('Đã copy link! 📋');
    });
}

// ========== SHARE BUTTONS ==========
function initShareButtons() {
    const shareUrl = () => elements.generatedLinkInput?.value || window.location.href;
    const shareTitle = 'Gửi cậu người thương ❤️';
    const shareText = 'Ai đó muốn gửi lời yêu thương đến bạn...';

    // Facebook
    elements.shareFb?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`, '_blank', 'width=600,height=400');
    });

    elements.shareSuccessFb?.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
    });

    // Zalo
    elements.shareZalo?.addEventListener('click', () => {
        window.open(`https://zalo.me/share?url=${encodeURIComponent(shareUrl())}`, '_blank');
    });

    // Messenger
    elements.shareMessenger?.addEventListener('click', () => {
        window.open(`fb-messenger://share?link=${encodeURIComponent(shareUrl())}`, '_blank');
    });

    // Native share
    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: shareUrl()
            }).catch(() => { });
        } else {
            copyLink();
        }
    };

    elements.shareNative?.addEventListener('click', handleNativeShare);
    elements.shareSuccessNative?.addEventListener('click', handleNativeShare);
}

// ========== EFFECTS ==========
function initEffects() {
    setInterval(createHeart, 400);
    setInterval(createShootingStar, 2500);

    document.addEventListener('mousemove', (e) => createParticle(e.pageX, e.pageY));
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        createParticle(touch.pageX, touch.pageY);
    }, { passive: true });

    document.addEventListener('click', (e) => {
        for (let i = 0; i < 8; i++) {
            createClickHeart(e.clientX, e.clientY);
        }
    });

    setInterval(createFloatingMessage, 4000);
    initCardTilt();
}

function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');

    const emojis = CONFIG.heartEmojis[state.currentTheme] || CONFIG.heartEmojis.pink;
    heart.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];

    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    heart.style.fontSize = (Math.random() * 15 + 15) + 'px';

    elements.heartsContainer?.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
}

function createShootingStar() {
    const star = document.createElement('div');
    star.classList.add('star');

    star.style.top = Math.random() * 50 + '%';
    star.style.left = Math.random() * 100 + '%';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';

    document.body.appendChild(star);
    setTimeout(() => star.remove(), 4000);
}

function createParticle(x, y) {
    if (Math.random() > 0.25) return;

    const particle = document.createElement('div');
    particle.classList.add('cursor-particle');
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    const colors = getThemeColors();
    particle.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}, transparent)`;

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function createClickHeart(x, y) {
    const heart = document.createElement('div');
    heart.classList.add('click-heart');
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';

    const tx = (Math.random() - 0.5) * 120 + 'px';
    const ty = (Math.random() - 0.5) * 120 + 'px';
    const rot = (Math.random() - 0.5) * 360 + 'deg';

    heart.style.setProperty('--x', tx);
    heart.style.setProperty('--y', ty);
    heart.style.setProperty('--r', rot);

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
}

function createFloatingMessage() {
    const msg = document.createElement('div');
    msg.classList.add('love-bubble');

    const messages = state.genderParam === 'm'
        ? CONFIG.loveMessages.male
        : CONFIG.loveMessages.female;

    msg.innerText = messages[Math.floor(Math.random() * messages.length)];
    msg.style.left = (Math.random() * 80 + 10) + 'vw';
    msg.style.animationDuration = (Math.random() * 3 + 5) + 's';

    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 8000);
}

function initCardTilt() {
    const card = document.querySelector('.card');
    if (!card) return;

    const glare = document.createElement('div');
    glare.classList.add('card-glare');
    card.appendChild(glare);

    const handleMove = (x, y) => {
        const rect = card.getBoundingClientRect();
        const xPct = (x - rect.left) / rect.width;
        const yPct = (y - rect.top) / rect.height;

        const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
        const xDeg = (clamp(yPct, 0, 1) - 0.5) * 15;
        const yDeg = (0.5 - clamp(xPct, 0, 1)) * 15;

        card.style.transform = `perspective(1000px) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
        glare.style.opacity = 0.3 + (xPct * 0.3);
    };

    const resetTilt = () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        glare.style.opacity = 0;
    };

    document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('mouseleave', resetTilt);
    document.addEventListener('touchend', resetTilt);
}

// ========== SLIDESHOW ==========
function startMainSlideshow() {
    if (!elements.mainImage) return;

    elements.mainImage.onerror = () => {
        elements.mainImage.src = CONFIG.base64Fallback;
    };

    state.slideshowInterval = setInterval(() => {
        state.currentSlide = (state.currentSlide + 1) % CONFIG.slideImages.length;
        elements.mainImage.style.opacity = 0;

        setTimeout(() => {
            elements.mainImage.src = CONFIG.slideImages[state.currentSlide];
            elements.mainImage.style.opacity = 1;
        }, 500);
    }, 4000);
}

function startSuccessSlideshow() {
    clearInterval(state.slideshowInterval);

    if (!elements.successImage) return;

    elements.successImage.onerror = () => {
        elements.successImage.src = CONFIG.base64Fallback;
    };

    setInterval(() => {
        state.successSlide = (state.successSlide + 1) % CONFIG.successImages.length;
        elements.successImage.style.opacity = 0;

        setTimeout(() => {
            elements.successImage.src = CONFIG.successImages[state.successSlide];
            elements.successImage.style.opacity = 1;
        }, 500);
    }, 3000);
}

// ========== UTILITIES ==========
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 0.95rem;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
        font-family: 'Outfit', sans-serif;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== QR CODE ==========
function generateQRCode(url) {
    const qrContainer = document.getElementById('qr-code');
    if (!qrContainer) return;

    qrContainer.innerHTML = ''; // Clear existing

    // Show container
    if (elements.qrCodeContainer) {
        elements.qrCodeContainer.classList.remove('hidden');
    }

    // Generate QR
    new QRCode(qrContainer, {
        text: url,
        width: 180,
        height: 180,
        colorDark: "#590d22",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function downloadQRCode() {
    const qrContainer = document.getElementById('qr-code');
    const img = qrContainer?.querySelector('img');

    if (img && img.src) {
        const link = document.createElement('a');
        link.download = 'loi-to-tinh-qr.png';
        link.href = img.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Đã tải mã QR! 📸');
    } else {
        showToast('Đang tạo mã QR, đợi xíu nha...');
        // Fallback for canvas if img not ready (qrcodejs uses canvas first then img)
        const canvas = qrContainer?.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'loi-to-tinh-qr.png';
            link.href = canvas.toDataURL();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Đã tải mã QR! 📸');
        }
    }
}

// ========== START APP ==========
document.addEventListener('DOMContentLoaded', init);
