const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 사운드 관리
const SOUNDS = {
    bgmMain: document.getElementById('bgm-main'),
};
let savedVolume = 0.4;
SOUNDS.bgmMain.volume = savedVolume;

function startBgm() {
    SOUNDS.bgmMain.play().catch(() => {});
    document.removeEventListener('click', startBgm);
    document.removeEventListener('touchstart', startBgm);
}
document.addEventListener('click', startBgm);
document.addEventListener('touchstart', startBgm);

function setVolume(val) {
    const v = Math.max(0, Math.min(100, Number(val))) / 100;
    SOUNDS.bgmMain.volume = v;
    SOUNDS.bgmMain.muted = false;
    savedVolume = v;
    document.getElementById('mute-btn').textContent = v === 0 ? '🔇' : '🔊';
}

function toggleMute() {
    const isMuted = !SOUNDS.bgmMain.muted;
    SOUNDS.bgmMain.muted = isMuted;
    const btn = document.getElementById('mute-btn');
    const slider = document.getElementById('volume-slider');
    if (isMuted) {
        btn.textContent = '🔇';
        slider.value = 0;
    } else {
        btn.textContent = '🔊';
        slider.value = Math.round(savedVolume * 100);
    }
}

let nodes = [], nextId = 0, scale = 0.5;
const nodeMap = new Map(); 
let camX, camY, targetCamX, targetCamY, isSliding = false;
let isDragging = false, lastTouchX = 0, lastTouchY = 0, initialPinchDistance = null;
let currentSpeed = 1, monthTimer, isEventActive = false, globalMonths = 0;
let savedCamX, savedCamY, savedScale;
let targetScale = null;
let focusTarget = null;

function focusOnPerson(person) {
    savedCamX = camX; savedCamY = camY; savedScale = scale;
    targetScale = 1.2;
    focusTarget = person;
    targetCamX = (canvas.width / 2) - (person.x * scale);
    targetCamY = (canvas.height / 2) - (person.y * scale);
    isSliding = true;
    // 캐릭터 기준 모달 위치 계산 (캐릭터가 화면 중앙에 오므로 우측에 배치)
    const modal = document.getElementById('event-modal');
    const charScreenX = canvas.width / 2;
    const charScreenY = canvas.height / 2;
    const offset = 120;
    modal.style.left = (charScreenX + offset) + 'px';
    modal.style.top = charScreenY + 'px';
    modal.style.transform = 'translateY(-50%)';
}
function restoreCamera() {
    if (savedScale != null) {
        targetScale = savedScale;
        targetCamX = savedCamX; targetCamY = savedCamY;
        isSliding = true;
        savedScale = null;
    }
}
let yearlyEventQueue = [];
let GENERAL_EVENT_DEFINITIONS = [];
const INITIAL_FAMILY_ASSET_KRW = 10_000_000;
const BIRTH_DECISION_COOLDOWN_MONTHS = 6;
const BIRTH_SUCCESS_COOLDOWN_MONTHS = 12;
let familyAssetKrw = INITIAL_FAMILY_ASSET_KRW;
let lastMonthlyCashflowKrw = 0;

// 플로팅 텍스트 (월급 연출)
const floatingTexts = [];

function setPersonJob(person, jobCode, assignedMonth = globalMonths) {
    if (!person) return;

    const jobDef = JOB_DEFINITIONS[jobCode];
    if (!jobDef) {
        console.warn('[CAREER] 알 수 없는 직업 코드:', jobCode);
        return;
    }

    person.jobCode = jobCode;
    person.jobName = jobDef.name;
    person.jobMonthlyIncomeKrw = jobDef.monthlyIncomeKrw;
    person.jobAssignedMonth = Number.isFinite(assignedMonth) ? Math.floor(assignedMonth) : globalMonths;
    person.careerStage = 'selected';
}

function retirePersonJob(person) {
    if (!person) return;
    person.jobCode = null;
    person.jobName = null;
    person.jobMonthlyIncomeKrw = 0;
    person.jobAssignedMonth = null;
    person.careerStage = 'retired';
}

function getRandomJobCodeFromAllJobs() {
    if (!ALL_JOB_CODES.length) return null;
    return ALL_JOB_CODES[Math.floor(Math.random() * ALL_JOB_CODES.length)];
}

