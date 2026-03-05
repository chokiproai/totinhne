/* =========================================
   LOVE HUB — PREMIUM LOGIC
   ========================================= */

const LH = {
  KEYS: { quests: 'lh_quests_v2', miles: 'lh_milestones_v2', game: 'lh_game_v2', streak: 'lh_streak' },

  // ──────── QUEST DATABASE ────────
  WEEKLY_QUESTS: [
    { id: 'w1', text: 'Đi ăn cùng nhau 1 lần', emoji: '🍜', reward: '+15 💖' },
    { id: 'w2', text: 'Đi dạo 20 phút cùng nhau', emoji: '🌄', reward: '+10 💖' },
    { id: 'w3', text: 'Xem phim cùng', emoji: '🎬', reward: '+15 💖' },
    { id: 'w4', text: 'Nấu ăn cùng nhau', emoji: '🍳', reward: '+20 💖' },
    { id: 'w5', text: 'Viết 1 lời nhắn cho đối phương', emoji: '💌', reward: '+25 💖' },
    { id: 'w6', text: 'Gọi video call ít nhất 15 phút', emoji: '📱', reward: '+10 💖' },
    { id: 'w7', text: 'Chụp 1 tấm selfie cùng nhau', emoji: '📸', reward: '+10 💖' },
    { id: 'w8', text: 'Chia sẻ 1 bài hát yêu thích', emoji: '🎵', reward: '+5 💖' },
  ],
  MONTHLY_QUESTS: [
    { id: 'm1', text: 'Đi du lịch mini (1 ngày)', emoji: '✈️', reward: '+50 💖' },
    { id: 'm2', text: 'Chụp bộ ảnh mới cùng nhau', emoji: '📷', reward: '+40 💖' },
    { id: 'm3', text: 'Thử một quán ăn chưa từng tới', emoji: '🍽️', reward: '+30 💖' },
    { id: 'm4', text: 'Làm điều bất ngờ cho người kia', emoji: '🎁', reward: '+60 💖' },
    { id: 'm5', text: 'Cùng nấu một món mới lạ', emoji: '👨‍🍳', reward: '+35 💖' },
    { id: 'm6', text: 'Viết thư tay dài cho đối phương', emoji: '✉️', reward: '+45 💖' },
  ],

  // ──────── GIFT DATABASE ────────
  GIFTS: {
    anniversary: [
      { title: 'Album Ảnh Cặp Đôi Handmade', desc: 'In ảnh từ đầu tới giờ, mua quyển sổ craft dán vào, viết vài dòng sến sẩm. Cảm động 10/10.', price: '150k–300k' },
      { title: 'Chuyến Staycation Mini', desc: 'Thuê homestay/khách sạn view đẹp cuối tuần. Đổi gió chill chill 2 ngày 1 đêm.', price: '500k–1.5tr' },
      { title: 'Nhẫn Cặp Bạc Khắc Tên', desc: 'Đơn giản, ý nghĩa — đánh dấu chủ quyền một cách tinh tế.', price: '200k–500k' },
      { title: 'Set Nến Thơm + Hoa Khô', desc: 'Decor phòng lãng mạn từ A tới Z, mỗi lần thắp nến lại nhớ nhau.', price: '150k–400k' },
    ],
    birthday: [
      { title: 'Nước Hoa Chiết 10ml Auth', desc: 'Tặng mùi hương để lúc nào cũng nhớ đến mình. Nước hoa chiết xịn, dùng thử rồi mê.', price: '100k–300k' },
      { title: 'Đồng Hồ Đeo Tay', desc: 'Đánh dấu cột mốc thời gian, phụ kiện thiết thực dùng mỗi ngày.', price: '300k–2tr' },
      { title: 'Bữa Steak Tự Nấu Tại Nhà', desc: 'Setup bàn ăn với nến + rượu vang. Rẻ mà cực chất lượng tình cảm.', price: '200k–400k' },
      { title: 'AirPods / Tai Nghe Bluetooth', desc: 'Thiết thực, xài hàng ngày, mỗi lần đeo lại nhớ người tặng.', price: '300k–3tr' },
    ],
    apology: [
      { title: 'Box Bánh Ngọt + Trà Sữa', desc: 'Con đường ngắn nhất đến trái tim là qua bao tử. Combo đồ ngọt xoa dịu mọi cơn giận.', price: '80k–200k' },
      { title: 'Hoa Hướng Dương + Thư Tay', desc: 'Sự chân thành là món quà xin lỗi tốt nhất. Hoa mặt trời = "Em/Anh luôn hướng về người".', price: '100k–250k' },
      { title: 'Vé Xem Phim + Ăn Tối', desc: 'Mời đi xem phim làm hoà rồi ăn đồ nướng xả stress.', price: '200k–400k' },
      { title: 'Gấu Bông Ôm Kèm Thiệp', desc: 'Classic nhưng không bao giờ lỗi thời. Viết thiệp thật sến là auto hết giận.', price: '100k–350k' },
    ],
    surprise: [
      { title: 'Túi Tote Xinh Xắn', desc: 'Đựng cả thế giới, tiện xài hàng ngày. Đặc biệt nếu mua loại in hình couple.', price: '80k–200k' },
      { title: 'Cây Sen Đá Mini + Chậu Cute', desc: 'Nhỏ gọn để bàn. Coi nó như biểu tượng tình yêu "mạnh như sỏi đá".', price: '50k–120k' },
      { title: 'Cặp Cốc Giữ Nhiệt Đôi', desc: 'Quan tâm sức khoẻ + thói quen uống nước. Siêu thiết thực.', price: '150k–350k' },
      { title: 'Voucher Spa / Massage', desc: 'Cho người ấy 1 buổi thư giãn đúng nghĩa. Ai cũng cần được chăm sóc.', price: '200k–500k' },
    ],
  },

  // ──────── MINI GAME QUESTIONS ────────
  QUESTIONS: [
    { q: 'Người kia thích ăn gì nhất?', opts: ['Đồ mặn / Nướng / Lẩu', 'Đồ ngọt / Trà sữa', 'Healthy / Salad', 'Gì cũng được miễn có bạn'] },
    { q: 'Khi buồn, người kia thường làm gì?', opts: ['Nằm cuộn chăn nghe nhạc', 'Ăn thật nhiều', 'Im lặng lướt điện thoại', 'Tìm người tâm sự'] },
    { q: 'Người kia thích thời tiết nào nhất?', opts: ['Mưa rả rích', 'Nắng rực rỡ', 'Se se lạnh', 'Gió nhẹ ban chiều'] },
    { q: 'Nếu được đi du lịch, người kia sẽ chọn?', opts: ['Biển xanh cát trắng', 'Núi rừng sương mù', 'Thành phố sôi động', 'Ở nhà chill cũng ok'] },
    { q: 'Màu sắc yêu thích của người kia?', opts: ['Đen / Trắng', 'Hồng / Tím', 'Xanh dương', 'Không quan tâm màu'] },
    { q: 'Khi hẹn hò, người kia thích?', opts: ['Quán cafe yên tĩnh', 'Đi dạo phố / công viên', 'Xem phim lười biếng', 'Thử quán mới'] },
    { q: 'Lúc giận, người kia muốn?', opts: ['Được ôm / vỗ về', 'Được cho không gian riêng', 'Được xin lỗi ngay', 'Được mua đồ ăn chuộc'] },
  ],
};

