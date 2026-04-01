const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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
let traitUserActionSeq = 0;

// 플로팅 텍스트 (월급 연출)
const floatingTexts = [];

// 📌 생존 인구 캐시 (매 프레임 filter 호출 방지)
let _cachedAliveCount = 1;

function getDomainTraitDisplayText(domainKey, trait, showRepresentative = true) {
    if (!trait) return '미정';
    const baseName = trait.name || '미정';
    if (!showRepresentative || typeof getDomainTraitRepresentativeSummary !== 'function') {
        return baseName;
    }
    const reps = getDomainTraitRepresentativeSummary(domainKey, trait, false);
    return reps ? `${baseName} (${reps})` : baseName;
}

function buildTraitsBlockHtml(traits, options = {}) {
    const valueLabel = options.valueLabel || '가치관';
    const showRepresentative = options.showRepresentative !== false;
    const appTrait = traits?.app || { tier: 'N', name: '평범한외모' };
    const perTrait = traits?.per || { tier: 'N', name: '미정' };
    const valTrait = traits?.val || { tier: 'N', name: '미정' };
    const hltTrait = traits?.hlt || { tier: 'N', name: '미정' };

    if (options.grid) {
        const makeBadge = (prefix, tier, label) => {
            const bg = getTierColor(tier);
            return `<div style="background:${bg};color:#fff;border-radius:6px;padding:3px 6px;font-size:13px;font-weight:bold;font-family:sans-serif;line-height:1.4;">` +
                   `<span style="opacity:0.85">[${prefix}]</span> ${label}</div>`;
        };
        return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">` +
            makeBadge('외모', appTrait.tier, appTrait.name) +
            makeBadge('성격', perTrait.tier, getDomainTraitDisplayText('per', perTrait, showRepresentative)) +
            makeBadge(valueLabel, valTrait.tier, getDomainTraitDisplayText('val', valTrait, showRepresentative)) +
            makeBadge('건강', hltTrait.tier, getDomainTraitDisplayText('hlt', hltTrait, showRepresentative)) +
        `</div>`;
    }

    return `
        <span style="color:${getTierColor(appTrait.tier)}"><b>[외모]</b> ${appTrait.name}</span><br>
        <span style="color:${getTierColor(perTrait.tier)}"><b>[성격]</b> ${getDomainTraitDisplayText('per', perTrait, showRepresentative)}</span><br>
        <span style="color:${getTierColor(valTrait.tier)}"><b>[${valueLabel}]</b> ${getDomainTraitDisplayText('val', valTrait, showRepresentative)}</span><br>
        <span style="color:${getTierColor(hltTrait.tier)}"><b>[건강]</b> ${getDomainTraitDisplayText('hlt', hltTrait, showRepresentative)}</span>
    `;
}

function createRandomTraitSet() {
    const coreTraits = (typeof createRandomCoreTraits === 'function')
        ? createRandomCoreTraits()
        : { per: null, val: null, hlt: null };
    return {
        app: getRandomTrait('app'),
        per: coreTraits.per,
        val: coreTraits.val,
        hlt: coreTraits.hlt
    };
}

