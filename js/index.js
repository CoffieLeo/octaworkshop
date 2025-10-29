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
// 不透明背景以提升效能
const ctx = canvas.getContext('2d', { alpha: true });

// DPR 為螢幕像素密度倍率 (for Retina 顯示)
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
    // 設定 DPI 縮放
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2;
    cy = H / 2;
    // 計算八角形各點位置
    computePoints();
    // 重新擺放標籤
    placeLabels();
}
window.addEventListener('resize', resize);

// 八邊形
const N = 8;
// 外圓半徑
let outerR = 260;
let points = [];

// 計算八角形各頂點座標
function computePoints() {
    outerR = Math.min(W, H) * 0.33;
    points = [];
    for (let i = 0; i < N; i++) {
        // 從上方開始，依序轉一圈
        const ang = -Math.PI/2 + (i * 2*Math.PI / N);
        const x = cx + Math.cos(ang) * outerR;
        const y = cy + Math.sin(ang) * outerR;
        points.push({x,y,ang});
    }
}

// 建立每個八角形節點的文字標籤
const labelEls = [];
function createLabels() {
    // 清除舊標籤
    document.querySelectorAll('.label').forEach(el => el.remove());
    labelEls.length = 0;
    for (let i=0;i<N;i++){
        const L = document.createElement('div');
        L.className = 'label';
        // 第5個標籤加特別樣式
        // if (i === 4) L.classList.add('highlight');
        const box = document.createElement('div');
        box.className = 'box';
        // 中文 + 英文（英文以 <br> 強制換行）
        box.innerHTML = `<span class="ch">${labels[i].ch}</span><span class="en">${labels[i].en.replace(" ", "<br>")}</span>`;
        L.appendChild(box);
        // 可選連接小點
        const con = document.createElement('div');
        con.className = 'connector';
        L.appendChild(con);
        root.appendChild(L);
        labelEls.push(L);
    }
}
createLabels();

// 根據計算點座標擺放標籤位置
function placeLabels(){
    if (!points || points.length !== N) computePoints();
    // 標籤與八角形頂點的距離
    const offset = 42;
    for (let i=0;i<N;i++){
        const p = points[i];
        const x = p.x + Math.cos(p.ang) * offset;
        const y = p.y + Math.sin(p.ang) * offset;
        const el = labelEls[i];
        el.style.left = x + 'px';
        el.style.top  = y + 'px';
        // 不同角度的微調，避免標籤擋住節點
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
        const saturation = 70 + Math.random() * 20; // 70–90%
        const lightness = 60 + Math.random() * 20;  // 60–80%

        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,

            // X / Y 方向速度（微小漂浮）
            vx: (Math.random() - 0.5) * 0.05,
            vy: (Math.random() - 0.5) * 0.05,

            // 半徑大小
            r: 0.8 + Math.random() * 1.8,

            // 透明度
            alpha: 0.4 + Math.random() * 0.6,

            // 顏色（HSL 格式 → 柔和感）
            color: `hsl(${hue}, ${saturation}%, ${lightness}%)`
        });
    }
}


/* --------------------
 八角形動畫高亮控制
-------------------- */
let lastTs = 0;

// 每段動畫時間（毫秒）
const segmentDuration = 2000;

// 累計時間，用於決定哪個邊在高亮
let totalElapsed = 0;

// 顏色漸層函式（藍→紫→粉）
function colorAt(t) {
    const a1 = {r: 75, g:130, b:255}; // 藍
    const a2 = {r:140, g:100, b:255}; // 紫
    const a3 = {r:255, g:90, b:180};  // 粉
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

    // 先重設 transform，使用像素尺寸清除整張 canvas，再還原 transform
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    // --------------------------------------------

    // 接著正常繪製粒子 / 八角形 / 高亮
    drawParticles(dt);
    drawOctagonBase();
    drawHighlightSegment(totalElapsed);
    drawNodes();

    requestAnimationFrame(step);
}