// ──────── STATE ────────
let questState = {};
let milestones = [];
let gameState = { phase: 'setup', player: 0, currentQ: 0, answers: [[], []], scores: [0, 0] };

// ──────── INIT ────────
document.addEventListener('DOMContentLoaded', () => {
  injectDOM();
  bindEvents();
  loadQuests();
  loadMilestones();
});

// =========================================
// DOM INJECTION
// =========================================
function injectDOM() {
  document.body.insertAdjacentHTML('beforeend', `
    <button id="lh-fab" class="love-hub-fab" title="Trạm Tình Yêu">
      <span class="fab-icon">💖</span>
      <span class="fab-badge" id="lh-badge">!</span>
    </button>

    <div id="lh-overlay" class="love-hub-overlay">
      <div class="lh-modal">
        <div class="lh-header">
          <h2>💕 Trạm Tình Yêu</h2>
          <button class="lh-close-btn" id="lh-close">✕</button>
        </div>

        <div class="lh-tabs">
          <button class="lh-tab active" data-t="p-quest"><span class="tab-emoji">📋</span>Quests</button>
          <button class="lh-tab" data-t="p-gift"><span class="tab-emoji">🎁</span>Quà Tặng</button>
          <button class="lh-tab" data-t="p-game"><span class="tab-emoji">🎮</span>Mini Game</button>
          <button class="lh-tab" data-t="p-miles"><span class="tab-emoji">📌</span>Cột Mốc</button>
        </div>

        <div class="lh-body">

          <!-- QUEST PANEL -->
          <div id="p-quest" class="lh-panel active">
            <div class="lh-streak" id="lh-streak">🔥 Streak: 0 tuần liên tiếp</div>
            <div class="lh-card">
              <h3 class="lh-card-head"><span class="icon icon-blue">📅</span> Nhiệm Vụ Tuần</h3>
              <div class="lh-progress"><div class="lh-progress-fill" id="prog-w" style="width:0%"></div></div>
              <div id="qlist-w"></div>
            </div>
            <div class="lh-card">
              <h3 class="lh-card-head"><span class="icon icon-purple">🗓️</span> Nhiệm Vụ Tháng</h3>
              <div class="lh-progress"><div class="lh-progress-fill" id="prog-m" style="width:0%"></div></div>
              <div id="qlist-m"></div>
            </div>
          </div>

          <!-- GIFT PANEL -->
          <div id="p-gift" class="lh-panel">
            <div class="lh-card">
              <h3 class="lh-card-head"><span class="icon icon-pink">✨</span> Trợ Lý Gợi Ý Quà</h3>
              <p style="font-size:.82rem;color:#64748b;margin:0 0 14px;line-height:1.45">Khỏi suy nghĩ — điền thông tin, nhận gợi ý quà tặng chuẩn tâm lý ngay!</p>
              <div class="lh-form-group">
                <label class="lh-label">🎀 Dịp gì đây?</label>
                <select id="gf-occ" class="lh-select">
                  <option value="anniversary">Kỷ niệm / Ngày yêu nhau</option>
                  <option value="birthday">Sinh nhật</option>
                  <option value="apology">Xin lỗi / Làm hoà</option>
                  <option value="surprise">Tặng bất ngờ</option>
                </select>
              </div>
              <div class="lh-form-group">
                <label class="lh-label">💡 Sở thích ngầm (tuỳ chọn)</label>
                <input type="text" id="gf-hobby" class="lh-input" placeholder="VD: Thích chụp hình, mê trà sữa...">
              </div>
              <button class="lh-btn" id="gf-go">✨ Tìm Ý Tưởng Quà</button>
              <div id="gf-result"></div>
            </div>
          </div>

          <!-- GAME PANEL -->
          <div id="p-game" class="lh-panel">
            <div class="lh-card">
              <h3 class="lh-card-head"><span class="icon icon-amber">🧠</span> Ai Hiểu Nhau Hơn?</h3>

              <div id="mg-setup" class="mg-setup">
                <p>Chơi trên cùng 1 điện thoại! Người Chơi 1 sẽ bí mật trả lời các câu hỏi về MÌNH. Sau đó, đưa máy cho Người Chơi 2 ĐOÁN xem Người 1 đã chọn gì nhé 😏</p>
                <div class="mg-player-select">
                  <div class="mg-player-card selected" data-p="0">
                    <div class="emoji">👩</div>
                    <div class="label">Người Chơi 1 (Chọn)</div>
                  </div>
                  <div class="mg-player-card" data-p="1">
                    <div class="emoji">👨</div>
                    <div class="label">Người Chơi 2 (Đoán)</div>
                  </div>
                </div>
                <button class="lh-btn" id="mg-start">🚀 Bắt Đầu Chơi</button>
              </div>

              <div id="mg-play" style="display:none">
                <div class="lh-streak" id="mg-turn">🎤 Lượt của: Người Chơi 1</div>
                <div class="mg-question-text" id="mg-q"></div>
                <div class="mg-answers" id="mg-opts"></div>
                <div class="mg-status" id="mg-status"></div>
              </div>

              <div id="mg-end" style="display:none" class="mg-final">
                <div class="trophy">🏆</div>
                <h3 id="mg-end-title">Kết quả!</h3>
                <div class="mg-score-compare" id="mg-scores"></div>
                <p id="mg-end-msg"></p>
                <button class="lh-btn-outline" id="mg-retry">🔄 Chơi Lại</button>
              </div>
            </div>
          </div>

          <!-- MILESTONE PANEL -->
          <div id="p-miles" class="lh-panel">
            <div class="lh-card">
              <h3 class="lh-card-head"><span class="icon icon-green">📍</span> Cột Mốc Cá Nhân</h3>
              <div id="ms-list"></div>
              <hr class="lh-divider">
              <h4 style="font-size:.85rem;font-weight:700;margin:0 0 10px;color:#334155">+ Thêm cột mốc mới</h4>
              <div class="lh-form-group">
                <input type="text" id="ms-name" class="lh-input" placeholder="VD: Lần đầu ra mắt gia đình 🏡">
              </div>
              <div class="lh-form-group">
                <input type="date" id="ms-date" class="lh-input">
              </div>
              <button class="lh-btn" id="ms-add">📌 Lưu Cột Mốc</button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div id="lh-toast" class="lh-toast"></div>
  `);
}