function setPersonJob(person, jobCode, assignedMonth = globalMonths) {
    if (!person) return;

    const jobDef = JOB_DEFINITIONS[jobCode];
    if (!jobDef) {
        console.warn('[CAREER] 알 수 없는 직업 코드:', jobCode);
        return;
    }

    let incomeKrw = jobDef.monthlyIncomeKrw;
    if (jobDef.incomeRandomRange) {
        const { min, max, step } = jobDef.incomeRandomRange;
        const steps = Math.floor((max - min) / step);
        incomeKrw = min + Math.floor(Math.random() * (steps + 1)) * step;
    }

    person.jobCode = jobCode;
    person.jobName = jobDef.name;
    person.jobMonthlyIncomeKrw = incomeKrw;
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

    // 📌 최적화: alive 캐시 사용
    const aliveIds = getAliveNodes();
    for (let ai = 0; ai < aliveIds.length; ai++) {
        const person = nodes[aliveIds[ai]];
        if (!person.isAlive || !person.isMain) continue;
        const events = collectEligibleEvents(person, gameCtx);
        for (let j = 0; j < events.length; j++) {
            yearlyEventQueue.push({
                personId: person.id,
                eventDef: events[j]
            });
        }
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
                traitUserActionSeq += 1;
                const assetDelta = extractAssetDeltaFromResult(choice.result);
                applyEventChoice(person, queued.eventDef, choice.id, {
                    ...buildGameContext(),
                    isUserChoice: true,
                    actionSeq: traitUserActionSeq
                });

                const baseText = choice.resultText || getResultDescription(choice.result);
                const eDesc = document.getElementById('e-desc');
                if (assetDelta !== 0) {
                    const sign = assetDelta > 0 ? '+' : '-';
                    const color = assetDelta > 0 ? '#27ae60' : '#e74c3c';
                    const amountStr = formatKoreanMoneyUnits(Math.abs(assetDelta));
                    eDesc.innerHTML = `${baseText}<br><span style="color:${color}; font-weight:bold;">자산 ${sign}${amountStr}</span>`;
                } else {
                    eDesc.innerText = baseText;
                }

                const cont = document.getElementById('choices-container');
                cont.innerHTML = '';
                const confirmBtn = document.createElement('button');
                confirmBtn.className = 'choice-btn';
                confirmBtn.textContent = '확인';
                confirmBtn.onclick = () => closeEvent();
                cont.appendChild(confirmBtn);

                if (autoChoiceEnabled) {
                    setTimeout(closeEvent, 150);
                }
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

    if (nodes.length === 0) return;
    const root = nodes[0];

    // 📌 반복문 기반 레이아웃 (스택 오버플로우 방지)
    // 1단계: 후위순회 순서(leaf→root) 구축
    const postOrder = [];
    const stack = [root];
    while (stack.length > 0) {
        const n = stack.pop();
        postOrder.push(n);
        for (let i = 0; i < n.children.length; i++) {
            const child = nodeMap.get(n.children[i]);
            if (child) stack.push(child);
        }
    }
    postOrder.reverse(); // leaf부터 처리

    // 2단계: 서브트리 너비 계산 (leaf→root)
    const widthMap = new Map();
    for (let i = 0; i < postOrder.length; i++) {
        const n = postOrder[i];
        const myWidth = (n.partner !== null) ? PARTNER_SPACING : 100;
        if (n.children.length === 0) {
            widthMap.set(n.id, myWidth);
        } else {
            let childrenWidth = 0;
            for (let j = 0; j < n.children.length; j++) {
                const cw = widthMap.get(n.children[j]);
                if (cw !== undefined) childrenWidth += cw;
            }
            childrenWidth += (n.children.length - 1) * NODE_SPACING;
            widthMap.set(n.id, Math.max(myWidth, childrenWidth));
        }
    }

    // 3단계: 위치 배정 (root→leaf, 반복문)
    const posQueue = [{ node: root, centerX: 0, level: 0 }];
    let qi = 0;
    while (qi < posQueue.length) {
        const { node, centerX, level } = posQueue[qi++];
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
            const childNodes = [];
            const childWidths = [];
            let totalWidth = 0;
            for (let j = 0; j < node.children.length; j++) {
                const c = nodeMap.get(node.children[j]);
                if (c) {
                    const w = widthMap.get(c.id) || 100;
                    childNodes.push(c);
                    childWidths.push(w);
                    totalWidth += w;
                }
            }
            totalWidth += (childNodes.length - 1) * NODE_SPACING;

            let startX = centerX - totalWidth / 2;
            for (let j = 0; j < childNodes.length; j++) {
                const w = childWidths[j];
                posQueue.push({ node: childNodes[j], centerX: startX + w / 2, level: level + 1 });
                startX += w + NODE_SPACING;
            }
        }
    }
}

