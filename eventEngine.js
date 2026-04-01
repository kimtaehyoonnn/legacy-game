const EVENT_GROUP_OPS = new Set(['and', 'or']);
const EVENT_LEAF_OPERATORS = new Set(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in']);
const EVENT_RESULT_TYPES = new Set(['none', 'disease', 'trait_delta', 'set_job', 'asset_delta', 'multi']);

const EVENT_RESULT_HANDLERS = {
    none: () => {},
    disease: (result, person) => {
        if (!person || !Object.prototype.hasOwnProperty.call(result, 'disease')) return;
        person.disease = result.disease;
    },
    trait_delta: (result, person, gameCtx) => {
        if (!person || !person.traits || typeof applyDomainTraitDelta !== 'function') return;
        applyDomainTraitDelta(person, result, {
            isUserChoice: !!gameCtx?.isUserChoice,
            actionSeq: Number.isFinite(gameCtx?.actionSeq) ? gameCtx.actionSeq : null
        });
    },
    set_job: (result, person) => {
        if (!person || typeof result.jobCode !== 'string') return;
        setPersonJob(person, result.jobCode, globalMonths);
    },
    asset_delta: (result, person) => {
        if (typeof result.amount !== 'number' || !Number.isFinite(result.amount)) return;
        familyAssetKrw += result.amount;
        const abs = Math.abs(result.amount);
        let displayText;
        if (abs >= 100_000_000) {
            displayText = `${result.amount > 0 ? '+' : '-'}${Math.floor(abs / 100_000_000)}억원`;
        } else if (abs >= 10_000) {
            displayText = `${result.amount > 0 ? '+' : '-'}${Math.floor(abs / 10_000)}만원`;
        } else {
            displayText = `${result.amount > 0 ? '+' : '-'}${abs.toLocaleString('ko-KR')}원`;
        }
        if (person && typeof floatingTexts !== 'undefined') {
            floatingTexts.push({
                person: person,
                offsetY: -30,
                text: displayText,
                color: result.amount > 0 ? '#f39c12' : '#c0392b',
                alpha: 1
            });
        }
    },
    multi: (result, person, gameCtx) => {
        if (!Array.isArray(result.results)) return;
        for (const subResult of result.results) {
            applyEventResult(subResult, person, gameCtx);
        }
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
        if (Object.prototype.hasOwnProperty.call(result, 'delta')) {
            if (typeof result.delta !== 'number' || !Number.isFinite(result.delta)) {
                errors.push(`${path}.delta: 숫자여야 합니다.`);
            }
        }
    }

    if (result.type === 'set_job') {
        if (typeof result.jobCode !== 'string' || !result.jobCode.trim()) {
            errors.push(`${path}.jobCode: 문자열 직업 코드가 필요합니다.`);
        } else if (!Object.prototype.hasOwnProperty.call(JOB_DEFINITIONS, result.jobCode)) {
            errors.push(`${path}.jobCode: '${result.jobCode}'는 지원되지 않는 직업 코드입니다.`);
        }
    }

    if (result.type === 'asset_delta') {
        if (!Object.prototype.hasOwnProperty.call(result, 'amount') ||
            typeof result.amount !== 'number' || !Number.isFinite(result.amount)) {
            errors.push(`${path}.amount: 유한한 숫자여야 합니다.`);
        }
    }

    if (result.type === 'multi') {
        if (!Array.isArray(result.results) || result.results.length === 0) {
            errors.push(`${path}.results: 1개 이상의 결과 배열이어야 합니다.`);
        } else {
            result.results.forEach((subResult, i) => {
                validateChoiceResult(subResult, `${path}.results[${i}]`, errors);
            });
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

function cloneResult(result) {
    if (!isPlainObject(result)) return result;
    if (result.type === 'multi' && Array.isArray(result.results)) {
        return { ...result, results: result.results.map(cloneResult) };
    }
    return { ...result };
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
                resultText: choice.resultText || null,
                result: cloneResult(choice.result)
            }))
        });
    });

    console.log(`[EVENT VALIDATION] 로드 완료: ${normalized.length}/${rawDefs.length}`);
    return normalized;
}

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

function extractAssetDeltaFromResult(result) {
    if (!isPlainObject(result)) return 0;
    if (result.type === 'asset_delta' && Number.isFinite(result.amount)) return result.amount;
    if (result.type === 'multi' && Array.isArray(result.results)) {
        return result.results.reduce((sum, sub) => sum + extractAssetDeltaFromResult(sub), 0);
    }
    return 0;
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
            per: createRandomDomainTrait('per'),
            val: createRandomDomainTrait('val'),
            hlt: createRandomDomainTrait('hlt')
        },
        disease: null
    };
    applyEventResult({ type: 'disease', disease: '감기' }, resultTestPerson, gameCtx);
    const perBefore = resultTestPerson.traits.per.scores.interpersonal.active;
    applyEventResult({
        type: 'trait_delta',
        domain: 'per',
        attribute: 'interpersonal',
        traitType: 'active',
        delta: 1
    }, resultTestPerson, {
        ...gameCtx,
        isUserChoice: true,
        actionSeq: 1
    });
    applyEventResult({ type: 'set_job', jobCode: 'housekeeper' }, resultTestPerson, gameCtx);
    const assetBefore = (typeof familyAssetKrw !== 'undefined') ? familyAssetKrw : 0;
    applyEventResult({ type: 'asset_delta', amount: 1_000_000 }, resultTestPerson, gameCtx);
    const assetDeltaPassed = (typeof familyAssetKrw === 'undefined') || familyAssetKrw === assetBefore + 1_000_000;
    const multiTestPerson = { ...resultTestPerson, disease: null };
    applyEventResult({ type: 'multi', results: [
        { type: 'disease', disease: '몸살' }
    ]}, multiTestPerson, gameCtx);
    const multiPassed = multiTestPerson.disease === '몸살';
    const resultHandlersPassed = resultTestPerson.disease === '감기'
        && resultTestPerson.traits.per.scores.interpersonal.active === perBefore + 1
        && resultTestPerson.jobCode === 'housekeeper'
        && resultTestPerson.careerStage === 'selected'
        && assetDeltaPassed
        && multiPassed;

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