// =========================================
// EVENTS
// =========================================
function bindEvents() {
  const fab = document.getElementById('lh-fab');
  const overlay = document.getElementById('lh-overlay');

  fab.addEventListener('click', () => {
    overlay.classList.add('open');
    document.getElementById('lh-badge').style.display = 'none';
  });
  document.getElementById('lh-close').addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

  // Tabs
  document.querySelectorAll('.lh-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.lh-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.lh-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.t).classList.add('active');
    });
  });

  // Gift
  document.getElementById('gf-go').addEventListener('click', generateGift);

  // Milestones
  document.getElementById('ms-add').addEventListener('click', addMilestone);

  // Mini Game
  document.getElementById('mg-start').addEventListener('click', startGame);
  document.getElementById('mg-retry').addEventListener('click', resetGame);
}

function toast(msg) {
  const t = document.getElementById('lh-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// =========================================
// 1. QUESTS
// =========================================
function loadQuests() {
  const saved = localStorage.getItem(LH.KEYS.quests);
  questState = saved ? JSON.parse(saved) : {};
  renderQuests(LH.WEEKLY_QUESTS, 'qlist-w', 'prog-w');
  renderQuests(LH.MONTHLY_QUESTS, 'qlist-m', 'prog-m');
  updateStreak();
}

function saveQuests() {
  localStorage.setItem(LH.KEYS.quests, JSON.stringify(questState));
}

function renderQuests(list, containerId, progId) {
  const cont = document.getElementById(containerId);
  const doneCount = list.filter(q => questState[q.id]).length;
  document.getElementById(progId).style.width = `${(doneCount / list.length) * 100}%`;

  cont.innerHTML = list.map(q => {
    const done = questState[q.id];
    return `
      <div class="quest-row ${done ? 'done' : ''}" id="qr_${q.id}" onclick="window._toggleQ('${q.id}')">
        <input type="checkbox" class="q-check" ${done ? 'checked' : ''} onclick="event.stopPropagation();window._toggleQ('${q.id}')">
        <div class="q-body">
          <p class="q-text">${q.emoji} ${q.text}</p>
          <span class="q-reward">${q.reward}</span>
        </div>
      </div>`;
  }).join('');
}

window._toggleQ = function (id) {
  questState[id] = !questState[id];
  saveQuests();
  loadQuests();
  if (questState[id] && typeof confetti !== 'undefined') {
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: ['#f43f5e', '#8b5cf6', '#f59e0b'] });
  }
};