function assignRandomCareerForLateJoiner(person) {
    if (!person || !person.isAlive || !person.isMain) return;

    if (person.age >= 65) {
        retirePersonJob(person);
        return;
    }

    if (person.age < 20 || person.careerStage !== 'none') return;

    const randomJobCode = getRandomJobCodeFromAllJobs();
    if (!randomJobCode) return;

    setPersonJob(person, randomJobCode, globalMonths);
}

function enqueueYearlyEvents() {
    if (!GENERAL_EVENT_DEFINITIONS.length) return;

    const gameCtx = buildGameContext();

    const candidates = nodes
        .filter(n => n.isAlive && n.isMain)
        .sort((a, b) => a.id - b.id);

    for (const person of candidates) {
        const events = collectEligibleEvents(person, gameCtx);
        events.forEach(eventDef => {
            yearlyEventQueue.push({
                personId: person.id,
                eventDef
            });
        });
    }
}

function openNextQueuedEvent() {
    while (yearlyEventQueue.length > 0) {
        const queued = yearlyEventQueue.shift();
        const person = nodeMap.get(queued.personId);
        if (!person || !person.isAlive || !person.isMain) continue;

        if (!queued.eventDef) continue;
        ensureEventState(person);
        if (person.eventState.firedCodes.has(queued.eventDef.code)) continue;

        const container = document.getElementById('choices-container');
        container.innerHTML = '';

        document.getElementById('e-title').innerText = "인생 이벤트";
        document.getElementById('e-desc').innerText = `${person.name}(${person.age}세): ${queued.eventDef.text}`;

        const choices = (queued.eventDef.choices || []).slice(0, 4);
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.onclick = () => {
                applyEventChoice(person, queued.eventDef, choice.id, buildGameContext());
                closeEvent();
            };
            container.appendChild(btn);
        });

        isEventActive = true;
        focusOnPerson(person);
        document.getElementById('event-modal').style.display = 'block';
        return true;
    }

    return false;
}

function getRandomVisuals(gender = 'M') {
    const getRandomAsset = (assetType) => {
        if (assetType === 'face') {
            return FACE_CONFIG.types[Math.floor(Math.random() * FACE_CONFIG.count)];
        }
        const codes = loadedAssetCodes[assetType];
        if (!codes || codes.length === 0) return null;
        return codes[Math.floor(Math.random() * codes.length)];
    };

    const fhPool = gender === 'M' ? loadedAssetCodes.mFrontHair : loadedAssetCodes.fFrontHair;
    const frontHair = fhPool.length ? fhPool[Math.floor(Math.random() * fhPool.length)] : null;
    return {
        eyes:     getRandomAsset('eyes'),
        nose:     getRandomAsset('nose'),
        mouth:    getRandomAsset('mouth'),
        face:     getRandomAsset('face'),
        frontHair,
        clothes:  getRandomAsset('clothes'),
        shoulder: getRandomAsset('shoulder')
    };
}

