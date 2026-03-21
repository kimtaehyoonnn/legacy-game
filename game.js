const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let nodes = [], nextId = 0, scale = 0.5; 
let camX, camY, targetCamX, targetCamY, isSliding = false;
let isDragging = false, lastTouchX = 0, lastTouchY = 0, initialPinchDistance = null;
let currentSpeed = 1, monthTimer, isEventActive = false, globalMonths = 0;
let drawCallCount = 0;  // 💡 draw() 호출 횟수 추적
let yearlyEventQueue = [];
let GENERAL_EVENT_DEFINITIONS = [];
const INITIAL_FAMILY_ASSET_KRW = 10_000_000;
let familyAssetKrw = INITIAL_FAMILY_ASSET_KRW;
let lastMonthlyCashflowKrw = 0;
const EVENT_GROUP_OPS = new Set(['and', 'or']);
const EVENT_LEAF_OPERATORS = new Set(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in']);
const EVENT_RESULT_TYPES = new Set(['none', 'disease', 'trait_delta', 'set_job']);

// 💡 특성 데이터 정의
const TRAITS_DATA = {
    app: [
        { tier: 'SSR', name: '절세미인' },
        { tier: 'SSR', name: '꽃미남' },
        { tier: 'SR', name: '잘생긴편' },
        { tier: 'SR', name: '예쁜편' },
        { tier: 'R', name: '괜찮은외모' },
        { tier: 'R', name: '평범한외모' }
    ],
    per: [
        { tier: 'SSR', name: '강단 있음' },
        { tier: 'SSR', name: '따뜻한마음' },
        { tier: 'SR', name: '신중함' },
        { tier: 'SR', name: '적극적' },
        { tier: 'R', name: '소심함' },
        { tier: 'R', name: '평범한성격' }
    ],
    val: [
        { tier: 'SSR', name: '명예심강함' },
        { tier: 'SSR', name: '의리있음' },
        { tier: 'SR', name: '현실주의' },
        { tier: 'SR', name: '낙관주의' },
        { tier: 'R', name: '이기주의' },
        { tier: 'R', name: '무관심' }
    ],
    hlt: [
        { tier: 'SSR', name: '철강체' },
        { tier: 'SSR', name: '건강함' },
        { tier: 'SR', name: '보통체력' },
        { tier: 'SR', name: '약간약함' },
        { tier: 'R', name: '허약체질' },
        { tier: 'R', name: '병약함' }
    ]
};

const EVENT_RESULT_HANDLERS = {
    none: () => {},
    disease: (result, person) => {
        if (!person || !Object.prototype.hasOwnProperty.call(result, 'disease')) return;
        person.disease = result.disease;
    },
    trait_delta: (result, person) => {
        if (!person || !person.traits) return;
        const traitPool = TRAITS_DATA[result.trait];
        if (!Array.isArray(traitPool) || traitPool.length === 0) return;

        const normalizedDelta = Math.max(-2, Math.min(2, Math.trunc(result.delta)));
        if (normalizedDelta === 0) return;

        const currentTrait = person.traits[result.trait];
        let currentIndex = traitPool.findIndex(t => t.name === currentTrait?.name && t.tier === currentTrait?.tier);
        if (currentIndex < 0) currentIndex = Math.floor(traitPool.length / 2);

        const nextIndex = Math.max(0, Math.min(traitPool.length - 1, currentIndex + normalizedDelta));
        person.traits[result.trait] = traitPool[nextIndex];
    },
    set_job: (result, person) => {
        if (!person || typeof result.jobCode !== 'string') return;
        setPersonJob(person, result.jobCode, globalMonths);
    }
};

function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function buildGameContext() {
    return {
        globalMonths,
        year: Math.floor(globalMonths / 12),
        totalPopulation: nodes.length,
        alivePopulation: nodes.filter(n => n.isAlive).length
    };
}

function getFixedMonthlyExpenseKrw(age) {
    const normalizedAge = Number.isFinite(age) ? Math.max(0, Math.floor(age)) : 0;
    if (normalizedAge < 20) return 1_000_000;
    if (normalizedAge < 30) return 1_500_000;
    if (normalizedAge < 55) return 2_500_000;
    if (normalizedAge < 70) return 1_500_000;
    return 1_000_000;
}

function getFixedMonthlyIncomeKrw(person) {
    if (!person || !Number.isFinite(person.jobMonthlyIncomeKrw)) return 0;
    return person.jobMonthlyIncomeKrw;
}

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

function isAliveAndValidInGameFamilyMember(person) {
    return !!person && person.isAlive && person.isMain;
}

function settleMonthlyFamilyAsset() {
    let monthlyCashflowKrw = 0;
    for (const person of nodes) {
        if (!isAliveAndValidInGameFamilyMember(person)) continue;
        monthlyCashflowKrw += getFixedMonthlyIncomeKrw(person) - getFixedMonthlyExpenseKrw(person.age);
    }
    lastMonthlyCashflowKrw = monthlyCashflowKrw;
    familyAssetKrw += monthlyCashflowKrw;
}

function formatKoreanMoneyUnits(amountKrw) {
    const safeAmount = Number.isFinite(amountKrw) ? Math.trunc(amountKrw) : 0;
    const isNegative = safeAmount < 0;
    let remaining = Math.abs(safeAmount);

    const units = [
        { value: 1_000_000_000_000, label: '조' },
        { value: 100_000_000, label: '억' },
        { value: 10_000, label: '만' }
    ];

    const parts = [];
    for (const unit of units) {
        if (remaining < unit.value) continue;
        const amount = Math.floor(remaining / unit.value);
        parts.push(`${amount.toLocaleString('ko-KR')}${unit.label}`);
        remaining %= unit.value;
    }

    if (remaining > 0 || parts.length === 0) {
        parts.push(`${remaining.toLocaleString('ko-KR')}원`);
    } else {
        const lastIndex = parts.length - 1;
        parts[lastIndex] = `${parts[lastIndex]}원`;
    }

    return `${isNegative ? '-' : ''}${parts.join(' ')}`;
}

function validateConditionNode(node, path, errors) {
    if (!isPlainObject(node)) {
        errors.push(`${path}: 조건은 객체여야 합니다.`);
        return;
    }

    const hasGroup = Object.prototype.hasOwnProperty.call(node, 'op');
    if (hasGroup) {
        if (!EVENT_GROUP_OPS.has(node.op)) {
            errors.push(`${path}.op: '${node.op}'는 지원되지 않습니다.`);
        }
        if (!Array.isArray(node.conditions) || node.conditions.length === 0) {
            errors.push(`${path}.conditions: and/or 조건은 1개 이상 필요합니다.`);
            return;
        }
        node.conditions.forEach((child, index) => {
            validateConditionNode(child, `${path}.conditions[${index}]`, errors);
        });
        return;
    }

    if (!['person', 'game'].includes(node.target)) {
        errors.push(`${path}.target: 'person' 또는 'game'이어야 합니다.`);
    }
    if (typeof node.field !== 'string' || !node.field.trim()) {
        errors.push(`${path}.field: 문자열 필드명이 필요합니다.`);
    }
    if (!EVENT_LEAF_OPERATORS.has(node.operator)) {
        errors.push(`${path}.operator: '${node.operator}'는 지원되지 않습니다.`);
    }
    if (!Object.prototype.hasOwnProperty.call(node, 'value')) {
        errors.push(`${path}.value: 비교 값이 필요합니다.`);
    }
    if ((node.operator === 'in' || node.operator === 'not_in') && !Array.isArray(node.value)) {
        errors.push(`${path}.value: in/not_in 연산자는 배열 값이 필요합니다.`);
    }
}

function validateChoiceResult(result, path, errors) {
    if (!isPlainObject(result)) {
        errors.push(`${path}: result는 객체여야 합니다.`);
        return;
    }
    if (!EVENT_RESULT_TYPES.has(result.type)) {
        errors.push(`${path}.type: '${result.type}'는 지원되지 않는 결과 타입입니다.`);
        return;
    }

    if (result.type === 'disease') {
        const isValidDisease = result.disease === null || typeof result.disease === 'string';
        if (!isValidDisease) {
            errors.push(`${path}.disease: 문자열 또는 null 이어야 합니다.`);
        }
    }

    if (result.type === 'trait_delta') {
        if (!Object.prototype.hasOwnProperty.call(TRAITS_DATA, result.trait)) {
            errors.push(`${path}.trait: '${result.trait}'는 지원되지 않는 trait입니다.`);
        }
        if (typeof result.delta !== 'number' || !Number.isFinite(result.delta)) {
            errors.push(`${path}.delta: 숫자여야 합니다.`);
        } else if (result.delta < -2 || result.delta > 2) {
            errors.push(`${path}.delta: -2 ~ 2 범위여야 합니다.`);
        }
    }

    if (result.type === 'set_job') {
        if (typeof result.jobCode !== 'string' || !result.jobCode.trim()) {
            errors.push(`${path}.jobCode: 문자열 직업 코드가 필요합니다.`);
        } else if (!Object.prototype.hasOwnProperty.call(JOB_DEFINITIONS, result.jobCode)) {
            errors.push(`${path}.jobCode: '${result.jobCode}'는 지원되지 않는 직업 코드입니다.`);
        }
    }
}

function validateEventChoice(choice, path, errors) {
    if (!isPlainObject(choice)) {
        errors.push(`${path}: choice는 객체여야 합니다.`);
        return;
    }
    if (typeof choice.id !== 'string' || !choice.id.trim()) {
        errors.push(`${path}.id: 문자열이 필요합니다.`);
    }
    if (typeof choice.text !== 'string' || !choice.text.trim()) {
        errors.push(`${path}.text: 문자열이 필요합니다.`);
    }
    validateChoiceResult(choice.result, `${path}.result`, errors);
}

function validateEventDefinition(eventDef, index, seenCodes) {
    const path = `event[${index}]`;
    const errors = [];

    if (!isPlainObject(eventDef)) {
        errors.push(`${path}: 이벤트 정의는 객체여야 합니다.`);
        return errors;
    }

    if (typeof eventDef.code !== 'string' || !eventDef.code.trim()) {
        errors.push(`${path}.code: 문자열 코드가 필요합니다.`);
    } else if (seenCodes.has(eventDef.code)) {
        errors.push(`${path}.code: 중복 코드 '${eventDef.code}' 입니다.`);
    } else {
        seenCodes.add(eventDef.code);
    }

    if (typeof eventDef.text !== 'string' || !eventDef.text.trim()) {
        errors.push(`${path}.text: 이벤트 문장이 필요합니다.`);
    }

    if (typeof eventDef.probability !== 'number' || !Number.isFinite(eventDef.probability)) {
        errors.push(`${path}.probability: 숫자여야 합니다.`);
    } else if (eventDef.probability < 0 || eventDef.probability > 1) {
        errors.push(`${path}.probability: 0~1 범위여야 합니다.`);
    }

    validateConditionNode(eventDef.condition, `${path}.condition`, errors);

    if (!Array.isArray(eventDef.choices)) {
        errors.push(`${path}.choices: 배열이어야 합니다.`);
    } else {
        if (eventDef.choices.length < 1 || eventDef.choices.length > 4) {
            errors.push(`${path}.choices: 선지는 1~4개여야 합니다.`);
        }
        const seenChoiceIds = new Set();
        eventDef.choices.forEach((choice, choiceIndex) => {
            validateEventChoice(choice, `${path}.choices[${choiceIndex}]`, errors);
            if (isPlainObject(choice) && typeof choice.id === 'string') {
                if (seenChoiceIds.has(choice.id)) {
                    errors.push(`${path}.choices[${choiceIndex}].id: 중복 id '${choice.id}' 입니다.`);
                }
                seenChoiceIds.add(choice.id);
            }
        });
    }

    return errors;
}

function cloneConditionNode(node) {
    if (!isPlainObject(node)) return node;
    if (Object.prototype.hasOwnProperty.call(node, 'op')) {
        return {
            op: node.op,
            conditions: node.conditions.map(cloneConditionNode)
        };
    }
    return {
        target: node.target,
        field: node.field,
        operator: node.operator,
        value: Array.isArray(node.value) ? [...node.value] : node.value
    };
}

function normalizeEventDefinitions(rawDefs) {
    if (!Array.isArray(rawDefs)) {
        console.error('[EVENT VALIDATION] GENERAL_EVENTS는 배열이어야 합니다.');
        return [];
    }

    const normalized = [];
    const seenCodes = new Set();

    rawDefs.forEach((eventDef, index) => {
        const errors = validateEventDefinition(eventDef, index, seenCodes);
        if (errors.length > 0) {
            console.error('[EVENT VALIDATION] 이벤트 스킵:', errors.join(' | '));
            return;
        }

        normalized.push({
            code: eventDef.code.trim(),
            text: eventDef.text.trim(),
            probability: eventDef.probability,
            condition: cloneConditionNode(eventDef.condition),
            choices: eventDef.choices.map(choice => ({
                id: choice.id,
                text: choice.text,
                result: { ...choice.result }
            }))
        });
    });

    console.log(`[EVENT VALIDATION] 로드 완료: ${normalized.length}/${rawDefs.length}`);
    return normalized;
}

GENERAL_EVENT_DEFINITIONS = normalizeEventDefinitions(
    (typeof GENERAL_EVENTS !== 'undefined' && Array.isArray(GENERAL_EVENTS)) ? GENERAL_EVENTS : []
);

function ensureEventState(person) {
    if (!person.eventState || typeof person.eventState !== 'object') {
        person.eventState = {
            firedCodes: new Set(),
            choiceByCode: {}
        };
        return;
    }
    if (!(person.eventState.firedCodes instanceof Set)) {
        const prevCodes = Array.isArray(person.eventState.firedCodes) ? person.eventState.firedCodes : [];
        person.eventState.firedCodes = new Set(prevCodes);
    }
    if (!person.eventState.choiceByCode || typeof person.eventState.choiceByCode !== 'object') {
        person.eventState.choiceByCode = {};
    }
}

function getConditionValue(target, field) {
    if (!target || typeof field !== 'string') return undefined;
    return field.split('.').reduce((acc, key) => {
        if (acc === null || acc === undefined) return undefined;
        if (!Object.prototype.hasOwnProperty.call(acc, key)) return undefined;
        return acc[key];
    }, target);
}

function buildPersonConditionContext(person) {
    const monthsSinceJobAssigned = Number.isFinite(person?.jobAssignedMonth)
        ? globalMonths - person.jobAssignedMonth
        : null;

    return {
        ...person,
        monthsSinceJobAssigned
    };
}

function compareConditionValue(left, operator, right) {
    switch (operator) {
        case 'eq': return left === right;
        case 'neq': return left !== right;
        case 'gt': return left > right;
        case 'gte': return left >= right;
        case 'lt': return left < right;
        case 'lte': return left <= right;
        case 'in': return Array.isArray(right) && right.includes(left);
        case 'not_in': return Array.isArray(right) && !right.includes(left);
        default: return false;
    }
}

function evaluateCondition(node, person, gameCtx) {
    if (!node || typeof node !== 'object') return false;

    if (node.op === 'and' || node.op === 'or') {
        if (!Array.isArray(node.conditions) || node.conditions.length === 0) return false;
        if (node.op === 'and') return node.conditions.every(child => evaluateCondition(child, person, gameCtx));
        return node.conditions.some(child => evaluateCondition(child, person, gameCtx));
    }

    const source = node.target === 'game' ? gameCtx : person;
    const left = getConditionValue(source, node.field);
    return compareConditionValue(left, node.operator, node.value);
}

function collectEligibleEvents(person, gameCtx) {
    if (!person || !person.isAlive || !person.isMain) return [];
    ensureEventState(person);
    const personCtx = buildPersonConditionContext(person);

    const eligible = [];
    for (const eventDef of GENERAL_EVENT_DEFINITIONS) {
        if (!eventDef || !eventDef.code || person.eventState.firedCodes.has(eventDef.code)) continue;
        if (!evaluateCondition(eventDef.condition, personCtx, gameCtx)) continue;

        const probability = typeof eventDef.probability === 'number' ? eventDef.probability : 0;
        const normalizedProbability = Math.max(0, Math.min(1, probability));
        if (Math.random() <= normalizedProbability) {
            eligible.push(eventDef);
        }
    }
    return eligible;
}

function applyEventResult(result, person, gameCtx) {
    if (!isPlainObject(result)) return;
    const handler = EVENT_RESULT_HANDLERS[result.type];
    if (!handler) {
        console.warn('[EVENT RESULT] 알 수 없는 결과 타입:', result.type);
        return;
    }
    handler(result, person, gameCtx);
}

function applyEventChoice(person, eventDef, choiceId, gameCtx) {
    ensureEventState(person);
    person.eventState.choiceByCode[eventDef.code] = choiceId;
    person.eventState.firedCodes.add(eventDef.code);

    const selectedChoice = (eventDef.choices || []).find(choice => choice.id === choiceId);
    if (selectedChoice) {
        applyEventResult(selectedChoice.result, person, gameCtx || buildGameContext());
    }
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
        const person = nodes.find(n => n.id === queued.personId);
        if (!person || !person.isAlive || !person.isMain) continue;

        if (!queued.eventDef) continue;
        ensureEventState(person);
        if (person.eventState.firedCodes.has(queued.eventDef.code)) continue;

        const container = document.getElementById('choices-container');
        container.innerHTML = '';

        document.getElementById('e-title').innerText = "📘 인생 이벤트";
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
        document.getElementById('event-modal').style.display = 'block';
        return true;
    }

    return false;
}