function updateStreak() {
  const done = Object.values(questState).filter(Boolean).length;
  const total = LH.WEEKLY_QUESTS.length + LH.MONTHLY_QUESTS.length;
  const weeks = Math.floor(done / LH.WEEKLY_QUESTS.length);
  document.getElementById('lh-streak').innerHTML = `<span class="fire">🔥</span> Streak: ${weeks} tuần — Đã hoàn thành ${done}/${total} nhiệm vụ`;
}

// =========================================
// 2. GIFT ADVISOR
// =========================================
function generateGift() {
  const occ = document.getElementById('gf-occ').value;
  const hobby = document.getElementById('gf-hobby').value.trim().toLowerCase();
  const btn = document.getElementById('gf-go');
  const box = document.getElementById('gf-result');

  btn.innerHTML = '⏳ Đang phân tích...';
  btn.disabled = true;

  setTimeout(() => {
    const pool = LH.GIFTS[occ] || LH.GIFTS.surprise;
    // Pick 2 random non-duplicate
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 2);

    let html = picks.map(g => `
      <div class="gift-result-card">
        <h4>🎁 ${g.title}</h4>
        <p>${g.desc}</p>
        <p style="margin-top:6px;font-size:.8rem;color:#8b5cf6;font-weight:600">💰 Tầm giá: ${g.price}</p>
      </div>`).join('');

    if (hobby.length > 1) {
      html += `
        <div class="gift-result-card gift-result-tip">
          <h4>💡 Tips bí mật</h4>
          <p>Kết hợp tặng kèm món liên quan đến <b>"${hobby}"</b> — Đối phương sẽ cảm nhận được bạn thật sự để ý và quan tâm đến chi tiết nhỏ nhất!</p>
        </div>`;
    }

    box.innerHTML = html;
    btn.innerHTML = '🔄 Gợi Ý Khác';
    btn.disabled = false;
  }, 900);
}