function updateLayout() {
    const NODE_SPACING = 300; 
    const PARTNER_SPACING = 280; 
    const LEVEL_HEIGHT = 450; 

    function getSubTreeWidth(node) {
        let myWidth = (node.partner !== null) ? PARTNER_SPACING : 100;
        if (node.children.length === 0) return myWidth;

        let childrenWidth = 0;
        node.children.forEach(childId => {
            let childNode = nodeMap.get(childId);
            if(childNode) childrenWidth += getSubTreeWidth(childNode);
        });
        childrenWidth += (node.children.length - 1) * NODE_SPACING;
        return Math.max(myWidth, childrenWidth);
    }

    function setPositions(node, centerX, level) {
        node.targetY = level * LEVEL_HEIGHT;
        if (node.partner !== null) {
            const partnerNode = nodeMap.get(node.partner);
            if (partnerNode) {
                partnerNode.targetY = level * LEVEL_HEIGHT;
                node.targetX = centerX - (PARTNER_SPACING / 2);
                partnerNode.targetX = centerX + (PARTNER_SPACING / 2);
            }
        } else {
            node.targetX = centerX;
        }

        if (node.children.length > 0) {
            const childNodes = node.children.map(id => nodeMap.get(id)).filter(n => n);
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
    nodes = []; nodeMap.clear(); nextId = 0; globalMonths = 0;
    familyAssetKrw = INITIAL_FAMILY_ASSET_KRW;
    lastMonthlyCashflowKrw = 0;
    yearlyEventQueue = [];
    camX = canvas.width / 2; camY = 150;
    isEventActive = false; // 이벤트 잠금 초기화
    
    // year-ui 초기값 즉시 업데이트
    document.getElementById('year-ui').innerText = '0년째 가문 진행 중';
    
    // founder를 화면 중앙에 명시적으로 배치
    const founderX = 0;
    const founderY = 0;
    const founder = new PersonNode("1대 가주", 'M', founderX, founderY, 0, 19, [], true, true, false); 
    founder.traits = { app: getRandomTrait('app'), per: getRandomTrait('per'), val: getRandomTrait('val'), hlt: getRandomTrait('hlt') };
    founder.visuals = getRandomVisuals('M');
    nodes.push(founder);
    nodeMap.set(founder.id, founder);
    
    // 레이아웃 업데이트로 targetX, targetY 설정
    updateLayout();
    
    updateUI(); 
    // 속도 버튼 선택 후 타이머 시작
    const speedBtn = document.querySelectorAll('.speed-btn')[1];
    if (speedBtn) setSpeed(1, speedBtn);
    else console.error("[ERROR] Speed button not found!");
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
    
    console.log("[startTimers] 타이머 시작, currentSpeed:", currentSpeed);

    monthTimer = setInterval(() => {
        if(isEventActive) return;
        globalMonths++;
        settleMonthlyFamilyAsset();
        updateUI();

        const isYearlyTick = globalMonths % 12 === 0;
        let successionTriggered = false;

        if (isYearlyTick) {
            for (let n of nodes) {
                if (!n.isAlive) continue;

                n.age++;
                handleDisease(n);
                if (!n.isAlive) {
                    if (n.isHead) {
                        triggerSuccession(n);
                        successionTriggered = true;
                        break;
                    }
                    updateUI();
                    continue;
                }

                if (n.age > 80 && Math.random() < 0.1) {
                    n.isAlive = false;
                    if (n.isHead) {
                        triggerSuccession(n);
                        successionTriggered = true;
                        break;
                    }
                    updateUI();
                }
            }

            if (successionTriggered) {
                const yearText = `${Math.floor(globalMonths/12)}년째 가문 진행 중`;
                document.getElementById('year-ui').innerText = yearText;
                return;
            }

            for (let n of nodes) {
                if (!n.isAlive || !n.isMain) continue;
                if (n.age >= 65) retirePersonJob(n);
            }
            enqueueYearlyEvents();
            if (openNextQueuedEvent()) {
                const yearText = `${Math.floor(globalMonths/12)}년째 가문 진행 중`;
                document.getElementById('year-ui').innerText = yearText;
                return;
            }
        }

        for (let n of nodes) {
            if (!n.isAlive) continue;
            if (n.isMain && !n.isSpouse) {
                if (n.age >= 20 && !n.isMarried && Math.random() < 0.1) { triggerMarriage(n); break; }
                if (n.isMarried && n.children.length < 3 && Math.random() < 0.03) {
                    let wife = n.gender === 'F' ? n : nodeMap.get(n.partner);
                    const isBirthDecisionCooldown = globalMonths < getBirthDecisionCooldownMonth(n)
                        || globalMonths < getBirthDecisionCooldownMonth(wife);
                    if (!isBirthDecisionCooldown && wife && wife.isAlive && wife.age < wife.menopauseAge) {
                        triggerBirthDecision(n);
                        break;
                    }
                }
            }
        }
        const yearText = `${Math.floor(globalMonths/12)}년째 가문 진행 중`;
        document.getElementById('year-ui').innerText = yearText;
    }, 2000 / currentSpeed);
}

function triggerSuccession(deceasedHead) {
    isEventActive = true;
    focusOnPerson(deceasedHead);
    const livingChildren = deceasedHead.children.map(id => nodeMap.get(id)).filter(n => n && n.isAlive);
    if (livingChildren.length === 0) {
        document.getElementById('e-title').innerText = "가문의 몰락";
        document.getElementById('e-desc').innerText = "가주가 후계자 없이 사망하여 가문의 대가 끊겼습니다.";
        document.getElementById('choices-container').innerHTML = `<button class="choice-btn" onclick="location.reload()">새로운 가문 창설하기</button>`;
        document.getElementById('event-modal').style.display = 'block'; return;
    }
    const container = document.getElementById('choices-container');
    container.innerHTML = '';
    document.getElementById('e-title').innerText = "후계자 지명";
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
            const livingChildCount = Math.max(1, livingChildren.length);
            familyAssetKrw = Math.floor(familyAssetKrw / livingChildCount);
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
    focusOnPerson(p);
    document.getElementById('e-title').innerText = "혼담 발생";
    document.getElementById('e-desc').innerText = `${p.name}의 배우자를 신중히 선택하세요.`;
    const partnerGender = p.gender === 'M' ? 'F' : 'M';

    const getBackHairCodeFromFrontHair = (frontHairCode) => {
        if (!frontHairCode) return null;
        if (frontHairCode.startsWith('mFH')) return `mBH${frontHairCode.slice(3)}`;
        if (frontHairCode.startsWith('fFH')) return `fBH${frontHairCode.slice(3)}`;
        return null;
    };

    const drawCandidatePreview = (canvasEl, visuals) => {
        const previewCtx = canvasEl.getContext('2d');
        if (!previewCtx) return;

        const cssW = 96;
        const cssH = 132;
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const targetW = Math.round(cssW * dpr);
        const targetH = Math.round(cssH * dpr);

        if (canvasEl.width !== targetW || canvasEl.height !== targetH) {
            canvasEl.width = targetW;
            canvasEl.height = targetH;
            canvasEl.style.width = `${cssW}px`;
            canvasEl.style.height = `${cssH}px`;
        }

        previewCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        previewCtx.imageSmoothingEnabled = true;
        previewCtx.imageSmoothingQuality = 'high';
        previewCtx.clearRect(0, 0, cssW, cssH);

        const imgHeight = Math.round(cssH * 0.92);
        const imgWidth = Math.round(imgHeight * (512 / 710));
        const dx = Math.round((cssW - imgWidth) / 2);
        const dy = Math.round((cssH - imgHeight) / 2 + 2);

        const bhCode = getBackHairCodeFromFrontHair(visuals.frontHair);
        if (bhCode) {
            const bhImg = characterAssets.backHair[bhCode];
            if (bhImg && bhImg.complete && bhImg.naturalWidth) previewCtx.drawImage(bhImg, dx, dy, imgWidth, imgHeight);
        }

        const shoulderImg = characterAssets.shoulder[visuals.shoulder || 'SA'];
        if (shoulderImg && shoulderImg.complete && shoulderImg.naturalWidth) previewCtx.drawImage(shoulderImg, dx, dy, imgWidth, imgHeight);

        const clothesImg = characterAssets.clothes[visuals.clothes || 'CA'];
        if (clothesImg && clothesImg.complete && clothesImg.naturalWidth) previewCtx.drawImage(clothesImg, dx, dy, imgWidth, imgHeight);

        const faceImg = characterAssets.face[visuals.face || 'Fa'];
        if (faceImg && faceImg.complete && faceImg.naturalWidth) previewCtx.drawImage(faceImg, dx, dy, imgWidth, imgHeight);

        const mouthImg = characterAssets.mouth[visuals.mouth || 'MA'];
        if (mouthImg && mouthImg.complete && mouthImg.naturalWidth) previewCtx.drawImage(mouthImg, dx, dy, imgWidth, imgHeight);

        const noseImg = characterAssets.nose[visuals.nose || 'NA'];
        if (noseImg && noseImg.complete && noseImg.naturalWidth) previewCtx.drawImage(noseImg, dx, dy, imgWidth, imgHeight);

        const eyesImg = characterAssets.eyes[visuals.eyes || 'EA'];
        if (eyesImg && eyesImg.complete && eyesImg.naturalWidth) previewCtx.drawImage(eyesImg, dx, dy, imgWidth, imgHeight);

        const fhImg = characterAssets.frontHair[visuals.frontHair || ''];
        if (fhImg && fhImg.complete && fhImg.naturalWidth) previewCtx.drawImage(fhImg, dx, dy, imgWidth, imgHeight);
    };

    for(let i=0; i<3; i++) {
        const c_app = getRandomTrait('app'), c_per = getRandomTrait('per'), c_val = getRandomTrait('val'), c_hlt = getRandomTrait('hlt');
        const c_visuals = getRandomVisuals(partnerGender);
        const btn = document.createElement('button');
        btn.className = 'choice-btn marriage-choice-btn';

        const layout = document.createElement('div');
        layout.className = 'marriage-choice-layout';

        const previewWrap = document.createElement('div');
        previewWrap.className = 'marriage-candidate-preview';
        const previewCanvas = document.createElement('canvas');
        previewCanvas.className = 'marriage-candidate-canvas';
        drawCandidatePreview(previewCanvas, c_visuals);
        previewWrap.appendChild(previewCanvas);

        const info = document.createElement('div');
        info.className = 'marriage-choice-info';
        info.innerHTML = `
            <div class="marriage-choice-title">후보 ${i + 1}</div>
            <div class="trait-box">
                <span style="color:${getTierColor(c_app.tier)}"><b>[외모]</b> ${c_app.name}</span><br>
                <span style="color:${getTierColor(c_per.tier)}"><b>[성격]</b> ${c_per.name}</span><br>
                <span style="color:${getTierColor(c_val.tier)}"><b>[가치]</b> ${c_val.name}</span><br>
                <span style="color:${getTierColor(c_hlt.tier)}"><b>[건강]</b> ${c_hlt.name}</span>
            </div>`;

        layout.appendChild(previewWrap);
        layout.appendChild(info);
        btn.appendChild(layout);

        btn.onclick = () => {
            const partner = new PersonNode(NAMES[p.gender==='M'?'F':'M'][Math.floor(Math.random()*10)], p.gender==='M'?'F':'M', p.x, p.y, p.level, p.age, [], false, p.isMain, true);
            partner.isMarried = true; p.isMarried = true; p.partner = partner.id; partner.partner = p.id;
            partner.traits = { app: c_app, per: c_per, val: c_val, hlt: c_hlt };
            partner.visuals = c_visuals;
            assignRandomCareerForLateJoiner(partner);
            nodes.push(partner);
            nodeMap.set(partner.id, partner);
            updateLayout(); updateUI(); closeEvent();
        };
        container.appendChild(btn);
    }
    document.getElementById('event-modal').style.display = 'block';
}

function inheritVisuals(p1Visuals, p2Visuals, gender = 'M') {
    const childVisuals = {};
    for (const part in p1Visuals) {
        if (part === 'clothes' || part === 'frontHair') continue; // 옷/머리는 성별 기반 독립 배정
        childVisuals[part] = (Math.random() < 0.5) ? p1Visuals[part] : p2Visuals[part];
    }
    // 앞머리: 자녀 성별 풀에서 랜덤
    const fhPool = gender === 'M' ? loadedAssetCodes.mFrontHair : loadedAssetCodes.fFrontHair;
    childVisuals.frontHair = fhPool.length ? fhPool[Math.floor(Math.random() * fhPool.length)] : null;
    // 옷과 어깨는 loadedAssetCodes 기반 랜덤 독립 배정
    const clothesCodes = loadedAssetCodes.clothes;
    childVisuals.clothes = clothesCodes.length ? clothesCodes[Math.floor(Math.random() * clothesCodes.length)] : 'CA';
    const shoulderCodes = loadedAssetCodes.shoulder;
    childVisuals.shoulder = shoulderCodes.length ? shoulderCodes[Math.floor(Math.random() * shoulderCodes.length)] : 'SA';
    return childVisuals;
}

function triggerBirth(p) {
    const partner = nodeMap.get(p.partner);
    if (!partner || !partner.isAlive) return;
    isEventActive = true;
    const gender = Math.random() > 0.5 ? 'M' : 'F';
    const childName = NAMES[gender][Math.floor(Math.random()*10)];
    
    const inherit = (cat) => {
        const r = Math.random();
        if (r < 0.45) return p.traits[cat]; else if (r < 0.90) return partner.traits[cat]; else return getRandomTrait(cat);
    };

    const c_app = inherit('app'), c_per = inherit('per'), c_val = inherit('val'), c_hlt = inherit('hlt');
    const c_visuals = inheritVisuals(p.visuals, partner.visuals, gender);

    focusOnPerson(p);
    document.getElementById('e-title').innerText = "생명 탄생";
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
        p.children.push(child.id); nodes.push(child); nodeMap.set(child.id, child); updateLayout();
        targetCamX = (canvas.width / 2) - (child.targetX * scale); targetCamY = (canvas.height / 2) - (child.targetY * scale); isSliding = true;
        updateUI(); closeEvent();
    };
    document.getElementById('event-modal').style.display = 'block';
}

function getBirthDecisionCooldownMonth(person) {
    if (!person || !Number.isFinite(person.birthDecisionCooldownUntilMonth)) return 0;
    return Math.max(0, Math.floor(person.birthDecisionCooldownUntilMonth));
}

function setBirthDecisionCooldown(personA, personB, cooldownMonths = BIRTH_DECISION_COOLDOWN_MONTHS) {
    const untilMonth = globalMonths + Math.max(1, Math.floor(cooldownMonths));
    if (personA) personA.birthDecisionCooldownUntilMonth = untilMonth;
    if (personB) personB.birthDecisionCooldownUntilMonth = untilMonth;
}

function triggerBirthDecision(p) {
    const partner = nodeMap.get(p.partner);
    if (!partner || !partner.isAlive) return;

    isEventActive = true;
    focusOnPerson(p);

    document.getElementById('e-title').innerText = '출산 결정';
    document.getElementById('e-desc').innerText = `${p.name} 부부에게 출산 기회가 왔습니다. 지금 출산을 진행할까요?`;

    const container = document.getElementById('choices-container');
    container.innerHTML = '';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'choice-btn';
    yesBtn.textContent = '출산을 진행한다';
    yesBtn.onclick = () => {
        setBirthDecisionCooldown(p, partner, BIRTH_SUCCESS_COOLDOWN_MONTHS);
        triggerBirth(p);
    };

    const noBtn = document.createElement('button');
    noBtn.className = 'choice-btn';
    noBtn.textContent = '이번에는 출산하지 않는다';
    noBtn.onclick = () => {
        setBirthDecisionCooldown(p, partner);
        closeEvent();
    };

    container.appendChild(yesBtn);
    container.appendChild(noBtn);
    document.getElementById('event-modal').style.display = 'block';
}

function markAsSideBranch(nodeId) {
    const node = nodeMap.get(nodeId);
    if(node) { node.isMain = false; if(node.partner !== null) { const pNode = nodeMap.get(node.partner); if(pNode) pNode.isMain = false; } node.children.forEach(c => markAsSideBranch(c)); }
}

function updateUI() {
    const popElement = document.getElementById('pop-ui');
    if (popElement) {
        popElement.innerText = `인구: ${nodes.filter(n => n.isAlive).length}명`;
    }

    const assetElement = document.getElementById('asset-ui');
    if (assetElement) {
        assetElement.innerText = `자산: ${formatKoreanMoneyUnits(familyAssetKrw)}`;
    }
    const totalAssetEl = document.getElementById('total-asset-ui');
    if (totalAssetEl) {
        totalAssetEl.innerText = `총 자산: ${formatKoreanMoneyUnits(familyAssetKrw)}`;
        totalAssetEl.style.color = familyAssetKrw >= 0 ? '#27ae60' : '#e74c3c';
    }
}
// 관리자: 자동선택
let autoChoiceEnabled = false;
function toggleAutoChoice() {
    autoChoiceEnabled = !autoChoiceEnabled;
    const btn = document.getElementById('auto-choice-btn');
    btn.textContent = `🤖 자동선택: ${autoChoiceEnabled ? 'ON' : 'OFF'}`;
    btn.style.background = autoChoiceEnabled ? '#00b894' : '#636e72';
    if (autoChoiceEnabled && isEventActive) autoClickChoice();
}
function autoClickChoice() {
    const btns = document.querySelectorAll('#choices-container .choice-btn');
    if (!btns.length) return;
    // 랜덤 선택 (첫 번째는 항상 같아서 랜덤으로)
    btns[Math.floor(Math.random() * btns.length)].click();
}

function closeEvent() {
    document.getElementById('event-modal').style.display = 'none';
    isEventActive = false;
    restoreCamera();
    openNextQueuedEvent();
}
function setSpeed(s, btn) { currentSpeed = s; document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); startTimers(); }
function updateCamera() { if (isSliding) { if (targetScale != null) { scale += (targetScale - scale) * 0.1; if (Math.abs(targetScale - scale) < 0.005) { scale = targetScale; targetScale = null; } } if (focusTarget) { targetCamX = (canvas.width / 2) - (focusTarget.x * scale); targetCamY = (canvas.height / 2) - (focusTarget.y * scale); } camX += (targetCamX - camX) * 0.1; camY += (targetCamY - camY) * 0.1; if (Math.abs(targetCamX - camX) < 1 && Math.abs(targetCamY - camY) < 1 && targetScale == null) { isSliding = false; focusTarget = null; } } }

