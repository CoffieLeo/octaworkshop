// 八角形各點標籤資料（中文與英文對照）
const labels = [
    { ch: '重大使命與呼召', en: 'EPIC MEANING & CALLING' },
    { ch: '發展與成就', en: 'DEVELOPMENT & ACCOMPLISHMENT' },
    { ch: '賦予創造力與回饋', en: 'EMPOWERMENT OF CREATIVITY & FEEDBACK' },
    { ch: '社交影響力與同理心', en: 'SOCIAL INFLUENCE & RELATEDNESS' },
    { ch: '不確定性與好奇心', en: 'UNPREDICTABILITY & CURIOSITY' },
    { ch: '損失與避免', en: 'LOSS & AVOIDANCE' },
    { ch: '稀缺性與迫切', en: 'SCARCITY & IMPATIENCE' },
    { ch: '所有權與佔有欲', en: 'OWNERSHIP & POSSESSION' },
];

// 取得畫布與容器元素
const canvas = document.getElementById('radarCanvas');
const root = document.getElementById('radarRoot');
const ctx = canvas.getContext('2d', { alpha: true });

let DPR = Math.max(1, window.devicePixelRatio || 1);
let W, H, cx, cy;
function resize() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    const rect = root.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2;
    cy = H / 2;
    computePoints();
    placeLabels();
}
window.addEventListener('resize', resize);

// 八邊形
const N = 8;
let outerR = 260;
let points = [];

// 計算八角形各頂點座標
function computePoints() {
    outerR = Math.min(W, H) * 0.33;
    points = [];
    for (let i = 0; i < N; i++) {
        const ang = -Math.PI/2 + (i * 2*Math.PI / N);
        const x = cx + Math.cos(ang) * outerR;
        const y = cy + Math.sin(ang) * outerR;
        points.push({x,y,ang});
    }
}

// 建立每個八角形節點的文字標籤
const labelEls = [];
function createLabels() {
    document.querySelectorAll('.label').forEach(el => el.remove());
    labelEls.length = 0;
    for (let i=0;i<N;i++){
        const L = document.createElement('div');
        L.className = 'label';
        const box = document.createElement('div');
        box.className = 'box';
        box.innerHTML = `<span class="ch">${labels[i].ch}</span><span class="en">${labels[i].en.replace(" ", "<br>")}</span>`;
        L.appendChild(box);
        const con = document.createElement('div');
        con.className = 'connector';
        L.appendChild(con);
        root.appendChild(L);
        labelEls.push(L);
    }
}
createLabels();

// 擺放標籤位置（桌面模式）
function placeLabels(){
    if (!points || points.length !== N) computePoints();
    const offset = 42;
    for (let i=0;i<N;i++){
        const p = points[i];
        const x = p.x + Math.cos(p.ang) * offset;
        const y = p.y + Math.sin(p.ang) * offset;
        const el = labelEls[i];
        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        if (i === 1) el.style.transform = 'translate(-35%, -60%)';
        else if (i === 2) el.style.transform = 'translate(-8%, -50%)';
        else if (i === 3) el.style.transform = 'translate(5%, -40%)';
        else if (i === 4) el.style.transform = 'translate(-50%, -8%)';
        else if (i === 5) el.style.transform = 'translate(-85%, -40%)';
        else if (i === 6) el.style.transform = 'translate(-95%, -50%)';
        else if (i === 7) el.style.transform = 'translate(-65%, -60%)';
        else el.style.transform = 'translate(-50%, -50%)';
    }
}

/* --------------------
 粒子背景動畫（含顏色）
-------------------- */
const particleCount = 70;
const particles = [];
function initParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.random() * 20;
        const lightness = 60 + Math.random() * 20;
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.05,
            vy: (Math.random() - 0.5) * 0.05,
            r: 0.8 + Math.random() * 1.8,
            alpha: 0.4 + Math.random() * 0.6,
            color: `hsl(${hue}, ${saturation}%, ${lightness}%)`
        });
    }
}

/* --------------------
 八角形動畫控制
-------------------- */
let lastTs = 0;
const segmentDuration = 2000;
let totalElapsed = 0;
let highlightIndex = 0;

// 💡 更新標籤顯示狀態
function updateLabelVisibility() {
    if (window.innerWidth < 576) {
        labelEls.forEach((el, i) => {
            el.style.position = 'absolute';
            el.style.top = '-30px';
            el.style.left = '50%';
            el.style.transform = 'translateX(-50%)';
            el.style.opacity = i === highlightIndex ? 1 : 0;
            el.style.transition = 'opacity 0.6s ease';
        });
    } else {
        // 桌面模式全部顯示
        labelEls.forEach(el => {
            el.style.opacity = 1;
        });
        placeLabels();
    }
}