// =========================================
// 3. MINI GAME — 2 PLAYERS
// =========================================
function resetGame() {
  gameState = { phase: 'setup', player: 0, currentQ: 0, answers: [[], []], scores: [0, 0] };
  document.getElementById('mg-setup').style.display = '';
  document.getElementById('mg-play').style.display = 'none';
  document.getElementById('mg-end').style.display = 'none';
}

function startGame() {
  // Shuffle & pick 5 questions
  gameState.pool = [...LH.QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
  gameState.phase = 'p1_picking'; // p1_picking -> p2_guessing
  gameState.player = 0;
  gameState.currentQ = 0;
  gameState.answers = [[], []]; // [0] is P1 actual answers, [1] is P2 guesses

  document.getElementById('mg-setup').style.display = 'none';
  document.getElementById('mg-play').style.display = '';
  showQuestion();
}

function showQuestion() {
  const q = gameState.pool[gameState.currentQ];

  if (gameState.phase === 'p1_picking') {
    document.getElementById('mg-turn').innerHTML = `🎤 Lượt Người Chơi 1 (Chọn đáp án cho MÌNH) — Câu ${gameState.currentQ + 1}/${gameState.pool.length}`;
    // Đổi đại từ "Người kia" trong tuỳ chọn DB ngẫu nhiên thành "Bạn" cho P1
    document.getElementById('mg-q').textContent = q.q.replace(/Người kia/gi, 'Bạn');
  } else {
    document.getElementById('mg-turn').innerHTML = `🤔 Lượt Người Chơi 2 (ĐOÁN Tâm Ý đối phương) — Câu ${gameState.currentQ + 1}/${gameState.pool.length}`;
    document.getElementById('mg-q').textContent = q.q.replace(/Người kia/gi, 'Người Chơi 1');
  }

  document.getElementById('mg-status').textContent = '';

  const letters = ['A', 'B', 'C', 'D'];
  document.getElementById('mg-opts').innerHTML = q.opts.map((opt, i) => `
    <button class="mg-answer-btn" onclick="window._pickAnswer(${i})">
      <span class="letter">${letters[i]}</span> ${opt}
    </button>`).join('');
}

window._pickAnswer = function (idx) {
  // Disable all buttons
  document.querySelectorAll('.mg-answer-btn').forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (i === idx) btn.classList.add('picked');
  });

  if (gameState.phase === 'p1_picking') {
    gameState.answers[0].push(idx);
  } else {
    gameState.answers[1].push(idx);

    // Confetti only if guessed correctly
    if (gameState.answers[0][gameState.currentQ] === idx && typeof confetti !== 'undefined') {
      confetti({ particleCount: 25, spread: 30, origin: { y: 0.65 }, colors: ['#10b981', '#f59e0b'] });
    } else {
      // Sai -> gạch chéo
      document.querySelectorAll('.mg-answer-btn')[gameState.answers[0][gameState.currentQ]].style.borderColor = '#10b981';
      document.querySelectorAll('.mg-answer-btn')[gameState.answers[0][gameState.currentQ]].style.background = '#d1fae5';
    }
  }

  setTimeout(() => {
    // Next player or next question
    gameState.currentQ++;

    if (gameState.currentQ >= gameState.pool.length) {
      if (gameState.phase === 'p1_picking') {
        // P1 done, time for P2
        gameState.phase = 'p2_guessing';
        gameState.currentQ = 0;
        document.getElementById('mg-status').innerHTML = '📲 Giấu màn hình! Đưa điện thoại cho <b>Người Chơi 2</b> nhé!';
        setTimeout(() => showQuestion(), 1800);
      } else {
        // P2 done, finish game
        finishGame();
      }
    } else {
      setTimeout(() => showQuestion(), 800);
    }
  }, 1200);
};