let dragMoved = false;
canvas.addEventListener('mousedown', (e) => { isDragging = true; dragMoved = false; });
canvas.addEventListener('mousemove', e => { 
    if (isDragging) { 
        dragMoved = true;
        camX += e.movementX; 
        camY += e.movementY; 
        isSliding = false;
    }
});
window.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('click', e => {
    if (dragMoved) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - camX) / scale;
    const my = (e.clientY - rect.top - camY) / scale;
    for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = mx - n.x;
        const dy = my - n.y;
        if (dx * dx + dy * dy < n.radius * n.radius * 2) {
            showStatus(n);
            return;
        }
    }
    closeStatus();
});

let statusTarget = null;

function showStatus(person) {
    statusTarget = person;
    const jobLabel = person.jobName || (person.careerStage === 'retired' ? '은퇴' : '무직');
    const aliveText = person.isAlive ? '생존' : '사망';
    const diseaseText = person.disease ? ` (현재: ${person.disease})` : '';
    const headText = person.isHead ? ' 👑 현 가주' : '';
    const content = document.getElementById('status-content');
    content.innerHTML = `
        <div class="status-name">${person.name}${headText}</div>
        <div class="status-info">${person.gender === 'M' ? '남' : '여'} · ${person.age}세 · ${aliveText}${diseaseText}</div>
        <div class="status-info">직업: ${jobLabel}</div>
        <div class="status-traits">
            <span style="color:${getTierColor(person.traits.app.tier)}"><b>[외모]</b> ${person.traits.app.name}</span><br>
            <span style="color:${getTierColor(person.traits.per.tier)}"><b>[성격]</b> ${person.traits.per.name}</span><br>
            <span style="color:${getTierColor(person.traits.val.tier)}"><b>[가치관]</b> ${person.traits.val.name}</span><br>
            <span style="color:${getTierColor(person.traits.hlt.tier)}"><b>[건강]</b> ${person.traits.hlt.name}</span>
        </div>`;
    updateStatusPosition();
    document.getElementById('status-modal').style.display = 'block';
}