function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    nodes = []; nodeMap.clear(); nextId = 0; globalMonths = 0;
    familyAssetKrw = INITIAL_FAMILY_ASSET_KRW;
    lastMonthlyCashflowKrw = 0;
    traitUserActionSeq = 0;
    yearlyEventQueue = [];
    _cachedAliveCount = 1;
    camX = canvas.width / 2; camY = 150;
    isEventActive = false; // 이벤트 잠금 초기화
    
    // year-ui 초기값 즉시 업데이트
    document.getElementById('year-ui').innerText = '0년째 가문 진행 중';
    
    // founder를 화면 중앙에 명시적으로 배치
    const founderX = 0;
    const founderY = 0;
    const founder = new PersonNode("1대 가주", 'M', founderX, founderY, 0, 20, [], true, true, false); 
    founder.traits = createRandomTraitSet();
    founder.visuals = getRandomVisuals('M');
    nodes.push(founder);
    nodeMap.set(founder.id, founder);
    
    // 레이아웃 업데이트로 targetX, targetY 설정
    updateLayout();
    
    updateUI();

    // 시작 즉시 1대 가주 직업 선택 이벤트 표시 (랜덤 4개 직업)
    const shuffledJobs = ALL_JOB_CODES
        .filter(code => code !== 'student' && code !== 'housekeeper')
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    const founderJobChoices = ['student', ...shuffledJobs].map(code => ({
        id: code,
        text: JOB_DEFINITIONS[code].name,
        resultText: `${JOB_DEFINITIONS[code].name}(으)로 첫 발을 내딛습니다.`,
        result: { type: 'set_job', jobCode: code }
    }));
    const founderCareerEventDef = {
        code: 'career_initial_choice',
        text: '첫 직업을 선택할 시기가 왔다.',
        choices: founderJobChoices
    };
    ensureEventState(founder);
    yearlyEventQueue.unshift({ personId: founder.id, eventDef: founderCareerEventDef });
    isEventActive = false;

    // 속도 버튼 선택 후 타이머 시작
    const speedBtn = document.querySelectorAll('.speed-btn')[1];
    if (speedBtn) setSpeed(1, speedBtn);
    else console.error("[ERROR] Speed button not found!");
}

function handleDisease(n) {
    // 📌 무병장수 특성: 발병 0%, 회복 100%
    try {
        const isLongHealth = (typeof isLongHealthTrait === 'function')
            ? isLongHealthTrait(n.traits?.hlt)
            : false;
        
        if (isLongHealth) {
            // 무병장수: 질병 없음 유지, 있으면 즉시 회복
            n.disease = null;
            return;
        }
    } catch (e) {
        console.warn('[Warning] 특성 진단 실패:', e);
    }
    
    // 기본 확률 (보통 체력/회복력 기준)
    let baseRates = { onset: 0.05, recover: 0.2, worsen: 0.2 };
    
    // 📌 피트니스 & 회복력 특성 반영
    let hltAttrs = { fitness: 'normal', recovery: 'normal' };
    try {
        if (typeof getHltAttributes === 'function') {
            hltAttrs = getHltAttributes(n.traits?.hlt);
        }
    } catch (e) {
        console.warn('[Warning] 건강 속성 추출 실패:', e);
    }
    
    // 피트니스에 따른 발병 확률 조정 (기준: normal)
    const fitnessMultiplier = {
        'strong': 0.5,     // 강함: 50% 감소
        'normal': 1.0,     // 보통: 기본값
        'weak': 1.5        // 약함: 50% 증가
    };
    
    // 회복력에 따른 회복 확률 조정 (기준: normal)
    const recoveryMultiplier = {
        'fast': 1.5,       // 빠름: 50% 증가
        'normal': 1.0,     // 보통: 기본값
        'slow': 0.5        // 느림: 50% 감소
    };
    
    const onsetRate = baseRates.onset * (fitnessMultiplier[hltAttrs.fitness] || 1.0);
    const recoverRate = baseRates.recover * (recoveryMultiplier[hltAttrs.recovery] || 1.0);
    const worsenRate = baseRates.worsen;
    
    if (!n.disease) {
        if (Math.random() < onsetRate) n.disease = '감기';
    } else {
        const rand = Math.random();
        if (rand < recoverRate) n.disease = null;
        else if (rand < recoverRate + worsenRate) {
            if (n.disease === '감기') n.disease = '몸살';
            else if (n.disease === '몸살') n.disease = '혼절';
            else if (n.disease === '혼절') { n.isAlive = false; n.disease = '병사'; n.deathMonth = globalMonths; }
        }
    }
}

