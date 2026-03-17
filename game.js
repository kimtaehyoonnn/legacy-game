const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let nodes = [], nextId = 0, scale = 0.5; 
let camX, camY, targetCamX, targetCamY, isSliding = false;
let isDragging = false, lastTouchX = 0, lastTouchY = 0, initialPinchDistance = null;
let currentSpeed = 1, monthTimer, isEventActive = false, globalMonths = 0;

function updateLayout() {
    const NODE_SPACING = 280; 
    const PARTNER_SPACING = 200; 
    const LEVEL_HEIGHT = 420; 

    function getSubTreeWidth(node) {
        let myWidth = (node.partner !== null) ? PARTNER_SPACING : 100;
        if (node.children.length === 0) return myWidth;

        let childrenWidth = 0;
        node.children.forEach(childId => {
            let childNode = nodes.find(n => n.id === childId);
            if(childNode) childrenWidth += getSubTreeWidth(childNode);
        });
        childrenWidth += (node.children.length - 1) * NODE_SPACING;
        return Math.max(myWidth, childrenWidth);
    }

    function setPositions(node, centerX, level) {
        node.targetY = level * LEVEL_HEIGHT;
        if (node.partner !== null) {
            const partnerNode = nodes.find(n => n.id === node.partner);
            if (partnerNode) {
                partnerNode.targetY = level * LEVEL_HEIGHT;
                node.targetX = centerX - (PARTNER_SPACING / 2);
                partnerNode.targetX = centerX + (PARTNER_SPACING / 2);
            }
        } else {
            node.targetX = centerX;
        }

        if (node.children.length > 0) {
            const childNodes = node.children.map(id => nodes.find(n => n.id === id)).filter(n => n);
            const childWidths = childNodes.map(c => getSubTreeWidth(c));
            const totalWidth = childWidths.reduce((sum, w) => sum + w, 0) + (childNodes.length - 1) * NODE_SPACING;
            
            let startX = centerX - totalWidth / 2;
            childNodes.forEach((child, index) => {
                let w = childWidths[index];
                setPositions(child, startX + w / 2, level + 1);
                startX += w + NODE_SPACING;
            });
        }
    }

    if (nodes.length > 0) setPositions(nodes[0], 0, 0); 
}

function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    nodes = []; nextId = 0; globalMonths = 0;
    camX = canvas.width / 2; camY = 150;
    
    const founder = new PersonNode("1대 가주", 'M', 0, 0, 1, 19, [], true, true, false); 
    founder.traits = { app: getRandomTrait('app'), per: getRandomTrait('per'), val: getRandomTrait('val'), hlt: getRandomTrait('hlt') };
    founder.visuals = getRandomVisuals();
    nodes.push(founder);
    
    updateUI(); 
    setSpeed(1, document.querySelectorAll('.speed-btn')[1]);
}

function handleDisease(n) {
    const hltTier = n.traits.hlt.tier;
    const getRates = (tier) => {
        if(tier === 'SSR') return { onset: 0.01, recover: 0.8, worsen: 0.05 };
        if(tier === 'SR') return { onset: 0.05, recover: 0.5, worsen: 0.1 };
        if(tier === 'R') return { onset: 0.1, recover: 0.3, worsen: 0.2 };
        return { onset: 0.25, recover: 0.1, worsen: 0.4 }; 
    };
    const rates = getRates(hltTier);
    if (!n.disease) {
        if (Math.random() < rates.onset) n.disease = '감기';
    } else {
        const rand = Math.random();
        if (rand < rates.recover) n.disease = null; 
        else if (rand < rates.recover + rates.worsen) {
            if (n.disease === '감기') n.disease = '몸살';
            else if (n.disease === '몸살') n.disease = '혼절';
            else if (n.disease === '혼절') { n.isAlive = false; n.disease = '병사'; }
        }
    }
}

function startTimers() {
    if(monthTimer) clearInterval(monthTimer);
    if(currentSpeed === 0) return; 

    monthTimer = setInterval(() => {
        if(isEventActive) return;
        globalMonths++;
        for (let n of nodes) {
            if (!n.isAlive) continue;
            if (globalMonths % 12 === 0) {
                n.age++;
                handleDisease(n);
                if (!n.isAlive) { if (n.isHead) { triggerSuccession(n); break; } updateUI(); continue; }
                if (n.age > 80 && Math.random() < 0.1) { n.isAlive = false; if (n.isHead) { triggerSuccession(n); break; } updateUI(); continue; }
            }
            if (n.isMain && !n.isSpouse) {
                if (n.age >= 20 && !n.isMarried && Math.random() < 0.1) { triggerMarriage(n); break; }
                if (n.isMarried && n.children.length < 3 && Math.random() < 0.03) {
                    let wife = n.gender === 'F' ? n : nodes.find(s => s.id === n.partner);
                    if (wife && wife.isAlive && wife.age < wife.menopauseAge) { triggerBirth(n); break; }
                }
            }
        }
        document.getElementById('year-ui').innerText = `${Math.floor(globalMonths/12)}년째 가문 진행 중`;
    }, 1000 / currentSpeed);
}