/* 繪製粒子移動與連線 */
function drawParticles(dt){
    // 粒子移動
    for (let p of particles){
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // 超出範圍時從另一邊回來（包裹效果）
        if (p.x < -20) p.x = W + 20;
        if (p.x > W+20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H+20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;   // ← 使用每個粒子的顏色
        ctx.globalAlpha = p.alpha; // ← 保留柔和透明度
        ctx.fill();
    }
    ctx.globalAlpha = 1.0; // 畫完後重置透明度
    // 粒子之間的連線與小光點
    ctx.lineWidth = 0.6;
    for (let i=0;i<particles.length;i++){
        const a = particles[i];
        // 畫出小點
        ctx.beginPath();
        ctx.globalAlpha = a.alpha * 0.8;
        ctx.fillStyle = 'rgba(180,190,255,0.06)';
        ctx.arc(a.x, a.y, a.r, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // 畫出與其他粒子的連線
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

/* 畫八角形底線與內層多邊形 + 從中心連線至八角頂點 */
function drawOctagonBase(){
    // 內層三圈淡線
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

    // 外層八角形粗線
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

    // 🎯 從中心畫出八條放射線
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


/* 畫八角形高亮段（動態前進） */
function drawHighlightSegment(elapsed){
    const cycle = Math.floor(elapsed / segmentDuration);
    const idx = cycle % N; // 當前高亮邊索引
    for (let i = 0; i < labelEls.length; i++) {
        if (i === idx) labelEls[i].classList.add('highlight');
        else labelEls[i].classList.remove('highlight');
    }
    const t = (elapsed % segmentDuration) / segmentDuration; // 動畫進度 0~1
    const a = points[idx];
    const b = points[(idx+1)%N];
    const globalT = ((elapsed % (segmentDuration*N)) / (segmentDuration*N));
    const col = colorAt(globalT);
    const sx = a.x, sy = a.y;
    const ex = sx + (b.x - a.x) * t;
    const ey = sy + (b.y - a.y) * t;

    // 發光線條
    ctx.save();
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 18;
    ctx.shadowColor = col;
    const g = ctx.createLinearGradient(sx,sy,ex,ey);
    g.addColorStop(0, 'rgba(120,170,255,0.98)');
    g.addColorStop(1, col);
    ctx.strokeStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx,sy);
    ctx.lineTo(ex,ey);
    ctx.stroke();
    ctx.restore();

    // 淡淡的內層輔助線
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(120,140,220,0.14)';
    ctx.beginPath();
    ctx.moveTo(sx,sy);
    ctx.lineTo(ex,ey);
    ctx.stroke();
    ctx.restore();

    // 從中心放射的亮線與光點
    ctx.save();
    ctx.lineWidth = 2.2;
    ctx.shadowBlur = 14;
    ctx.shadowColor = col;
    const g2 = ctx.createLinearGradient(cx,cy,ex,ey);
    g2.addColorStop(0, 'rgba(40,50,80,0.15)');
    g2.addColorStop(1, col);
    ctx.strokeStyle = g2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(ex,ey);
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(ex,ey,8,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

/* 畫八角形節點 */
function drawNodes(){
    for (let i=0;i<N;i++){
        const p = points[i];
        // 外圓柔光
        ctx.beginPath();
        ctx.fillStyle = 'rgba(160,170,255,0.06)';
        ctx.arc(p.x, p.y, 10, 0, Math.PI*2);
        ctx.fill();
        // 內點
        ctx.beginPath();
        ctx.fillStyle = 'rgba(180,190,255,0.18)';
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fill();
    }
}

/* --------------------
 初始化程序
-------------------- */
function init(){
    resize();         // 調整畫布尺寸
    initParticles();  // 初始化背景粒子
    lastTs = 0;
    totalElapsed = 0;
    requestAnimationFrame(step); // 開始動畫循環
}
init();

// 螢幕變動時重新計算與初始化
window.addEventListener('resize', () => {
    resize();
    initParticles();
});

// 倒數計時
// 設定目標時間
const deadline = new Date("2025-11-15 23:59:59").getTime();

// 每秒更新倒數
const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance <= 0) {
        clearInterval(timer);
        document.querySelector(".time-box").innerHTML = "<p>倒數結束！</p>";
        return;
    }

    // 計算天、時、分、秒
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // 更新畫面
    document.querySelector(".days").textContent = String(days).padStart(2, "0");
    document.querySelector(".hours").textContent = String(hours).padStart(2, "0");
    document.querySelector(".minutes").textContent = String(minutes).padStart(2, "0");
    document.querySelector(".seconds").textContent = String(seconds).padStart(2, "0");
}, 1000);