// 📌 오래된 사망 노드 정리 (사망 후 100년 지난 노드 제거)
function pruneDeadNodes() {
    const cutoff = globalMonths - 1200; // 100년 = 1200개월
    const before = nodes.length;
    const keepIds = new Set();
    // 1단계: 유지할 노드 ID 수집
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.isAlive || n.isHead || (n.deathMonth !== undefined && n.deathMonth > cutoff)) {
            keepIds.add(n.id);
        }
    }
    // 부모/파트너가 유지 노드인 경우 자녀/파트너도 유지
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!keepIds.has(n.id)) continue;
        if (n.partner !== null) keepIds.add(n.partner);
        for (let j = 0; j < n.children.length; j++) keepIds.add(n.children[j]);
    }
    // 2단계: nodes 배열 재구성 + nodeMap 정리
    const newNodes = [];
    for (let i = 0; i < nodes.length; i++) {
        if (keepIds.has(nodes[i].id)) {
            newNodes.push(nodes[i]);
        } else {
            nodeMap.delete(nodes[i].id);
        }
    }
    nodes = newNodes;
    markAliveNodesDirty();
    const removed = before - nodes.length;
    if (removed > 0) console.log(`[Prune] ${removed}개 고대 사망 노드 제거 (총 ${nodes.length}개 유지)`);
}

// 📌 생존 노드 인덱스 (매 yearly tick마다 갱신, 매월 전체 순회 방지)
let _aliveNodeIds = [];
let _aliveNodesDirty = true;

function getAliveNodes() {
    if (_aliveNodesDirty) {
        _aliveNodeIds = [];
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].isAlive) _aliveNodeIds.push(i);
        }
        _aliveNodesDirty = false;
    }
    return _aliveNodeIds;
}

function markAliveNodesDirty() {
    _aliveNodesDirty = true;
}