function runEventEngineSelfTests() {
    const person = { age: 20, isMain: true, stats: { hp: 10 } };
    const gameCtx = { year: 1, globalMonths: 12 };
    const tests = [
        {
            name: 'leaf eq',
            node: { target: 'person', field: 'age', operator: 'eq', value: 20 },
            expected: true
        },
        {
            name: 'leaf gt',
            node: { target: 'person', field: 'age', operator: 'gt', value: 25 },
            expected: false
        },
        {
            name: 'group and',
            node: {
                op: 'and',
                conditions: [
                    { target: 'person', field: 'age', operator: 'eq', value: 20 },
                    { target: 'person', field: 'isMain', operator: 'eq', value: true }
                ]
            },
            expected: true
        },
        {
            name: 'group or nested',
            node: {
                op: 'or',
                conditions: [
                    { target: 'person', field: 'age', operator: 'lt', value: 10 },
                    {
                        op: 'and',
                        conditions: [
                            { target: 'game', field: 'year', operator: 'eq', value: 1 },
                            { target: 'person', field: 'stats.hp', operator: 'gte', value: 10 }
                        ]
                    }
                ]
            },
            expected: true
        },
        {
            name: 'leaf in',
            node: { target: 'person', field: 'age', operator: 'in', value: [18, 19, 20] },
            expected: true
        },
        {
            name: 'leaf not_in',
            node: { target: 'person', field: 'age', operator: 'not_in', value: [1, 2, 3] },
            expected: true
        }
    ];

    const failedConditions = tests.filter(test => evaluateCondition(test.node, person, gameCtx) !== test.expected);

    const invalidEventErrors = validateEventDefinition({
        code: '',
        text: '',
        probability: 2,
        condition: { target: 'person', field: 'age', operator: 'unknown', value: 10 },
        choices: []
    }, 0, new Set());

    const resultTestPerson = {
        age: 20,
        careerStage: 'none',
        jobCode: null,
        jobName: null,
        jobMonthlyIncomeKrw: 0,
        jobAssignedMonth: null,
        traits: {
            app: TRAITS_DATA.app[0],
            per: TRAITS_DATA.per[2],
            val: TRAITS_DATA.val[2],
            hlt: TRAITS_DATA.hlt[2]
        },
        disease: null
    };
    applyEventResult({ type: 'disease', disease: '감기' }, resultTestPerson, gameCtx);
    applyEventResult({ type: 'trait_delta', trait: 'per', delta: 1 }, resultTestPerson, gameCtx);
    applyEventResult({ type: 'set_job', jobCode: 'housekeeper' }, resultTestPerson, gameCtx);
    const resultHandlersPassed = resultTestPerson.disease === '감기'
        && !!resultTestPerson.traits.per
        && resultTestPerson.jobCode === 'housekeeper'
        && resultTestPerson.careerStage === 'selected';

    const allPassed = failedConditions.length === 0 && invalidEventErrors.length > 0 && resultHandlersPassed;
    if (allPassed) {
        console.log('[EVENT ENGINE TEST] 통과 (조건/검증/결과핸들러)');
    } else {
        if (failedConditions.length > 0) {
            console.error('[EVENT ENGINE TEST] 조건 평가 실패:', failedConditions.map(test => test.name).join(', '));
        }
        if (invalidEventErrors.length === 0) {
            console.error('[EVENT ENGINE TEST] 검증 테스트 실패: 잘못된 이벤트를 잡지 못했습니다.');
        }
        if (!resultHandlersPassed) {
            console.error('[EVENT ENGINE TEST] 결과 핸들러 테스트 실패');
        }
    }
}

