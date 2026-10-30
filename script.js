/* ============================================================
   1. ФОНОВЫЕ ЛЕПЕСТКИ
   ============================================================ */
(function initBgPetals() {
  const container = document.getElementById('bgPetals');
  const emojis = ['☁️', '🦋', '✿', '❀', '☁', '✦', '💜','🎀'];
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div');
    el.className = 'bg-petal';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (14 + Math.random() * 26) + 'px';
    el.style.animationDuration = (14 + Math.random() * 20) + 's';
    el.style.animationDelay = (-Math.random() * 24) + 's';
    container.appendChild(el);
  }
})();

/* ============================================================
   2. ТОСТЫ
   ============================================================ */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ============================================================
   3. СИСТЕМА ЧАСТИЦ (КОНФЕТТИ И САЛЮТ)
   ============================================================ */
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animId = null;

function resizeCanvas() { 
  canvas.width = window.innerWidth; 
  canvas.height = window.innerHeight; 
}
resizeCanvas(); 
window.addEventListener('resize', resizeCanvas);

// Нежные цвета для конфетти
const colors = ['#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#7e22ce', '#f3e8ff', '#ffffff'];

// ЯРКИЕ цвета для салюта (радуга)
const fireworkColors = [
  '#ff0040', '#ff7f00', '#ffd700', '#00ff7f', '#00bfff', '#8a2be2', '#ff1493', // неон
  '#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff', '#00ffff' // классика
];

function drawHeart(x, y, size, rotation) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.scale(size / 20, size / 20);
  ctx.beginPath(); ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-12, -6, -20, -2, -20, 8);
  ctx.bezierCurveTo(-20, 16, -8, 22, 0, 28);
  ctx.bezierCurveTo(8, 22, 20, 16, 20, 8);
  ctx.bezierCurveTo(20, -2, 12, -6, 0, 6);
  ctx.fill(); ctx.restore();
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius, rotation) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function updateAndDrawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.globalCompositeOperation = 'lighter';

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += p.gravity; 
    p.vx *= p.friction; 
    p.vy *= p.friction;
    p.x += p.vx; 
    p.y += p.vy; 
    p.rotation += p.rotSpeed; 
    p.life -= p.decay;
    
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    
    if (p.isFirework) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } 
    else {
      if (p.shape === 'circle') { 
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2); ctx.fill(); 
      }
      else if (p.shape === 'rect') { 
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore(); 
      }
      else if (p.shape === 'heart') { drawHeart(p.x, p.y, p.size, p.rotation); }
      else if (p.shape === 'star') { 
        ctx.save(); ctx.translate(p.x, p.y); drawStar(0, 0, 5, p.size, p.size/2, p.rotation); ctx.restore(); 
      }
    }
  }
  
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  if (particles.length > 0) { 
    animId = requestAnimationFrame(updateAndDrawParticles); 
  } else { 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    animId = null; 
  }
}

function startAnimation() {
  if (!animId) animId = requestAnimationFrame(updateAndDrawParticles);
}

window.launchConfetti = function (count = 100, x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const shapes = ['circle', 'rect', 'heart', 'star'];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    particles.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
      gravity: 0.22, friction: 0.99, decay: 0.008,
      size: 6 + Math.random() * 10, color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.3,
      shape: shapes[Math.floor(Math.random() * shapes.length)], life: 1, isFirework: false
    });
  }
  startAnimation();
};

window.launchFireworks = function () {
  let fireworkCount = 0;
  const maxFireworks = 8;

  const interval = setInterval(() => {
    const fx = window.innerWidth * (0.2 + Math.random() * 0.6);
    const fy = window.innerHeight * (0.1 + Math.random() * 0.4);
    
        const fireworkColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
    const sparkCount = 60 + Math.random() * 60;

    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      particles.push({
        x: fx, y: fy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        gravity: 0.08, friction: 0.96, decay: 0.015 + Math.random() * 0.01,
        size: 2 + Math.random() * 3, color: fireworkColor,
        rotation: 0, rotSpeed: 0, shape: 'circle', life: 1, isFirework: true
      });
    }
    
    startAnimation();

    fireworkCount++;
    if (fireworkCount >= maxFireworks) clearInterval(interval);
  }, 350);

  startAnimation();
};

/* ============================================================
   4. ИГРА: ПОЙМАЙ ЦВЕТОК
   ============================================================ */