function startTimers() {
    if(monthTimer) clearInterval(monthTimer);
    if(currentSpeed === 0) return; 
    
    // 큐에 이벤트가 쌓여 있으면 타이머 첫 틱 전에 즉시 열기
    if (yearlyEventQueue.length > 0 && !isEventActive) {
        openNextQueuedEvent();
    }

    let _tickRunning = false;
    monthTimer = setInterval(() => {
        if(isEventActive) return;
        if(_tickRunning) return;
        _tickRunning = true;
        try {
        globalMonths++;
        settleMonthlyFamilyAsset();
        updateUI();

        const isYearlyTick = globalMonths % 12 === 0;
        let successionTriggered = false;

        if (isYearlyTick) {
            // 10년마다 오래된 사망 노드 정리
            if (globalMonths % 120 === 0) pruneDeadNodes();
            markAliveNodesDirty();
            const aliveIds = getAliveNodes();
            for (let ai = 0; ai < aliveIds.length; ai++) {
                const n = nodes[aliveIds[ai]];
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

                // 📌 자연 사망
                try {
                    const isLongHealth = (typeof isLongHealthTrait === 'function')
                        ? isLongHealthTrait(n.traits?.hlt)
                        : false;
                    
                    if (isLongHealth) {
                        // 무병장수: 120살에 100% 사망
                        if (n.age >= 120) {
                            n.isAlive = false;
                            n.deathMonth = globalMonths;
                            if (n.isHead) {
                                triggerSuccession(n);
                                successionTriggered = true;
                                break;
                            }
                            updateUI();
                        }
                    } else {
                        // 일반인: 80살부터 10% 확률 사망
                        if (n.age > 80 && Math.random() < 0.1) {
                            n.isAlive = false;
                            n.deathMonth = globalMonths;
                            if (n.isHead) {
                                triggerSuccession(n);
                                successionTriggered = true;
                                break;
                            }
                            updateUI();
                        }
                    }
                } catch (e) {
                    console.warn('[Warning] 자연 사망 판단 실패:', e);
                }
            }

            if (successionTriggered) {
                const yearText = `${Math.floor(globalMonths/12)}년째 가문 진행 중`;
                document.getElementById('year-ui').innerText = yearText;
                return;
            }

            const aliveIds2 = getAliveNodes();
            for (let ri = 0; ri < aliveIds2.length; ri++) {
                const n = nodes[aliveIds2[ri]];
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

        const aliveIds3 = getAliveNodes();
        for (let mi = 0; mi < aliveIds3.length; mi++) {
            const n = nodes[aliveIds3[mi]];
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
        } finally { _tickRunning = false; }
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
                ${buildTraitsBlockHtml(child.traits, { valueLabel: '가치' })}
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
        const candidateTraits = createRandomTraitSet();
        const c_visuals = getRandomVisuals(partnerGender);

        // 직업 및 소득: JOB_DEFINITIONS에서 직접 선택
        const candidateJobCode = getRandomJobCodeFromAllJobs();
        const candidateJobDef = candidateJobCode ? JOB_DEFINITIONS[candidateJobCode] : null;
        const candidateJobName = candidateJobDef?.name || '무직';
        let candidateGrossKrw = candidateJobDef?.monthlyIncomeKrw ?? 0;
        if (candidateJobDef?.incomeRandomRange) {
            const { min, max, step } = candidateJobDef.incomeRandomRange;
            const steps = Math.floor((max - min) / step);
            candidateGrossKrw = min + Math.floor(Math.random() * (steps + 1)) * step;
        }
        const candidateExpenseKrw = getFixedMonthlyExpenseKrw(p.age);
        const candidateNetKrw = candidateGrossKrw - candidateExpenseKrw;

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

        const netSign = candidateNetKrw >= 0 ? '+' : '';
        const netColor = candidateNetKrw >= 0 ? '#27ae60' : '#e74c3c';
        const incomeStr = `${netSign}${formatKoreanMoneyUnits(candidateNetKrw)}`;

        const info = document.createElement('div');
        info.className = 'marriage-choice-info';
        info.innerHTML = `
            <div class="marriage-choice-title">후보 ${i + 1}</div>
            <div style="font-size:15.1px; margin-bottom:4px;">
                ${candidateJobName} &nbsp;
                <span style="color:${netColor}; font-weight:bold;">${incomeStr}/월</span>
            </div>
            <div class="trait-box">
                ${buildTraitsBlockHtml(candidateTraits, { valueLabel: '가치', showRepresentative: false, grid: true })}
            </div>`;

        layout.appendChild(previewWrap);
        layout.appendChild(info);
        btn.appendChild(layout);

        btn.onclick = () => {
            const partner = new PersonNode(NAMES[p.gender==='M'?'F':'M'][Math.floor(Math.random()*10)], p.gender==='M'?'F':'M', p.x, p.y, p.level, p.age, [], false, p.isMain, true);
            partner.isMarried = true; p.isMarried = true; p.partner = partner.id; partner.partner = p.id;
            partner.traits = candidateTraits;
            partner.visuals = c_visuals;
            // 미리 배정된 직업 및 소득 그대로 적용
            if (candidateJobCode) {
                setPersonJob(partner, candidateJobCode, globalMonths);
                partner.jobMonthlyIncomeKrw = candidateGrossKrw; // 팝업에 표시된 값과 동일하게 고정
            } else {
                assignRandomCareerForLateJoiner(partner);
            }
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

    const inheritedCoreTraits = (typeof createInheritedCoreTraits === 'function')
        ? createInheritedCoreTraits(p.traits, partner.traits)
        : { per: p.traits.per, val: p.traits.val, hlt: p.traits.hlt };
    const c_app = Math.random() < 0.5 ? { ...p.traits.app } : { ...partner.traits.app };
    const childTraits = {
        app: c_app,
        per: inheritedCoreTraits.per,
        val: inheritedCoreTraits.val,
        hlt: inheritedCoreTraits.hlt
    };
    const c_visuals = inheritVisuals(p.visuals, partner.visuals, gender);

    focusOnPerson(p);
    document.getElementById('e-title').innerText = "생명 탄생";
    document.getElementById('e-desc').innerHTML = `가문에 <b>${childName}</b>이(가) 태어났습니다!`;
    const container = document.getElementById('choices-container');
    container.innerHTML = `
        <div class="trait-box" style="text-align:left; margin-bottom:15px;">
            ${buildTraitsBlockHtml(childTraits, { valueLabel: '가치관', showRepresentative: false })}
        </div>
        <button class="choice-btn" style="text-align:center"><b>가계도에 추가</b></button>`;
    const addBtn = container.querySelector('button');
    addBtn.onclick = () => {
        const midX = (p.x + partner.x) / 2;
        const child = new PersonNode(childName, gender, midX, p.y + 50, p.level + 1, 0, [p.id, p.partner], false, p.isMain, false);
        child.traits = childTraits;
        child.visuals = c_visuals;
        p.children.push(child.id); nodes.push(child); nodeMap.set(child.id, child); updateLayout();
        targetCamX = (canvas.width / 2) - (child.targetX * scale); targetCamY = (canvas.height / 2) - (child.targetY * scale); isSliding = true;
        updateUI(); closeEvent();
    };
    
    // 📌 자동선택 지원: 생명탄생 팝업도 자동으로 추가
    if (autoChoiceEnabled) {
        setTimeout(() => addBtn.click(), 150);
    }
    
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
    // 📌 반복문 기반 (스택 오버플로우 방지)
    const stack = [nodeId];
    while (stack.length > 0) {
        const id = stack.pop();
        const node = nodeMap.get(id);
        if (!node) continue;
        node.isMain = false;
        if (node.partner !== null) {
            const pNode = nodeMap.get(node.partner);
            if (pNode) pNode.isMain = false;
        }
        for (let i = 0; i < node.children.length; i++) {
            stack.push(node.children[i]);
        }
    }
}

function updateUI() {
    const popElement = document.getElementById('pop-ui');
    if (popElement) {
        popElement.innerText = `인구: ${_cachedAliveCount}명`;
    }

    const assetElement = document.getElementById('asset-ui');
    if (assetElement) {
        assetElement.innerText = `자산: ${formatKoreanMoneyUnits(familyAssetKrw)}`;
    }
    const totalAssetEl = document.getElementById('total-asset-ui');
    if (totalAssetEl) {
        // 📌 월간 변동액 표시
        const cashflowSign = lastMonthlyCashflowKrw >= 0 ? '+' : '';
        const cashflowColor = lastMonthlyCashflowKrw >= 0 ? '#27ae60' : '#e74c3c';
        const cashflowStr = formatKoreanMoneyUnits(lastMonthlyCashflowKrw);
        totalAssetEl.innerHTML = `총 자산: ${formatKoreanMoneyUnits(familyAssetKrw)} <span style="color:${cashflowColor}; font-size:12px; font-weight:bold;">(${cashflowSign}${cashflowStr}/월)</span>`;
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

function getResultDescription(result) {
    if (!result) return '';
    switch (result.type) {
        case 'none': return '특별한 변화는 없었다.';
        case 'disease': return result.disease ? `${result.disease}에 걸렸다.` : '건강이 회복됐다.';
        case 'set_job': {
            const jobDef = JOB_DEFINITIONS[result.jobCode];
            const jobName = jobDef ? jobDef.name : result.jobCode;
            return `직업: ${jobName}`;
        }
        case 'trait_delta': {
            try {
                const idx = DOMAIN_TRAIT_INDEX[result.domain];
                const attrMeta = idx && idx.attributeByKey ? idx.attributeByKey[result.attribute] : null;
                const typeMeta = attrMeta && attrMeta.typeByKey ? attrMeta.typeByKey[result.traitType] : null;
                const sign = result.delta > 0 ? '+' : '';
                const label = typeMeta ? typeMeta.typeLabel : result.traitType;
                return `[${label}] 성향 ${sign}${result.delta}`;
            } catch (e) {
                return '성향이 변했다.';
            }
        }
        case 'asset_delta': {
            if (!Number.isFinite(result.amount)) return '';
            const sign = result.amount >= 0 ? '+' : '';
            return `자산 ${sign}${formatKoreanMoneyUnits(result.amount)}`;
        }
        case 'multi': {
            if (!Array.isArray(result.results)) return '';
            return result.results
                .map(r => getResultDescription(r))
                .filter(s => s)
                .join(' / ');
        }
        default: return '';
    }
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
            ${buildTraitsBlockHtml(person.traits, { valueLabel: '가치관' })}
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
    
    // 📌 최적화: 부모→자녀, 부부 연결선 그리기 (성능 개선)
    // - 조기 경계 체크로 nodeMap 호출 최소화
    // - 선 색상 상태 캐싱
    ctx.lineWidth = 3;
    let prevLineWidth = 3;
    let prevStrokeColor = "#cbd5e0";

    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        
        // 📌 부모→자녀 연결선: 자식이 뷰포트 근처에만 그리기
        if (n.parents.length && (n.x >= vpLeft - 400 && n.x <= vpRight + 400)) {
            const p1 = nodeMap.get(n.parents[0]);
            if (p1) {
                const partner = p1.partner !== null ? nodeMap.get(p1.partner) : null;
                const midX = partner ? (p1.x + partner.x) / 2 : p1.x; 
                const midY = partner ? (p1.y + partner.y) / 2 : p1.y;

                // 빠른 AABB 충돌 체크
                if ((n.x < vpLeft && midX < vpLeft) || (n.x > vpRight && midX > vpRight) ||
                    (n.y < vpTop && midY < vpTop) || (n.y > vpBottom && midY > vpBottom)) {
                    continue;
                }
                
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
                
                // 상태 변경 시에만 캔버스 업데이트
                if (lineWidth !== prevLineWidth) {
                    ctx.lineWidth = lineWidth;
                    prevLineWidth = lineWidth;
                }
                if (strokeColor !== prevStrokeColor) {
                    ctx.strokeStyle = strokeColor;
                    prevStrokeColor = strokeColor;
                }
                
                ctx.beginPath();
                ctx.moveTo(n.x, n.y - n.radius * 1.3);
                ctx.bezierCurveTo(n.x, n.y - 180, midX, midY + 180, midX, midY);
                ctx.stroke();
            }
        }
        
        // 📌 부부 연결선: 남자만 처리 (중복 방지)
        if (n.partner !== null && n.gender === 'M' && (n.x >= vpLeft - 300 && n.x <= vpRight + 300)) {
            const p = nodeMap.get(n.partner);
            if (p && !((n.x < vpLeft && p.x < vpLeft) || (n.x > vpRight && p.x > vpRight) ||
                       (n.y < vpTop && p.y < vpTop) || (n.y > vpBottom && p.y > vpBottom))) {
                const lineWidth = n.isHead ? 3.5 : 2.5;
                const strokeColor = n.isHead ? "#d63031" : "#9b59b6";
                
                if (lineWidth !== prevLineWidth) {
                    ctx.lineWidth = lineWidth;
                    prevLineWidth = lineWidth;
                }
                if (strokeColor !== prevStrokeColor) {
                    ctx.strokeStyle = strokeColor;
                    prevStrokeColor = strokeColor;
                }
                
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        }
    }

    // 📌 캐릭터 렌더링 (뷰포트 안에 있는 것만)
    // 📌 위치 보간 + 렌더링 (죽은 노드는 위치 고정이므로 보간 불필요)
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.isAlive) {
            n.x += (n.targetX - n.x) * 0.15;
            n.y += (n.targetY - n.y) * 0.15;
        } else if (n.x !== n.targetX || n.y !== n.targetY) {
            // 죽은 노드: 목표 위치로 즉시 이동 (1회만)
            n.x = n.targetX;
            n.y = n.targetY;
        }
        
        // 보이는 노드만 그리기
        if (n.x >= vpLeft && n.x <= vpRight && n.y >= vpTop && n.y <= vpBottom) {
            n.draw(ctx, scale);
        }
    }

    // 플로팅 텍스트 렌더 + 업데이트
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let writeIdx = 0;
    for (let i = 0; i < floatingTexts.length; i++) {
        const ft = floatingTexts[i];
        ft.offsetY -= 0.8;
        ft.alpha -= 0.015;
        if (ft.alpha <= 0) continue;
        floatingTexts[writeIdx++] = ft;
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.person.x, ft.person.y - 90 + ft.offsetY);
    }
    floatingTexts.length = writeIdx;
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