function getRandomTrait(category) {
    if (!TRAITS_DATA[category]) return { tier: 'N', name: '평범함' };
    const traits = TRAITS_DATA[category];
    return traits[Math.floor(Math.random() * traits.length)];
}

function getRandomVisuals() {
    // 💡 ASSET_CONFIG 기반 동적 선택 (Person.js에서 정의됨)
    const getRandomAsset = (assetType) => {
        if (assetType === 'face') {
            return FACE_CONFIG.types[Math.floor(Math.random() * FACE_CONFIG.count)];
        }
        const config = ASSET_CONFIG[assetType];
        if (!config) return null;
        
        const letters = [];
        for (let i = 0; i < config.count; i++) {
            letters.push(String.fromCharCode(65 + i));
        }
        const letter = letters[Math.floor(Math.random() * letters.length)];
        
        if (assetType === 'eyes') return `E${letter}`;
        if (assetType === 'nose') return `N${letter}`;
        if (assetType === 'mouth') return `M${letter}`;
        if (assetType === 'hair') return `H${letter}`;
        if (assetType === 'clothes') return `C${letter}`;
        return null;
    };
    
    return {
        eyes: getRandomAsset('eyes'),
        nose: getRandomAsset('nose'),
        mouth: getRandomAsset('mouth'),
        face: getRandomAsset('face'),
        hair: getRandomAsset('hair'),
        clothes: getRandomAsset('clothes')
    };
}

