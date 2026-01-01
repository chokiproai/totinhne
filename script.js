const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const mainContent = document.getElementById('main-content');
const setupModal = document.getElementById('setup-modal');

const loverNameInput = document.getElementById('lover-name');
const createLinkBtn = document.getElementById('create-link-btn');
const resultArea = document.getElementById('result-area');
const generatedLinkInput = document.getElementById('generated-link');
const copyBtn = document.getElementById('copy-btn');
const goToLinkBtn = document.getElementById('go-to-link-btn');

const greeting = document.getElementById('greeting');
const entranceOverlay = document.getElementById('entrance-overlay');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

// Music Logic
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
        musicToggle.textContent = '🎵';
    } else {
        bgMusic.play().then(() => {
            musicToggle.classList.add('playing');
            musicToggle.textContent = '⏸';
        }).catch(err => console.log('Autoplay blocked:', err));
    }
    isPlaying = !isPlaying;
}

musicToggle.addEventListener('click', toggleMusic);

// Cinematic Entrance Logic
// User MUST click to enter, ensuring audio plays
const giftBox = document.querySelector('.gift-box');

// 1. Check URL Parameters
const urlParams = new URLSearchParams(window.location.search);
const toName = urlParams.get('to');

if (toName) {
    // --- RECIPIENT MODE (View) ---
    setupModal.classList.add('hidden');
    mainContent.classList.remove('hidden');
    // Use innerHTML to style the name separately
    greeting.innerHTML = `Gửi <span class="highlight-name">${toName}</span> người thương`;
    document.title = `Gửi ${toName} ❤️`;

    // Only enable Gift Box interaction in Recipient Mode
    if (entranceOverlay) {
        entranceOverlay.addEventListener('click', () => {
            toggleMusic();
            if (giftBox) giftBox.classList.add('open');

            const defaults = { origin: { y: 0.5 }, zIndex: 10000 };
            confetti(Object.assign({}, defaults, { spread: 360, particleCount: 100 }));

            setTimeout(() => {
                entranceOverlay.classList.add('hidden');
                setTimeout(() => {
                    entranceOverlay.style.display = 'none';
                    // START TYPING
                    setTimeout(typeWriter, 500);
                }, 1000);
            }, 800);
        });
    }

    // Typewriter Function
    const questionText = "Tớ đã thích cậu từ lâu lắm rồi. Cậu đồng ý làm người yêu tớ nha?";
    const questionElement = document.getElementById('question-text');
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < questionText.length) {
            questionElement.textContent += questionText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 50);
        } else {
            questionElement.classList.remove('typing-cursor');
        }
    }

} else {
    // --- CREATOR MODE (Setup) ---
    // Hide Gift Box immediately so Creator can see the form
    if (entranceOverlay) {
        entranceOverlay.style.display = 'none';
    }

    setupModal.classList.remove('hidden');
    mainContent.classList.add('hidden');
}

// 2. Creator Mode Logic
createLinkBtn.addEventListener('click', () => {
    const name = loverNameInput.value.trim();
    if (name) {
        const baseUrl = window.location.href.split('?')[0]; // Remove existing params
        const fullUrl = `${baseUrl}?to=${encodeURIComponent(name)}`;

        generatedLinkInput.value = fullUrl;
        resultArea.classList.remove('hidden');
        createLinkBtn.classList.add('hidden');
    } else {
        alert('Vui lòng nhập tên người ấy nha!');
    }
});

copyBtn.addEventListener('click', () => {
    generatedLinkInput.select();
    generatedLinkInput.setSelectionRange(0, 99999); // For mobile
    navigator.clipboard.writeText(generatedLinkInput.value).then(() => {
        copyBtn.textContent = 'Đã copy!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    });
});

goToLinkBtn.addEventListener('click', () => {
    window.location.href = generatedLinkInput.value;
});

// 3. Floating Hearts Logic
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤️'; // Or use SVG/Image

    // Random properties
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's'; // 3-5s
    heart.style.fontSize = Math.random() * 20 + 10 + 'px'; // 10-30px

    document.getElementById('hearts-container').appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 5000); // Clean up after animation
}

// Create hearts periodically
setInterval(createHeart, 300);


// 4. Confession Interaction Logic
const moveBtnNo = () => {
    // FIX: If button is inside the card, move to body to be viewport-relative
    if (btnNo.parentNode !== document.body) {
        document.body.appendChild(btnNo);
    }

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Button size
    const btnRect = btnNo.getBoundingClientRect();
    const btnWidth = btnRect.width;
    const btnHeight = btnRect.height;

    // Safe Areas
    // Avoid header (top 80px) and footer/music-btn (bottom 150px)
    const minTop = 80;
    const maxTop = viewportHeight - btnHeight - 150;
    const minLeft = 20;
    const maxLeft = viewportWidth - btnWidth - 20;

    // Ensures we don't return negative values if screen is super small
    const safeMaxTop = Math.max(minTop, maxTop);
    const safeMaxLeft = Math.max(minLeft, maxLeft);

    // Generate random coordinates within safe area
    const randomX = Math.floor(Math.random() * (safeMaxLeft - minLeft + 1)) + minLeft;
    const randomY = Math.floor(Math.random() * (safeMaxTop - minTop + 1)) + minTop;

    // Apply styles
    btnNo.style.position = 'fixed';
    btnNo.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.zIndex = '1000';

    // Words change logic
    const phrases = ["Không được đâu!", "Sao nỡ từ chối?", "Bấm nút kia đi!", "Đừng mà!", "Suy nghĩ lại điii", "Nút này bị hư dòi", "Chê à?", "Huhu đồng ý đi"];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    btnNo.innerText = randomPhrase;
};