(function initGame() {
  const area = document.getElementById('gameArea');
  const basket = document.getElementById('gameBasket');
  const scoreEl = document.getElementById('gameScore');
  const timeEl = document.getElementById('gameTime');
  const overlay = document.getElementById('gameStartOverlay');
  
  let score = 0, timeLeft = 15, isPlaying = false;
  let items = [], gameLoopId, spawnInterval, timerInterval;
  let basketX = 50;

    // Только цветы, много красных оттенков
  const goodEmojis = ['🌹', '🌺', '🌷', '🌸', '🏵️', '🌻', '🌼', '💐'];
  const badEmoji = '🌵';

  function moveBasket(e) {
    if (!isPlaying) return;
    const rect = area.getBoundingClientRect();
    let clientX = e.clientX;
    if (e.touches) clientX = e.touches[0].clientX;
    
    let x = clientX - rect.left;
    basketX = Math.max(10, Math.min(90, (x / rect.width) * 100));
    basket.style.left = basketX + '%';
  }

    area.addEventListener('mousemove', moveBasket);
  
  let touchStartY = 0;
  area.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  area.addEventListener('touchmove', (e) => { 
    const touchY = e.touches[0].clientY;
    // Если палец двигается вбок (по горизонтали), двигаем корзину
    if (Math.abs(touchY - touchStartY) < 15) {
      e.preventDefault(); 
      moveBasket(e); 
    }
  }, { passive: false });

  function spawnItem() {
    if (!isPlaying) return;
    const el = document.createElement('div');
    el.className = 'game-item';
    const isBad = Math.random() < 0.22;
    el.textContent = isBad ? badEmoji : goodEmojis[Math.floor(Math.random() * goodEmojis.length)];
    
    const x = 10 + Math.random() * 80;
    el.style.left = x + '%';
    el.style.top = '-40px';
    area.appendChild(el);

    const speed = 2 + Math.random() * 3;
    items.push({ el, x, y: -40, speed, isBad });
  }

  function updateGame() {
    if (!isPlaying) return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const hitZone = isTouch ? 22 : 15;

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.y += item.speed;
      item.el.style.top = item.y + 'px';

      const areaH = area.offsetHeight;
      if (item.y > areaH - 80 && item.y < areaH) {
        if (Math.abs(item.x - basketX) < hitZone) {
          if (item.isBad) {
            score = Math.max(0, score - 5);
            showToast('🌵 Ой! Кактус! -5');
          } else {
            score += 10;
            if (Math.random() < 0.3) {
              const rect = area.getBoundingClientRect();
              window.launchConfetti(15, rect.left + (item.x/100)*rect.width, rect.top + item.y);
            }
          }
          scoreEl.textContent = `Счёт: ${score}`;
          item.el.remove();
          items.splice(i, 1);
          continue;
        }
      }

      if (item.y > areaH) {
        item.el.remove();
        items.splice(i, 1);
      }
    }
    gameLoopId = requestAnimationFrame(updateGame);
  }

  function startGame() {
    score = 0; timeLeft = 15; isPlaying = true;
    scoreEl.textContent = `Счёт: ${score}`;
    timeEl.textContent = `Время: ${timeLeft}с`;
    overlay.classList.add('hidden');
    items.forEach(i => i.el.remove());
    items = [];
    basketX = 50; basket.style.left = '50%';

    spawnInterval = setInterval(spawnItem, 650);
    timerInterval = setInterval(() => {
      timeLeft--;
      timeEl.textContent = `Время: ${timeLeft}с`;
      if (timeLeft <= 0) endGame();
    }, 1000);

    updateGame();
  }

  function endGame() {
    isPlaying = false;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    cancelAnimationFrame(gameLoopId);
    items.forEach(i => i.el.remove());
    items = [];
    
    let msg = '';
    if (score >= 120) msg = '🏆 Блестяще! Пусть и в жизни всё будет так же легко и точно в цель!';
    else if (score >= 70) msg = '🌸 Отличный результат!';
    else if (score >= 30) msg = '🌷 Неплохо! Ещё немного тренировки — и будет идеально.';
    else msg = '🌼 Ничего страшного, главное — веселье!';

    overlay.classList.remove('hidden');
    overlay.innerHTML = `<div class="center">
      <h3 style="margin-bottom:10px;color:var(--text);font-family:'Cormorant Garamond',serif;font-size:1.6rem;">Твой счёт: ${score}</h3>
      <p style="margin-bottom:15px;color:var(--text);">${msg}</p>
      <button class="btn" id="gameRestartBtn">Ещё раз 🔄</button>
    </div>`;

    document.getElementById('gameRestartBtn').addEventListener('click', () => {
      overlay.innerHTML = `<button class="btn" id="gameStartBtn">Играть 🌸</button>`;
      document.getElementById('gameStartBtn').addEventListener('click', startGame);
    });
    window.launchConfetti(60);
  }

  document.getElementById('gameStartBtn').addEventListener('click', startGame);
})();