function getTierColor(tier) {
    if(tier === 'SSR') return '#e67e22'; 
    if(tier === 'SR') return '#9b59b6';
    if(tier === 'R') return '#2980b9'; 
    return '#7f8c8d';
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
    founder.visuals = getRandomVisuals();
    nodes.push(founder);
    
    // 레이아웃 업데이트로 targetX, targetY 설정
    updateLayout();
    
    // 캐릭터 좌표 확인 로그
    console.log("[GAME INIT] Founder 생성 완료");
    console.log("[GAME INIT] Founder x:", founder.x, ", y:", founder.y);
    console.log("[GAME INIT] Founder targetX:", founder.targetX, ", targetY:", founder.targetY);
    console.log("[GAME INIT] Canvas size:", canvas.width, "x", canvas.height);
    console.log("[GAME INIT] Camera pos:", camX, ",", camY);
    
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
                    let wife = n.gender === 'F' ? n : nodes.find(s => s.id === n.partner);
                    if (wife && wife.isAlive && wife.age < wife.menopauseAge) { triggerBirth(n); break; }
                }
            }
        }
        const yearText = `${Math.floor(globalMonths/12)}년째 가문 진행 중`;
        document.getElementById('year-ui').innerText = yearText;
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
            assignRandomCareerForLateJoiner(partner);
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
        if (part === 'clothes') continue; // 옷은 유전 제외
        childVisuals[part] = (Math.random() < 0.5) ? p1Visuals[part] : p2Visuals[part];
    }
    // 옷은 랜덤 독립 배정
    const clothesCount = ASSET_CONFIG.clothes.count;
    const clothesLetter = String.fromCharCode(65 + Math.floor(Math.random() * clothesCount));
    childVisuals.clothes = `C${clothesLetter}`;
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