function updateStatusPosition() {
    if (!statusTarget) return;
    const modal = document.getElementById('status-modal');
    const charScreenX = statusTarget.x * scale + camX;
    const charScreenY = statusTarget.y * scale + camY;
    const offset = 120;
    modal.style.left = (charScreenX - offset) + 'px';
    modal.style.top = charScreenY + 'px';
    modal.style.transform = 'translate(-100%, -50%)';
}

function closeStatus() {
    statusTarget = null;
    document.getElementById('status-modal').style.display = 'none';
}

canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) { initialPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); isDragging = false; } else { isDragging = true; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; } }, {passive: false});
canvas.addEventListener('touchmove', e => { e.preventDefault(); if (e.touches.length === 2) { const currentDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (initialPinchDistance) { scale = Math.max(0.2, Math.min(2, scale + (currentDistance - initialPinchDistance) * 0.005)); initialPinchDistance = currentDistance; } } else if (isDragging && e.touches.length === 1) { camX += e.touches[0].clientX - lastTouchX; camY += e.touches[0].clientY - lastTouchY; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; isSliding = false; } }, {passive: false});
canvas.addEventListener('touchend', e => { if (e.touches.length < 2) initialPinchDistance = null; if (e.touches.length === 0) isDragging = false; });
canvas.addEventListener('wheel', e => { e.preventDefault(); scale = Math.max(0.2, Math.min(2, scale + e.deltaY * -0.001)); }, { passive: false });

