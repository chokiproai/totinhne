<div align="center">

<br>

# 💌 Tỏ Tình Nè

### *Gửi yêu thương qua từng dòng code*

<br>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Tỏ_Tình_Nè-ff4d6d?style=for-the-badge&labelColor=1a1a2e)](https://chokiproai.github.io/totinhne)
[![GitHub](https://img.shields.io/badge/GitHub-chokiproai-181717?style=for-the-badge&logo=github&labelColor=1a1a2e)](https://github.com/chokiproai/totinhne)

---

<br>

*Bốn trải nghiệm web lãng mạn — mỗi trải nghiệm là một cách nói "Anh yêu em"*

<br>

</div>

---

## 🌸 Quà Tặng 8/3 — *Hoa Hồng & Thiên Hà*

> *Một món quà 3D tinh tế kết hợp giữa vẻ đẹp rực rỡ của vườn hoa và sự hùng vĩ của vũ trụ*

- ✉️ **Phong bì lãng mạn:** Hiệu ứng mở thư và gõ chữ (typing animation) thực tế.
- 🌹 **Vườn hoa 3D:** Các loại hoa (Hồng, Tulip, Cúc...) nở rộ sinh động với hiệu ứng hạt sáng.
- 🌌 **Hộp quà Universe:** Mở hộp quà bí mật để kích hoạt hoạt cảnh thiên hà 3D lung linh.
- ✍️ **Creator Mode:** Tự thiết kế trang web với các mẫu thơ có sẵn cho Mẹ, Cô giáo, Bạn bè, Người yêu.
- 🎶 **Trải nghiệm Premium:** Nhạc nền Piano sâu lắng, cánh hoa bay lơ lửng, hỗ trợ QR Code và nén link (LZString).

<br>

## 💕 Yêu Thương — *Tỏ tình rồi cùng đếm ngày bên nhau*

> *Hai trải nghiệm trong một — tỏ tình lãng mạn & theo dõi hành trình yêu nhau*

**💌 Tab Tỏ Tình:**
- 🎨 Giao diện lãng mạn với hoa rơi & confetti
- ✍️ Tùy chỉnh tên, lời nhắn, giới tính
- 📱 Tạo QR Code / chia sẻ Facebook, Zalo, Messenger
- 🏃 Nút "Không" chạy trốn khi người ấy muốn từ chối

**💕 Tab Đếm Ngày Yêu:**
- 📊 Bộ đếm real-time: năm, tháng, ngày, giờ, phút, giây
- 🏆 Cột mốc tự động: 100 ngày, 1000 ngày, 2 năm, 5 năm...
- 📅 Lịch âm dương, ngày lễ, sự kiện đặc biệt
- 👫 Hồ sơ đôi: tên, ảnh, cung hoàng đạo
- 🚀 Love Day Counter — SPA hiệu suất cao (React + Vite)
- 🤖 MediaPipe — Webcam hand tracking tương tác

<br>

## 💖 Trái Tim Của Em — *Celestial Heart*

> *22.000 hạt phát sáng hội tụ thành trái tim 3D — nhịp tim đập theo từng khoảnh khắc*

- ✨ Shader GLSL tùy chỉnh với additive blending
- 🌌 Nền tinh vân tím/hồng lung linh
- 💓 Hiệu ứng nhịp tim đập thực tế
- 🌸 Cánh hoa bay lơ lửng
- 💬 12 câu tình yêu tiếng Việt tự động xoay vòng
- 👆 Chạm để phân tán · Vuốt để xoay

<br>

## 🎄 Merry Christmas — *Cây Thông Ước Nguyện*

> *Cây thông 3D — thả đèn ước, bắn pháo hoa, đón ông già Noel bay ngang*

- 🎁 Cây thông Three.js với 100+ ornament
- 🏮 Thả đèn ước — viết điều ước, nhìn đèn bay lên trời
- 🎆 Pháo hoa bắn khi double-click
- 🎅 Ông già Noel bay qua bầu trời
- 📸 Upload ảnh kỷ niệm · ✋ Webcam hand tracking tương tác

---

<div align="center">

## 🛠 Công Nghệ

</div>

| | Công nghệ | Mô tả |
|---|---|---|
| 🎨 | **Three.js** | Đồ họa 3D, particle systems, bloom post-processing |
| ✏️ | **GLSL Shaders** | Shader tùy chỉnh cho hiệu ứng hạt & ánh sáng |
| 🖼 | **Vanilla JS** | Không framework — nhẹ, nhanh, linh hoạt |
| ⚛️ | **React + Vite** | Sử dụng cho module Love Day Counter |
| 📦 | **LZString** | Nén dữ liệu URL giúp QR Code dễ quét |
| 🤖 | **MediaPipe** | Xử lý Hand tracking tương tác qua webcam |
| 🎭 | **CSS Animations** | Hiệu ứng tuyết, aurora, cánh hoa bay |

---

<div align="center">

## ⚡ Chạy Thử

</div>

```bash
# Clone repo 
git clone https://github.com/chokiproai/totinhne.git
cd totinhne

# Chạy local server
npx serve .
```

Truy cập `http://localhost:3000` → Chọn trải nghiệm yêu thích

---

<div align="center">

## 📁 Cấu Trúc

</div>

```
totinhne/
├── index.html              ← Landing page chính
├── 8-3_gift/               ← 🌸 Quà Tặng 8/3 (Mới)
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── bg-music.mp3
├── yeuthuong/              ← 💕 Yêu Thương
│   ├── index.html
│   ├── to-tinh/            ← 💌 App tỏ tình
│   └── dem-ngay/           ← 📊 App đếm ngày
├── 3d-heart/               ← 💖 Trái tim 3D
└── christmas/              ← 🎄 Cây thông Noel
```

---

<div align="center">

<br>

*Made with ❤️ bởi [Ngọc Tuấn](https://www.facebook.com/share/1AkHwaJZTu/)*

*"Mỗi dòng code là một nhịp tim — gửi đến em"*

<br>

</div>