function triggerSuccession(deceasedHead) {
    isEventActive = true;
    const livingChildren = deceasedHead.children.map(id => nodes.find(n => n.id === id)).filter(n => n && n.isAlive);
    if (livingChildren.length === 0) {
        document.getElementById('e-title').innerText = "🪦 가문의 몰락";
        document.getElementById('e-desc').innerText = "가주가 후계자 없이 사망하여 가문의 대가 끊겼습니다.";
        document.getElementById('choices-container').innerHTML = `<button class="choice-btn" onclick="location.reload()">새로운 가문 창설하기</button>`;
        document.getElementById('event-modal').style.display = 'block'; return;
    }
    const container = document.getElementById('choices-container');
    container.innerHTML = '';
    document.getElementById('e-title').innerText = "👑 후계자 지명";
    document.getElementById('e-desc').innerText = `가주가 사망했습니다. 가문을 이을 다음 가주를 선택하세요.`;
    livingChildren.forEach((child) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `
            <div style="font-weight:bold; margin-bottom:5px;">${child.name} (${child.age}세)</div>
            <div class="trait-box">
                <span style="color:${getTierColor(child.traits.app.tier)}"><b>[외모]</b> ${child.traits.app.name}</span><br>
                <span style="color:${getTierColor(child.traits.per.tier)}"><b>[성격]</b> ${child.traits.per.name}</span><br>
                <span style="color:${getTierColor(child.traits.val.tier)}"><b>[가치]</b> ${child.traits.val.name}</span><br>
                <span style="color:${getTierColor(child.traits.hlt.tier)}"><b>[건강]</b> ${child.traits.hlt.name}</span>
            </div>`;
        btn.onclick = () => {
            deceasedHead.children.forEach(cId => { if (cId !== child.id) markAsSideBranch(cId); });
            child.isHead = true; 
            targetCamX = (canvas.width / 2) - (child.targetX * scale); targetCamY = (canvas.height / 2) - (child.targetY * scale); isSliding = true;
            updateUI(); closeEvent();
        };
        container.appendChild(btn);
    });
    document.getElementById('event-modal').style.display = 'block';
}

function triggerMarriage(p) {
    isEventActive = true;
    const container = document.getElementById('choices-container');
    container.innerHTML = '';
    document.getElementById('e-title').innerText = "💍 혼담 발생";
    document.getElementById('e-desc').innerText = `${p.name}의 배우자를 신중히 선택하세요.`;
    for(let i=0; i<3; i++) {
        const c_app = getRandomTrait('app'), c_per = getRandomTrait('per'), c_val = getRandomTrait('val'), c_hlt = getRandomTrait('hlt');
        const c_visuals = getRandomVisuals();
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `
            <div style="font-weight:bold; margin-bottom:5px;">후보 ${i+1}</div>
            <div class="trait-box">
                <span style="color:${getTierColor(c_app.tier)}"><b>[외모]</b> ${c_app.name}</span><br>
                <span style="color:${getTierColor(c_per.tier)}"><b>[성격]</b> ${c_per.name}</span><br>
                <span style="color:${getTierColor(c_val.tier)}"><b>[가치]</b> ${c_val.name}</span><br>
                <span style="color:${getTierColor(c_hlt.tier)}"><b>[건강]</b> ${c_hlt.name}</span>
            </div>`;
        btn.onclick = () => {
            const partner = new PersonNode(NAMES[p.gender==='M'?'F':'M'][Math.floor(Math.random()*10)], p.gender==='M'?'F':'M', p.x, p.y, p.level, p.age, [], false, p.isMain, true);
            partner.isMarried = true; p.isMarried = true; p.partner = partner.id; partner.partner = p.id;
            partner.traits = { app: c_app, per: c_per, val: c_val, hlt: c_hlt };
            partner.visuals = c_visuals;
            nodes.push(partner); 
            updateLayout(); updateUI(); closeEvent();
        };
        container.appendChild(btn);
    }
    document.getElementById('event-modal').style.display = 'block';
}

function inheritVisuals(p1Visuals, p2Visuals) {
    const childVisuals = {};
    for (const part in p1Visuals) {
        childVisuals[part] = (Math.random() < 0.5) ? p1Visuals[part] : p2Visuals[part];
    }
    return childVisuals;
}