// 자동선택: 이벤트 모달이 열릴 때 감지
(function() {
    const modal = document.getElementById('event-modal');
    if (!modal) return;
    new MutationObserver(() => {
        if (modal.style.display === 'block' && autoChoiceEnabled) {
            setTimeout(autoClickChoice, 80); // 버튼이 렌더링된 후 클릭
        }
    }).observe(modal, { attributes: true, attributeFilter: ['style'] });
})();

function animate() {
    updateCamera();
    // 전역 pulse를 여기서 한 번만 증가 (캐릭터 수와 무관하게 일정 속도)
    if (!isEventActive && currentSpeed > 0) globalPulse += 0.02 * currentSpeed;
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(Math.round(camX), Math.round(camY));
    ctx.scale(scale, scale);

    // 뷰포트 컬링: 화면에 보이는 영역 계산
    const margin = 250; // 캐릭터 크기 + 텍스트 여유
    const vpLeft   = -camX / scale - margin;
    const vpRight  = (canvas.width - camX) / scale + margin;
    const vpTop    = -camY / scale - margin;
    const vpBottom = (canvas.height - camY) / scale + margin;
    
    ctx.lineWidth = 3;
    nodes.forEach(n => {
        // 📌 부모→자녀 연결선 그리기
        if(n.parents.length) {
            const p1 = nodeMap.get(n.parents[0]);
            if(p1) {
                const partner = p1.partner !== null ? nodeMap.get(p1.partner) : null;
                const midX = partner ? (p1.x + partner.x) / 2 : p1.x; 
                const midY = partner ? (p1.y + partner.y) / 2 : p1.y;

                // 컬링: 양쪽 끝 모두 화면 밖이면 스킵
                const lineVisible = !(
                    (n.x < vpLeft && midX < vpLeft) || (n.x > vpRight && midX > vpRight) ||
                    (n.y < vpTop && midY < vpTop) || (n.y > vpBottom && midY > vpBottom)
                );
                if (!lineVisible) return;
                
                let lineWidth = 3;
                let strokeColor = "#cbd5e0";
                
                const eitherHead = p1.isHead || (partner && partner.isHead);

                if (!p1.isAlive && (!partner || !partner.isAlive)) {
                    strokeColor = "rgba(203, 213, 224, 0.2)";
                    lineWidth = 2;
                } else if (eitherHead) {
                    strokeColor = "#d63031";
                    lineWidth = 4;
                } else if (p1.isAlive) {
                    strokeColor = "#3498db";
                    lineWidth = 3.5;
                }
                
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = strokeColor;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y - n.radius * 1.3);
                ctx.bezierCurveTo(n.x, n.y - 180, midX, midY + 180, midX, midY);
                ctx.stroke();
            }
        }
        
        // 📌 부부 연결선 (가로선)
        if(n.partner !== null && n.gender === 'M') {
            const p = nodeMap.get(n.partner);
            if(p) {
                const coupleVisible = !(
                    (n.x < vpLeft && p.x < vpLeft) || (n.x > vpRight && p.x > vpRight) ||
                    (n.y < vpTop && p.y < vpTop) || (n.y > vpBottom && p.y > vpBottom)
                );
                if (!coupleVisible) return;
                ctx.lineWidth = n.isHead ? 3.5 : 2.5;
                ctx.strokeStyle = n.isHead ? "#d63031" : "#9b59b6";
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        }
    });

    // 캐릭터 렌더링 (뷰포트 안에 있는 것만)
    nodes.forEach(n => {
        if (n.x >= vpLeft && n.x <= vpRight && n.y >= vpTop && n.y <= vpBottom) {
            n.draw(ctx, scale);
        } else {
            // 화면 밖이라도 위치 보간은 계속
            n.x += (n.targetX - n.x) * 0.15;
            n.y += (n.targetY - n.y) * 0.15;
        }
    });

    // 플로팅 텍스트 렌더 + 업데이트
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.offsetY -= 0.8;
        ft.alpha -= 0.015;
        if (ft.alpha <= 0) { floatingTexts.splice(i, 1); continue; }
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.person.x, ft.person.y - 90 + ft.offsetY);
    }
    ctx.globalAlpha = 1;

    ctx.restore();
    if (statusTarget) updateStatusPosition();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