// Event listeners for "No" button
// Desktop
btnNo.addEventListener('mouseover', moveBtnNo);

// Mobile: Use touchstart and prevent default to stop clicking
btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveBtnNo();
});
// Fallback click just in case
btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    moveBtnNo();
});

const askSection = document.getElementById('ask-section');
const successSection = document.getElementById('success-section');

// Event listener for "Yes" button
btnYes.addEventListener('click', () => {
    // 1. Confetti explosion
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    // 2. Switch sections
    // If the "No" button is fixed on body, removing it or strict display none on card might be tricky?
    // The No button is moved out, so hiding 'ask-section' won't hide No button if it's on body.
    // We should explicitly hide No button too.
    btnNo.style.display = 'none';

    askSection.style.display = 'none';
    successSection.style.display = 'block';
});

// --- ULTRA PREMIUM JS EFFECTS ---

// 1. Shooting Stars Logic
function createShootingStar() {
    const star = document.createElement('div');
    star.classList.add('star');

    // Random Styles
    star.style.top = Math.random() * window.innerHeight * 0.5 + 'px'; // Top half
    star.style.left = Math.random() * window.innerWidth + 'px';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';

    document.body.appendChild(star);

    setTimeout(() => star.remove(), 4000);
}
// Create star every 2 seconds
setInterval(createShootingStar, 2000);

// 2. Fairy Dust Cursor Trail
function createParticle(x, y) {
    // Limit creation rate for performance
    if (Math.random() > 0.3) return;

    const particle = document.createElement('div');
    particle.classList.add('cursor-particle');

    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    // Random color variant (Gold/Pink/White)
    const colors = ['#fff', '#ffecb3', '#ff8fa3'];
    particle.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}, transparent)`;

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
}

document.addEventListener('mousemove', (e) => createParticle(e.pageX, e.pageY));
document.addEventListener('touchmove', (e) => {
    // e.preventDefault(); // Don't block scroll completely relative to body? Maybe risky
    const touch = e.touches[0];
    createParticle(touch.pageX, touch.pageY);
}, { passive: true });


// 3. 3D Tilt Effect for Card
const card = document.querySelector('.card');
if (card) {
    // Add glare element
    const glare = document.createElement('div');
    glare.classList.add('card-glare');
    card.appendChild(glare);

    function handleMove(x, y) {
        const rect = card.getBoundingClientRect();

        // Calculate percentages (0 to 1) relative to card
        // Allow tilt even if cursor is outside (clamped) or check bounds? 
        // Better to check relative to center of viewport for smoother feel on mobile?
        // Let's stick to card-relative for now.

        const xPct = (x - rect.left) / rect.width;
        const yPct = (y - rect.top) / rect.height;

        // Convert to rotation degrees (-10 to 10)
        // Clamp values to prevent extreme flipping if touch is far outside
        const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

        const xDeg = (clamp(yPct, 0, 1) - 0.5) * 20;
        const yDeg = (0.5 - clamp(xPct, 0, 1)) * 20;

        card.style.transform = `perspective(1000px) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;

        // Adjust Glare
        glare.style.opacity = 0.5 + (xPct * 0.5);
    }

    document.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY);
    });

    // Touch support for tilt
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    // Reset on mouse leave or touch end
    function resetTilt() {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
        glare.style.opacity = 0;
    }

    document.addEventListener('mouseleave', resetTilt);
    document.addEventListener('touchend', resetTilt);
}

// 4. Dynamic Slideshow
const slideImages = [
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2Q0ZGIzN2E5ZGIzN2E5ZGIzN2E5ZGIzN2E5ZGIzN2E5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1z/cLS1cfxvGOPVpf9g3y/giphy.gif", // Bear Love
    "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif", // Cute Heart
    "https://media.giphy.com/media/l4pTfx2qLszoacZRS/giphy.gif", // Cat Love
    "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif"      // Cat Blink
];
let currentSlide = 0;
const mainImage = document.getElementById('main-image');

if (mainImage) {
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slideImages.length;
        mainImage.style.opacity = 0; // Fade out
        setTimeout(() => {
            mainImage.src = slideImages[currentSlide];
            mainImage.style.opacity = 1; // Fade in
        }, 1000); // Wait for transition
    }, 4000); // Change every 4s
}

// 5. Floating Love Messages
const loveMessages = [
    "Nhớ cậu quá àaa 🥺", "Yêu cậu 3000 ❤️", "Cậu là nhất!",
    "Xinh quá đi 😍", "Bé ngoan của tớ", "Moahzz 😘",
    "Trái tim tớ thuộc về cậu", "Cậu cười xinh lắm á"
];

function createFloatingMessage() {
    const msg = document.createElement('div');
    msg.classList.add('love-bubble');
    msg.innerText = loveMessages[Math.floor(Math.random() * loveMessages.length)];

    // Random position at bottom
    msg.style.left = Math.random() * 80 + 10 + 'vw'; // 10-90vw
    msg.style.animationDuration = Math.random() * 3 + 4 + 's'; // 4-7s float time

    document.body.appendChild(msg);

    setTimeout(() => msg.remove(), 7000);
}

// Start floating messages after gift opens (simple check or delay key)
setInterval(createFloatingMessage, 3500);