function updateUI() {
    const popElement = document.getElementById('pop-ui');
    if (popElement) {
        popElement.innerText = `인구: ${nodes.filter(n => n.isAlive).length}명`;
    }

    const assetElement = document.getElementById('asset-ui');
    if (assetElement) {
        assetElement.innerText = `자산: ${formatKoreanMoneyUnits(familyAssetKrw)}`;
    }
}
function closeEvent() {
    document.getElementById('event-modal').style.display = 'none';
    isEventActive = false;
    openNextQueuedEvent();
}
function setSpeed(s, btn) { currentSpeed = s; document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); startTimers(); }
function updateCamera() { if (isSliding) { camX += (targetCamX - camX) * 0.1; camY += (targetCamY - camY) * 0.1; if (Math.abs(targetCamX - camX) < 1) isSliding = false; } }

window.addEventListener('mousedown', () => isDragging = true);
window.addEventListener('mousemove', e => { 
    if (isDragging) { 
        camX += e.movementX; 
        camY += e.movementY; 
        isSliding = false;
    }
});
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
        // 📌 부모→자녀 연결선 그리기
        if(n.parents.length) {
            const p1 = nodes.find(node => node.id === n.parents[0]);
            if(p1) {
                const partner = nodes.find(node => node.id === p1.partner);
                const midX = partner ? (p1.x + partner.x) / 2 : p1.x; 
                const midY = partner ? (p1.y + partner.y) / 2 : p1.y;
                
                // 💡 선의 굵기와 색상: 생존 여부에 따라 다르게
                let lineWidth = 3;
                let strokeColor = "#cbd5e0";
                
                if (!p1.isAlive) {
                    strokeColor = "rgba(203, 213, 224, 0.2)";
                    lineWidth = 2;
                } else if (p1.isHead) {
                    strokeColor = "#d63031";  // 현 가주: 빨강
                    lineWidth = 4;
                } else if (p1.isMarried && n.gender === 'M' && nodes.find(nn => nn.id === p1.partner)?.isAlive) {
                    strokeColor = "#3498db";  // 결혼한 가주: 파랑
                    lineWidth = 3.5;
                }
                
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = strokeColor;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y - n.radius);
                ctx.bezierCurveTo(n.x, n.y - 180, midX, midY + 180, midX, midY);
                ctx.stroke();
            }
        }
        
        // 📌 부부 연결선 (가로선)
        if(n.partner !== null && n.gender === 'M') {
            const p = nodes.find(node => node.id === n.partner);
            if(p) {
                ctx.lineWidth = n.isHead ? 3.5 : 2.5;
                ctx.strokeStyle = n.isHead ? "#d63031" : "#9b59b6";  // 가주는 빨강, 아니면 보라
                ctx.beginPath();
                ctx.moveTo(n.x + n.radius, n.y);
                ctx.lineTo(p.x - p.radius, p.y);
                ctx.stroke();
            }
        }
    });

    nodes.forEach(n => n.draw(ctx, scale));
    ctx.restore();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initGame(); });