GENERAL_EVENT_DEFINITIONS = normalizeEventDefinitions(
    (typeof GENERAL_EVENTS !== 'undefined' && Array.isArray(GENERAL_EVENTS)) ? GENERAL_EVENTS : []
);
runEventEngineSelfTests();

// 에셋 순차 탐색 완료 후 게임 시작 (initGame이 loadedAssetCodes 채워진 이후 실행되게 돼)
Promise.all([
    loadFaceAssets(),
    probeAssetType('eyes',      'E'),
    probeAssetType('nose',      'N'),
    probeAssetType('mouth',     'M'),
    probeAssetType('frontHair', 'mFH', false, 'mFrontHair'),  // 남성 앞머리: mFHa.png~
    probeAssetType('frontHair', 'fFH', false, 'fFrontHair'),  // 여성 앞머리: fFHa.png~
    probeAssetType('backHair',  'mBH', true,  'mBackHair'),   // 남성 뒷머리: mBHx.png (비연속)
    probeAssetType('backHair',  'fBH', true,  'fBackHair'),   // 여성 뒷머리: fBHx.png (비연속)
    probeAssetType('clothes',   'C'),
    probeAssetType('shoulder',  'S'),
]).then(() => {
    console.log('[게임 시작] 에셋 탐색 완료:',
        Object.fromEntries(Object.entries(loadedAssetCodes).map(([k, v]) => [k, v.length + '개'])));
    initGame();
    animate();
});