function finishGame() {
  document.getElementById('mg-play').style.display = 'none';
  document.getElementById('mg-end').style.display = '';

  // Compare answers
  let match = 0;
  for (let i = 0; i < gameState.pool.length; i++) {
    if (gameState.answers[0][i] === gameState.answers[1][i]) match++;
  }

  const pct = Math.round((match / gameState.pool.length) * 100);

  document.getElementById('mg-scores').innerHTML = `
    <div class="mg-score-box">
      <div class="who">Số câu đoán ĐÚNG</div>
      <div class="pts" style="color:#10b981">${match}/${gameState.pool.length}</div>
    </div>
    <div class="mg-score-box">
      <div class="who">Độ Thấu Hiểu</div>
      <div class="pts">${pct}%</div>
    </div>`;

  let title, msg;
  if (pct >= 80) {
    title = '💕 Tri Kỷ Đi Guốc Trong Bụng Nhau!';
    msg = 'Đỉnh cao! Người Chơi 2 thực sự tinh tế và lúc nào cũng để ý đến những chi tiết nhỏ nhất của Người Chơi 1.';
  } else if (pct >= 50) {
    title = '😊 Khá Hợp Nhau Đó!';
    msg = 'Có tiềm năng lớn nha! Còn vài điểm chưa đoán trúng nhưng không sao, hẹn hò thêm là biết tuốt!';
  } else {
    title = '🤔 Còn Phải Cố Gắng Thêm!';
    msg = 'Thôi chết, có vẻ người chơi 2 phải chú tâm nhiều hơn đến "nửa kia" rồi. Phạt mua một ly trà sữa để đền bù nhé!';
  }

  document.getElementById('mg-end-title').textContent = title;
  document.getElementById('mg-end-msg').textContent = msg;

  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#f43f5e', '#8b5cf6', '#f59e0b', '#10b981'] });
  }
}

// =========================================
// 4. CUSTOM MILESTONES
// =========================================
function loadMilestones() {
  const saved = localStorage.getItem(LH.KEYS.miles);
  milestones = saved ? JSON.parse(saved) : [];
  renderMilestones();
}

function saveMilestones() {
  localStorage.setItem(LH.KEYS.miles, JSON.stringify(milestones));
}

function addMilestone() {
  const name = document.getElementById('ms-name').value.trim();
  const date = document.getElementById('ms-date').value;
  if (!name || !date) { toast('⚠️ Vui lòng nhập đủ Tên và Ngày!'); return; }

  milestones.push({ id: Date.now().toString(), name, date });
  milestones.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveMilestones();
  renderMilestones();
  toast('✅ Đã lưu cột mốc mới!');

  document.getElementById('ms-name').value = '';
  document.getElementById('ms-date').value = '';
}

window._delMs = function (id) {
  if (!confirm('Xoá cột mốc này?')) return;
  milestones = milestones.filter(m => m.id !== id);
  saveMilestones();
  renderMilestones();
};

function renderMilestones() {
  const box = document.getElementById('ms-list');
  if (!milestones.length) {
    box.innerHTML = `<div class="lh-empty"><div class="icon">📌</div><p>Chưa có cột mốc nào. Hãy lưu lại kỷ niệm đầu tiên!</p></div>`;
    return;
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);

  box.innerHTML = milestones.map(ms => {
    const d = new Date(ms.date); d.setHours(0, 0, 0, 0);
    let diff = Math.floor((today - d) / 864e5);
    let unit = 'ngày trước';
    if (diff < 0) { diff = Math.abs(diff); unit = 'ngày nữa'; }
    else if (diff === 0) { diff = '🎉'; unit = 'Hôm Nay!'; }

    const fmt = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    return `
      <div class="ms-item">
        <div class="ms-icon">📍</div>
        <div class="ms-detail">
          <h4 class="ms-name">${ms.name}</h4>
          <span class="ms-date-text">📅 ${fmt}</span>
        </div>
        <div class="ms-counter">
          <div class="ms-num">${diff}</div>
          <div class="ms-unit">${unit}</div>
        </div>
        <button class="ms-del" onclick="window._delMs('${ms.id}')">🗑️</button>
      </div>`;
  }).join('');
}