function triggerBirth(p) {
    const partner = nodes.find(n => n.id === p.partner);
    if (!partner || !partner.isAlive) return;
    isEventActive = true;
    const gender = Math.random() > 0.5 ? 'M' : 'F';
    const childName = NAMES[gender][Math.floor(Math.random()*10)];
    
    const inherit = (cat) => {
        const r = Math.random();
        if (r < 0.45) return p.traits[cat]; else if (r < 0.90) return partner.traits[cat]; else return getRandomTrait(cat);
    };

    const c_app = inherit('app'), c_per = inherit('per'), c_val = inherit('val'), c_hlt = inherit('hlt');
    const c_visuals = inheritVisuals(p.visuals, partner.visuals);

    document.getElementById('e-title').innerText = "👶 생명 탄생";
    document.getElementById('e-desc').innerHTML = `가문에 <b>${childName}</b>이(가) 태어났습니다!`;
    const container = document.getElementById('choices-container');
    container.innerHTML = `
        <div class="trait-box" style="text-align:left; margin-bottom:15px;">
            <span style="color:${getTierColor(c_app.tier)}"><b>[외모]</b> ${c_app.name}</span><br>
            <span style="color:${getTierColor(c_per.tier)}"><b>[성격]</b> ${c_per.name}</span><br>
            <span style="color:${getTierColor(c_val.tier)}"><b>[가치관]</b> ${c_val.name}</span><br>
            <span style="color:${getTierColor(c_hlt.tier)}"><b>[건강]</b> ${c_hlt.name}</span>
        </div>
        <button class="choice-btn" style="text-align:center"><b>가계도에 추가</b></button>`;
    container.querySelector('button').onclick = () => {
        const midX = (p.x + partner.x) / 2;
        const child = new PersonNode(childName, gender, midX, p.y + 50, p.level + 1, 0, [p.id, p.partner], false, p.isMain, false);
        child.traits = { app: c_app, per: c_per, val: c_val, hlt: c_hlt };
        child.visuals = c_visuals;
        p.children.push(child.id); nodes.push(child); updateLayout(); 
        targetCamX = (canvas.width / 2) - (child.targetX * scale); targetCamY = (canvas.height / 2) - (child.targetY * scale); isSliding = true;
        updateUI(); closeEvent();
    };
    document.getElementById('event-modal').style.display = 'block';
}

function markAsSideBranch(nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    if(node) { node.isMain = false; if(node.partner !== null) { const pNode = nodes.find(n => n.id === node.partner); if(pNode) pNode.isMain = false; } node.children.forEach(c => markAsSideBranch(c)); }
}

function updateUI() { document.getElementById('pop-ui').innerText = `인구: ${nodes.filter(n=>n.isAlive).length}명`; }
function closeEvent() { document.getElementById('event-modal').style.display = 'none'; isEventActive = false; }
function setSpeed(s, btn) { currentSpeed = s; document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); startTimers(); }
function updateCamera() { if (isSliding) { camX += (targetCamX - camX) * 0.1; camY += (targetCamY - camY) * 0.1; if (Math.abs(targetCamX - camX) < 1) isSliding = false; } }

window.addEventListener('mousedown', () => isDragging = true);
window.addEventListener('mousemove', e => { if (isDragging) { camX += e.movementX; camY += e.movementY; isSliding = false; } });
window.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) { initialPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); isDragging = false; } else { isDragging = true; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; } }, {passive: false});
canvas.addEventListener('touchmove', e => { e.preventDefault(); if (e.touches.length === 2) { const currentDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (initialPinchDistance) { scale = Math.max(0.2, Math.min(2, scale + (currentDistance - initialPinchDistance) * 0.005)); initialPinchDistance = currentDistance; } } else if (isDragging && e.touches.length === 1) { camX += e.touches[0].clientX - lastTouchX; camY += e.touches[0].clientY - lastTouchY; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; isSliding = false; } }, {passive: false});
canvas.addEventListener('touchend', e => { if (e.touches.length < 2) initialPinchDistance = null; if (e.touches.length === 0) isDragging = false; });
canvas.addEventListener('wheel', e => { e.preventDefault(); scale = Math.max(0.2, Math.min(2, scale + e.deltaY * -0.001)); }, { passive: false });

function animate() {
    updateCamera();
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.save();
    ctx.translate(camX, camY);
    ctx.scale(scale, scale);
    
    ctx.lineWidth = 3;
    nodes.forEach(n => {
        if (!n.isMain || !n.isAlive) ctx.strokeStyle = "rgba(203, 213, 224, 0.3)"; else ctx.strokeStyle = "#cbd5e0";
        if(n.parents.length) {
            const p1 = nodes.find(node => node.id === n.parents[0]);
            if(p1) {
                const partner = nodes.find(node => node.id === p1.partner);
                const midX = partner ? (p1.x + partner.x) / 2 : p1.x; const midY = partner ? (p1.y + partner.y) / 2 : p1.y;
                ctx.beginPath(); ctx.moveTo(n.x, n.y - n.radius); ctx.bezierCurveTo(n.x, n.y - 180, midX, midY + 180, midX, midY); ctx.stroke(); 
            }
        }
        if(n.partner !== null && n.gender === 'M') {
            const p = nodes.find(node => node.id === n.partner);
            if(p) { ctx.beginPath(); ctx.moveTo(n.x + n.radius, n.y); ctx.lineTo(p.x - p.radius, p.y); ctx.stroke(); }
        }
    });

    nodes.forEach(n => n.draw(ctx, scale));
    ctx.restore();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initGame(); });
initGame();
animate();