// 顏色漸層
function colorAt(t) {
    const a1 = {r: 75, g:130, b:255};
    const a2 = {r:140, g:100, b:255};
    const a3 = {r:255, g:90, b:180};
    if (t < 0.5) {
        const u = t/0.5;
        return `rgb(${Math.round(a1.r + (a2.r-a1.r)*u)}, ${Math.round(a1.g + (a2.g-a1.g)*u)}, ${Math.round(a1.b + (a2.b-a1.b)*u)})`;
    } else {
        const u = (t-0.5)/0.5;
        return `rgb(${Math.round(a2.r + (a3.r-a2.r)*u)}, ${Math.round(a2.g + (a3.g-a2.g)*u)}, ${Math.round(a2.b + (a3.b-a2.b)*u)})`;
    }
}

/* --------------------
 主動畫循環
-------------------- */
function step(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(40, ts - lastTs);
    lastTs = ts;
    totalElapsed += dt;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    drawParticles(dt);
    drawOctagonBase();
    drawHighlightSegment(totalElapsed);
    drawNodes();

    requestAnimationFrame(step);
}

function drawParticles(dt){
    for (let p of particles){
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W+20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H+20) p.y = -20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 0.6;
    for (let i=0;i<particles.length;i++){
        const a = particles[i];
        for (let j=i+1;j<particles.length;j++){
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < 90) {
                ctx.strokeStyle = 'rgba(110,120,200,' + (0.045 + (0.12*(1 - d/90))) + ')';
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }
    }
}

function drawOctagonBase(){
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(70,80,140,0.3)';
    for (let s = 1; s <= 3; s++) {
        const r = outerR * (s / 3);
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
            const ang = -Math.PI / 2 + i * 2 * Math.PI / N;
            const x = cx + Math.cos(ang) * r;
            const y = cy + Math.sin(ang) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(80,90,180,0.16)';
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
        const p = points[i];
        if (!p) continue;
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(100,120,200,0.1)';
    for (let i = 0; i < N; i++) {
        const p = points[i];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    }
}

function drawHighlightSegment(elapsed){
    const cycle = Math.floor(elapsed / segmentDuration);
    const idx = cycle % N;
    const t = (elapsed % segmentDuration) / segmentDuration;
    const a = points[idx];
    const b = points[(idx+1)%N];
    const globalT = ((elapsed % (segmentDuration*N)) / (segmentDuration*N));
    const col = colorAt(globalT);
    const sx = a.x, sy = a.y;
    const ex = sx + (b.x - a.x) * t;
    const ey = sy + (b.y - a.y) * t;

    // 🔹 小螢幕模式：一次只顯示一個，淡入淡出效果
    if (window.innerWidth < 576) {
        for (let i = 0; i < labelEls.length; i++) {
            const el = labelEls[i];
            if (i === idx) {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
            } else {
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            }
            // 置中底部
            el.style.position = 'absolute';
            el.style.left = '50%';
            el.style.top = '-30px';
            el.style.transform = 'translate(-50%, 0)';
            el.classList.add('highlight');
        }
    } else {
        // 🔹 大螢幕模式：全部顯示，只有當前高亮
        for (let i = 0; i < labelEls.length; i++) {
            const el = labelEls[i];
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
            if (i === idx) el.classList.add('highlight');
            else el.classList.remove('highlight');
        }
    }

    // --- 高亮線條繪製 ---
    ctx.save();
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 18;
    ctx.shadowColor = col;
    const g = ctx.createLinearGradient(sx, sy, ex, ey);
    g.addColorStop(0, 'rgba(120,170,255,0.98)');
    g.addColorStop(1, col);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();

    // 淡淡輔助線
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(120,140,220,0.14)';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.restore();

    // 放射線與光點
    ctx.save();
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = col;
    const g2 = ctx.createLinearGradient(cx, cy, ex, ey);
    g2.addColorStop(0, 'rgba(40,50,80,0.15)');
    g2.addColorStop(1, col);
    ctx.strokeStyle = g2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(ex, ey, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}



function drawNodes(){
    for (let i=0;i<N;i++){
        const p = points[i];
        ctx.beginPath();
        ctx.fillStyle = 'rgba(160,170,255,0.06)';
        ctx.arc(p.x, p.y, 10, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(180,190,255,0.18)';
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fill();
    }
}

/* --------------------
 初始化
-------------------- */
function init(){
    resize();
    initParticles();
    updateLabelVisibility();
    lastTs = 0;
    totalElapsed = 0;
    requestAnimationFrame(step);
}
init();

window.addEventListener('resize', () => {
    resize();
    initParticles();
    updateLabelVisibility();
});


// 倒數計時
// 設定目標時間
function startCountdown(box) {
  const deadline = new Date(box.dataset.deadline).getTime();

  const daysEl = box.querySelector(".days");
  const hoursEl = box.querySelector(".hours");
  const minutesEl = box.querySelector(".minutes");
  const secondsEl = box.querySelector(".seconds");

  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance <= 0) {
      clearInterval(timer);
      box.innerHTML = "<p>倒數結束！</p>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }, 1000);
}

// 🔥 啟動所有 time-box
document.querySelectorAll(".time-box").forEach(startCountdown);