runEventEngineSelfTests();
initGame();

// 📌 이미지 로드 완료 후 animate() 시작
function startAnimate() {
    if (imagesLoaded < totalImages) {
        requestAnimationFrame(startAnimate);
        return;
    }
    console.log(`[게임 시작] 모든 이미지 로드 완료! (${imagesLoaded}/${totalImages})`);
    animate();
}
startAnimate();

// 실시간 진단 로깅 (3초마다)
setInterval(() => {
    if (nodes && nodes.length > 0) {
        const founder = nodes[0];
        console.log("[DIAGNOSIS] === 3초 진단 ===");
        console.log("[DIAGNOSIS] 생존 인구:", nodes.filter(n => n.isAlive).length);
        console.log("[DIAGNOSIS] 시조 정보:");
        console.log("  - 이름:", founder.name, ", ID:", founder.id);
        console.log("  - 나이:", founder.age, ", isAlive:", founder.isAlive, ", isMain:", founder.isMain);
        console.log("  - 좌표 (x,y):", founder.x.toFixed(1), ",", founder.y.toFixed(1));
        console.log("  - 재위치 (targetX,targetY):", founder.targetX.toFixed(1), ",", founder.targetY.toFixed(1));
        console.log("  - isMarried:", founder.isMarried, ", partner:", founder.partner);
        console.log("[DIAGNOSIS] 이벤트 잠금:", isEventActive);
        console.log("[DIAGNOSIS] 이벤트 큐:", yearlyEventQueue.length);
        console.log("[DIAGNOSIS] 경과 월:", globalMonths, "(" + Math.floor(globalMonths/12) + "년)");
        console.log("[DIAGNOSIS] 게임 속도:", currentSpeed);
        console.log("[DIAGNOSIS] draw() 호출 횟수:", drawCallCount, "(매 프레임)");
        drawCallCount = 0; // 리셋
    }
}, 3000);