/* ============================================================
   5. КНОПКА САЛЮТА
   ============================================================ */
const partyBtn = document.getElementById('partyBtn');
partyBtn.addEventListener('click', () => {
  window.launchFireworks();
  showToast('💜С днём рождения, Настя!💜');
});

/* ============================================================
   6. АВТОКОНФЕТТИ И ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ
   ============================================================ */
window.addEventListener('load', () => setTimeout(() => window.launchConfetti(90), 600));

(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el, i) => {
    el.style.transitionDelay = (i * 0.08) + 's';
    obs.observe(el);
  });
})();

/* ============================================================
   7. ПАСХАЛКА (клик по имени)
   ============================================================ */
document.getElementById('nameTrigger').addEventListener('click', (e) => {
  window.launchConfetti(80, e.clientX, e.clientY);
  showToast('😘 Настя, ты супер!');
});

/* ============================================================
   8. КАРУСЕЛЬ ВИДЕО
   ============================================================ */
(function initVideoCarousel() {
  const carousel = document.getElementById('videoCarousel');
  const prevBtn = document.getElementById('videoPrev');
  const nextBtn = document.getElementById('videoNext');
  
  if (!carousel) return;

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  }

  function pauseAllVideos() {
    const videos = carousel.querySelectorAll('video');
    videos.forEach(v => v.pause());
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      pauseAllVideos();
      const card = carousel.querySelector('.video-card');
      if (!card) return;
      const cardWidth = card.offsetWidth + 20;
      carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      pauseAllVideos();
      const card = carousel.querySelector('.video-card');
      if (!card) return;
      const cardWidth = card.offsetWidth + 20;
      carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
  }

  carousel.addEventListener('touchstart', pauseAllVideos, { passive: true });


    const videos = carousel.querySelectorAll('video');
  videos.forEach(video => {
    video.addEventListener('play', () => {
      videos.forEach(v => {
        if (v !== video) v.pause();
      });
    });
  });
})();

(function initMood() {
  const buttons = document.querySelectorAll('.mood-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Убираем класс active у всех
      buttons.forEach(b => b.classList.remove('active'));
      // Добавляем нажатой
      btn.classList.add('active');
      
      // Меняем класс на body
      const mood = btn.dataset.mood;
      document.body.className = ''; // сбрасываем старые
      document.body.classList.add(`mood-${mood}`);
      
      // Небольшой взрыв конфетти для радости
      if (window.launchConfetti) {
        window.launchConfetti(30);
      }
    });
  });
})();
/* ============================================================
   12. ВИРТУАЛЬНЫЙ КОТИК
   ============================================================ */
(function initVirtualPet() {
  const cat = document.getElementById('petCat');
  const speech = document.getElementById('petSpeech');
  const modal = document.getElementById('petModal');
  const closeBtn = document.getElementById('closePetModal');
  
  if (!cat) return;

  let clickCount = 0;
  let speechTimeout;

  const phrases = [
    'Мяу! 🐾',
    'Мурр 💜',
    'Погладь ещё! ✨',
    'С днём рождения! 🎂'
  ];

  cat.addEventListener('click', () => {
    clickCount++;

    // Показываем случайную фразу
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    speech.textContent = randomPhrase;
    speech.classList.add('show');

    clearTimeout(speechTimeout);
    speechTimeout = setTimeout(() => {
      speech.classList.remove('show');
    }, 2000);

    // Прыжок котика
    cat.style.transform = 'translateY(-15px) scale(1.1)';
    setTimeout(() => {
      cat.style.transform = '';
    }, 200);

    // Немного конфетти при клике
    if (window.launchConfetti) {
      const rect = cat.getBoundingClientRect();
      window.launchConfetti(5, rect.left + rect.width / 2, rect.top);
    }

    // Если затискали (5 раз)
    if (clickCount >= 5) {
      cat.style.display = 'none'; // Котик убегает
      speech.classList.remove('show');
      
      // Взрыв конфетти на весь экран
      if (window.launchConfetti) {
        window.launchConfetti(150);
      }
      
      // Показываем записку
      setTimeout(() => {
        modal.classList.add('show');
      }, 500);
    }
  });

  // Закрываем записку
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    // Через пару секунд возвращаем котика, чтобы можно было играть снова
    setTimeout(() => {
      cat.style.display = 'block';
      clickCount = 0; // Сбрасываем счетчик
    }, 1000);
  });
})();