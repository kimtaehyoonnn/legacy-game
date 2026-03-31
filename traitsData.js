// 특성 데이터 정의
const TRAITS_DATA = {
    app: [
        { tier: 'SSR', name: '절세미인' },
        { tier: 'SSR', name: '꽃미남' },
        { tier: 'SR', name: '잘생긴편' },
        { tier: 'SR', name: '예쁜편' },
        { tier: 'R', name: '괜찮은외모' },
        { tier: 'R', name: '평범한외모' }
    ]
};

const DOMAIN_TRAIT_SCHEMAS = {
    per: {
        label: '성격',
        attributes: [
            {
                key: 'interpersonal',
                label: '대인관계성',
                types: [
                    { key: 'active', label: '적극교류형', nName: '적극교류' },
                    { key: 'selective', label: '선택교류형', nName: '선택교류' },
                    { key: 'distancing', label: '거리두기형', nName: '거리두기' },
                    { key: 'isolated', label: '고립형', nName: '관계고립' }
                ]
            },
            {
                key: 'emotional',
                label: '감정표현성',
                types: [
                    { key: 'direct', label: '직설적', nName: '표현직설' },
                    { key: 'restrained', label: '절제형', nName: '표현절제' },
                    { key: 'rich', label: '풍부함', nName: '표현풍부' },
                    { key: 'artistic', label: '예술적표현', nName: '표현예술' }
                ]
            },
            {
                key: 'behavior',
                label: '행동성향',
                types: [
                    { key: 'planned', label: '계획형', nName: '행동계획' },
                    { key: 'impulsive', label: '충동형', nName: '행동충동' },
                    { key: 'balanced', label: '균형형', nName: '행동균형' }
                ]
            },
            {
                key: 'selfManagement',
                label: '자기관리',
                types: [
                    { key: 'diligent', label: '성실함', nName: '관리성실' },
                    { key: 'lazy', label: '게으름', nName: '관리게으름' },
                    { key: 'balanced', label: '균형형', nName: '관리균형' }
                ]
            },
            {
                key: 'conflict',
                label: '갈등대응',
                types: [
                    { key: 'negotiation', label: '협상형', nName: '갈등협상' },
                    { key: 'competitive', label: '경쟁적', nName: '갈등경쟁' },
                    { key: 'avoidant', label: '회피형', nName: '갈등회피' },
                    { key: 'breakthrough', label: '정면돌파형', nName: '갈등돌파' }
                ]
            }
        ],
        titles: {
            SSR: [
                {
                    name: '마당발',
                    conditions: [
                        { attribute: 'interpersonal', type: 'active' },
                        { attribute: 'behavior', type: 'balanced' },
                        { attribute: 'selfManagement', type: 'diligent' },
                        { attribute: 'conflict', type: 'negotiation' }
                    ]
                },
                {
                    name: '눈치백단',
                    conditions: [
                        { attribute: 'emotional', type: 'restrained' },
                        { attribute: 'behavior', type: 'planned' },
                        { attribute: 'selfManagement', type: 'balanced' },
                        { attribute: 'conflict', type: 'avoidant' }
                    ]
                },
                {
                    name: '독고다이',
                    conditions: [
                        { attribute: 'interpersonal', type: 'isolated' },
                        { attribute: 'emotional', type: 'direct' },
                        { attribute: 'behavior', type: 'impulsive' },
                        { attribute: 'selfManagement', type: 'lazy' }
                    ]
                },
                {
                    name: '광인',
                    conditions: [
                        { attribute: 'interpersonal', type: 'distancing' },
                        { attribute: 'emotional', type: 'artistic' },
                        { attribute: 'behavior', type: 'impulsive' },
                        { attribute: 'conflict', type: 'breakthrough' }
                    ]
                }
            ],
            SR: [
                {
                    name: '이야기꾼',
                    conditions: [
                        { attribute: 'emotional', type: 'artistic' },
                        { attribute: 'selfManagement', type: 'balanced' },
                        { attribute: 'conflict', type: 'negotiation' }
                    ]
                },
                {
                    name: '능구렁이',
                    conditions: [
                        { attribute: 'interpersonal', type: 'active' },
                        { attribute: 'emotional', type: 'rich' },
                        { attribute: 'conflict', type: 'avoidant' }
                    ]
                },
                {
                    name: '관종',
                    conditions: [
                        { attribute: 'interpersonal', type: 'active' },
                        { attribute: 'emotional', type: 'artistic' },
                        { attribute: 'conflict', type: 'breakthrough' }
                    ]
                },
                {
                    name: '포커페이스',
                    conditions: [
                        { attribute: 'interpersonal', type: 'distancing' },
                        { attribute: 'emotional', type: 'restrained' },
                        { attribute: 'behavior', type: 'planned' }
                    ]
                },
                {
                    name: '야무진놈',
                    conditions: [
                        { attribute: 'interpersonal', type: 'selective' },
                        { attribute: 'behavior', type: 'balanced' },
                        { attribute: 'selfManagement', type: 'diligent' }
                    ]
                }
            ],
            R: [
                {
                    name: '박치기공룡',
                    conditions: [
                        { attribute: 'emotional', type: 'direct' },
                        { attribute: 'conflict', type: 'competitive' }
                    ]
                },
                {
                    name: '인간컴퓨터',
                    conditions: [
                        { attribute: 'emotional', type: 'restrained' },
                        { attribute: 'selfManagement', type: 'diligent' }
                    ]
                },
                {
                    name: '묵묵',
                    conditions: [
                        { attribute: 'interpersonal', type: 'isolated' },
                        { attribute: 'emotional', type: 'restrained' }
                    ]
                },
                {
                    name: '스노브',
                    conditions: [
                        { attribute: 'interpersonal', type: 'selective' },
                        { attribute: 'emotional', type: 'artistic' }
                    ]
                },
                {
                    name: '츤데레',
                    conditions: [
                        { attribute: 'emotional', type: 'restrained' },
                        { attribute: 'conflict', type: 'avoidant' }
                    ]
                },
                {
                    name: '시인병',
                    conditions: [
                        { attribute: 'emotional', type: 'artistic' },
                        { attribute: 'selfManagement', type: 'lazy' }
                    ]
                },
                {
                    name: '울보',
                    conditions: [
                        { attribute: 'emotional', type: 'rich' },
                        { attribute: 'behavior', type: 'impulsive' }
                    ]
                },
                {
                    name: '인간탱탱볼',
                    conditions: [
                        { attribute: 'behavior', type: 'impulsive' },
                        { attribute: 'conflict', type: 'breakthrough' }
                    ]
                }
            ]
        }
    },
    val: {
        label: '가치관',
        attributes: [
            {
                key: 'priority',
                label: '우선순위',
                types: [
                    { key: 'personal', label: '개인', nName: '개인우선' },
                    { key: 'family', label: '가족', nName: '가족우선' },
                    { key: 'nation', label: '국가', nName: '국가우선' },
                    { key: 'workplace', label: '직장', nName: '직장우선' }
                ]
            },
            {
                key: 'goal',
                label: '목표지향',
                types: [
                    { key: 'stability', label: '안정', nName: '안정지향' },
                    { key: 'growth', label: '성장', nName: '성장지향' },
                    { key: 'freedom', label: '자유', nName: '자유지향' },
                    { key: 'equality', label: '평등', nName: '평등지향' },
                    { key: 'joy', label: '즐거움', nName: '즐거움지향' }
                ]
            },
            {
                key: 'morality',
                label: '도덕기준',
                types: [
                    { key: 'principle', label: '원칙', nName: '원칙중심' },
                    { key: 'consequence', label: '결과', nName: '결과중심' },
                    { key: 'emotion', label: '감정', nName: '감정중심' }
                ]
            },
            {
                key: 'relation',
                label: '관계기준',
                types: [
                    { key: 'loyalty', label: '충성', nName: '충성기준' },
                    { key: 'fairness', label: '공정', nName: '공정기준' },
                    { key: 'love', label: '사랑', nName: '사랑기준' },
                    { key: 'pragmatic', label: '실리', nName: '실리기준' }
                ]
            },
            {
                key: 'risk',
                label: '위험선호도',
                types: [
                    { key: 'high', label: '높음', nName: '위험선호고' },
                    { key: 'medium', label: '보통', nName: '위험선호중' },
                    { key: 'low', label: '낮음', nName: '위험선호저' }
                ]
            }
        ],
        titles: {
            SSR: [
                {
                    name: '혁명가',
                    conditions: [
                        { attribute: 'priority', type: 'family' },
                        { attribute: 'morality', type: 'consequence' },
                        { attribute: 'relation', type: 'fairness' },
                        { attribute: 'risk', type: 'high' }
                    ]
                },
                {
                    name: '애국자',
                    conditions: [
                        { attribute: 'priority', type: 'nation' },
                        { attribute: 'goal', type: 'growth' },
                        { attribute: 'morality', type: 'principle' },
                        { attribute: 'relation', type: 'loyalty' }
                    ]
                },
                {
                    name: '자유인',
                    conditions: [
                        { attribute: 'priority', type: 'personal' },
                        { attribute: 'goal', type: 'freedom' },
                        { attribute: 'relation', type: 'love' },
                        { attribute: 'risk', type: 'medium' }
                    ]
                }
            ],
            SR: [
                {
                    name: '선비',
                    conditions: [
                        { attribute: 'priority', type: 'family' },
                        { attribute: 'goal', type: 'growth' },
                        { attribute: 'morality', type: 'principle' }
                    ]
                },
                {
                    name: '승부사',
                    conditions: [
                        { attribute: 'morality', type: 'consequence' },
                        { attribute: 'relation', type: 'pragmatic' },
                        { attribute: 'risk', type: 'high' }
                    ]
                },
                {
                    name: '안전제일',
                    conditions: [
                        { attribute: 'priority', type: 'workplace' },
                        { attribute: 'goal', type: 'stability' },
                        { attribute: 'risk', type: 'low' }
                    ]
                },
                {
                    name: '유랑자',
                    conditions: [
                        { attribute: 'goal', type: 'freedom' },
                        { attribute: 'morality', type: 'emotion' },
                        { attribute: 'risk', type: 'medium' }
                    ]
                },
                {
                    name: '수평계',
                    conditions: [
                        { attribute: 'goal', type: 'equality' },
                        { attribute: 'morality', type: 'principle' },
                        { attribute: 'relation', type: 'fairness' }
                    ]
                },
                {
                    name: '달빛광대',
                    conditions: [
                        { attribute: 'priority', type: 'personal' },
                        { attribute: 'goal', type: 'joy' },
                        { attribute: 'relation', type: 'love' }
                    ]
                }
            ],
            R: [
                {
                    name: '꼰대',
                    conditions: [
                        { attribute: 'priority', type: 'workplace' },
                        { attribute: 'morality', type: 'principle' }
                    ]
                },
                {
                    name: '이상주의자',
                    conditions: [
                        { attribute: 'priority', type: 'nation' },
                        { attribute: 'goal', type: 'equality' }
                    ]
                },
                {
                    name: '기회주의자',
                    conditions: [
                        { attribute: 'goal', type: 'growth' },
                        { attribute: 'relation', type: 'pragmatic' }
                    ]
                },
                {
                    name: '사랑꾼',
                    conditions: [
                        { attribute: 'priority', type: 'family' },
                        { attribute: 'relation', type: 'love' }
                    ]
                },
                {
                    name: '히피',
                    conditions: [
                        { attribute: 'goal', type: 'joy' },
                        { attribute: 'morality', type: 'emotion' }
                    ]
                }
            ]
        }
    },
    hlt: {
        label: '건강',
        attributes: [
            {
                key: 'fitness',
                label: '기본체력',
                types: [
                    { key: 'strong', label: '강함', nName: '체력강함' },
                    { key: 'normal', label: '보통', nName: '체력보통' },
                    { key: 'weak', label: '약함', nName: '체력약함' }
                ]
            },
            {
                key: 'recovery',
                label: '회복력',
                types: [
                    { key: 'fast', label: '빠름', nName: '회복빠름' },
                    { key: 'slow', label: '느림', nName: '회복느림' },
                    { key: 'normal', label: '보통', nName: '회복보통' }
                ]
            },
            {
                key: 'vulnerability',
                label: '취약점',
                types: [
                    { key: 'none', label: '없음', nName: '취약없음' },
                    { key: 'respiratory', label: '호흡기', nName: '호흡취약' },
                    { key: 'digestive', label: '소화기', nName: '소화취약' },
                    { key: 'heart', label: '심장', nName: '심장취약' },
                    { key: 'hair', label: '머리숱', nName: '머리숱취약' }
                ]
            },
            {
                key: 'libido',
                label: '성적욕구',
                types: [
                    { key: 'high', label: '높음', nName: '성욕높음' },
                    { key: 'normal', label: '보통', nName: '성욕보통' },
                    { key: 'low', label: '낮음', nName: '성욕낮음' }
                ]
            },
            {
                key: 'stress',
                label: '스트레스내성',
                types: [
                    { key: 'high', label: '높음', nName: '스트레스내성높음' },
                    { key: 'normal', label: '보통', nName: '스트레스내성보통' },
                    { key: 'low', label: '낮음', nName: '스트레스내성낮음' }
                ]
            }
        ],
        titles: {
            SSR: [
                {
                    name: '무병장수',
                    conditions: [
                        { attribute: 'fitness', type: 'strong' },
                        { attribute: 'recovery', type: 'fast' },
                        { attribute: 'vulnerability', type: 'none' },
                        { attribute: 'stress', type: 'high' }
                    ]
                },
                {
                    name: '개복치',
                    conditions: [
                        { attribute: 'fitness', type: 'weak' },
                        { attribute: 'recovery', type: 'slow' },
                        { attribute: 'libido', type: 'high' },
                        { attribute: 'stress', type: 'low' }
                    ]
                },
                {
                    name: '지극평범',
                    conditions: [
                        { attribute: 'fitness', type: 'normal' },
                        { attribute: 'recovery', type: 'normal' },
                        { attribute: 'libido', type: 'normal' },
                        { attribute: 'stress', type: 'normal' }
                    ]
                }
            ],
            SR: [
                {
                    name: '인자강',
                    conditions: [
                        { attribute: 'fitness', type: 'strong' },
                        { attribute: 'vulnerability', type: 'none' },
                        { attribute: 'stress', type: 'high' }
                    ]
                },
                {
                    name: '에너자이저',
                    conditions: [
                        { attribute: 'fitness', type: 'strong' },
                        { attribute: 'recovery', type: 'fast' },
                        { attribute: 'libido', type: 'high' }
                    ]
                },
                {
                    name: '변강쇠',
                    conditions: [
                        { attribute: 'recovery', type: 'fast' },
                        { attribute: 'vulnerability', type: 'none' },
                        { attribute: 'libido', type: 'high' }
                    ]
                },
                {
                    name: '비실이',
                    conditions: [
                        { attribute: 'fitness', type: 'weak' },
                        { attribute: 'recovery', type: 'slow' },
                        { attribute: 'stress', type: 'low' }
                    ]
                },
                {
                    name: '무욕인',
                    conditions: [
                        { attribute: 'recovery', type: 'slow' },
                        { attribute: 'stress', type: 'low' },
                        { attribute: 'libido', type: 'low' }
                    ]
                },
                {
                    name: '보통평범',
                    conditions: [
                        { attribute: 'fitness', type: 'normal' },
                        { attribute: 'recovery', type: 'normal' },
                        { attribute: 'stress', type: 'normal' }
                    ]
                }
            ],
            R: [
                {
                    name: '뿡뿡이',
                    conditions: [
                        { attribute: 'vulnerability', type: 'digestive' },
                        { attribute: 'stress', type: 'high' }
                    ]
                },
                {
                    name: '대머리수리',
                    conditions: [
                        { attribute: 'vulnerability', type: 'hair' },
                        { attribute: 'libido', type: 'high' }
                    ]
                },
                {
                    name: '튼튼이',
                    conditions: [
                        { attribute: 'fitness', type: 'strong' },
                        { attribute: 'stress', type: 'high' }
                    ]
                },
                {
                    name: '멘탈좀비',
                    conditions: [
                        { attribute: 'recovery', type: 'fast' },
                        { attribute: 'stress', type: 'low' }
                    ]
                },
                {
                    name: '약간평범',
                    conditions: [
                        { attribute: 'fitness', type: 'normal' },
                        { attribute: 'recovery', type: 'normal' }
                    ]
                }
            ]
        }
    }
};

const DOMAIN_TIER_ORDER = ['SSR', 'SR', 'R'];
const DOMAIN_TRAIT_INDEX = buildDomainTraitIndexes();

function buildDomainTraitIndexes() {
    const result = {};

    Object.entries(DOMAIN_TRAIT_SCHEMAS).forEach(([domainKey, schema]) => {
        const attributeByKey = {};
        const typeByCompositeKey = {};
        const fallbackOrder = [];

        schema.attributes.forEach((attributeDef, attributeOrder) => {
            const typeByKey = {};
            attributeDef.types.forEach((typeDef, typeOrder) => {
                const compositeKey = toCompositeTypeKey(attributeDef.key, typeDef.key);
                const entry = {
                    domainKey,
                    attributeKey: attributeDef.key,
                    attributeLabel: attributeDef.label,
                    attributeOrder,
                    typeKey: typeDef.key,
                    typeLabel: typeDef.label,
                    typeOrder,
                    nName: typeDef.nName,
                    compositeKey
                };
                typeByKey[typeDef.key] = entry;
                typeByCompositeKey[compositeKey] = entry;
                fallbackOrder.push(entry);
            });

            attributeByKey[attributeDef.key] = {
                key: attributeDef.key,
                label: attributeDef.label,
                order: attributeOrder,
                types: [...attributeDef.types],
                typeByKey
            };
        });

        result[domainKey] = {
            attributeByKey,
            typeByCompositeKey,
            fallbackOrder
        };
    });

    return result;
}

function toCompositeTypeKey(attributeKey, typeKey) {
    return `${attributeKey}.${typeKey}`;
}

function getRandomTrait(category) {
    if (!TRAITS_DATA[category]) return { tier: 'N', name: '평범함' };
    const traits = TRAITS_DATA[category];
    const picked = traits[Math.floor(Math.random() * traits.length)];
    return { ...picked };
}

function getDomainTraitSchema(domainKey) {
    return DOMAIN_TRAIT_SCHEMAS[domainKey] || null;
}

function randomInitialTraitScore() {
    return Math.floor(Math.random() * 6);
}

function createRandomDomainTrait(domainKey) {
    const schema = getDomainTraitSchema(domainKey);
    if (!schema) {
        return {
            domainKey,
            tier: 'N',
            name: '미정',
            scores: {},
            representatives: {},
            representativeLabels: {},
            fallbackRepresentative: null,
            lastUserChangeSeqByType: {}
        };
    }

    const scores = {};
    schema.attributes.forEach(attributeDef => {
        scores[attributeDef.key] = {};
        attributeDef.types.forEach(typeDef => {
            scores[attributeDef.key][typeDef.key] = randomInitialTraitScore();
        });
    });

    const trait = {
        domainKey,
        tier: 'N',
        name: '미정',
        scores,
        representatives: {},
        representativeLabels: {},
        fallbackRepresentative: null,
        lastUserChangeSeqByType: {}
    };

    return resolveDomainTrait(trait);
}

function createInheritedDomainTrait(domainKey, parentTraitA, parentTraitB) {
    const schema = getDomainTraitSchema(domainKey);
    if (!schema) return createRandomDomainTrait(domainKey);

    const scores = {};
    schema.attributes.forEach(attributeDef => {
        scores[attributeDef.key] = {};
        attributeDef.types.forEach(typeDef => {
            const attributeKey = attributeDef.key;
            const typeKey = typeDef.key;
            const parentAValue = readDomainTraitScore(parentTraitA, attributeKey, typeKey);
            const parentBValue = readDomainTraitScore(parentTraitB, attributeKey, typeKey);
            const fallbackValue = randomInitialTraitScore();
            const selectedValue = Math.random() < 0.5
                ? (Number.isFinite(parentAValue) ? parentAValue : fallbackValue)
                : (Number.isFinite(parentBValue) ? parentBValue : fallbackValue);
            scores[attributeKey][typeKey] = selectedValue;
        });
    });

    const trait = {
        domainKey,
        tier: 'N',
        name: '미정',
        scores,
        representatives: {},
        representativeLabels: {},
        fallbackRepresentative: null,
        lastUserChangeSeqByType: {}
    };

    return resolveDomainTrait(trait);
}

function readDomainTraitScore(trait, attributeKey, typeKey) {
    if (!trait || !trait.scores) return undefined;
    if (!Object.prototype.hasOwnProperty.call(trait.scores, attributeKey)) return undefined;
    return trait.scores[attributeKey][typeKey];
}

function ensureDomainTraitShape(domainKey, trait) {
    const schema = getDomainTraitSchema(domainKey);
    if (!schema) return trait;

    if (!trait || typeof trait !== 'object') {
        return createRandomDomainTrait(domainKey);
    }

    if (!trait.scores || typeof trait.scores !== 'object') {
        trait.scores = {};
    }

    schema.attributes.forEach(attributeDef => {
        if (!trait.scores[attributeDef.key] || typeof trait.scores[attributeDef.key] !== 'object') {
            trait.scores[attributeDef.key] = {};
        }

        attributeDef.types.forEach(typeDef => {
            if (!Number.isFinite(trait.scores[attributeDef.key][typeDef.key])) {
                trait.scores[attributeDef.key][typeDef.key] = randomInitialTraitScore();
            }
        });
    });

    if (!trait.lastUserChangeSeqByType || typeof trait.lastUserChangeSeqByType !== 'object') {
        trait.lastUserChangeSeqByType = {};
    }

    return trait;
}

function resolveDomainTrait(trait, options = {}) {
    const schema = getDomainTraitSchema(trait?.domainKey);
    if (!schema) return trait;

    const index = DOMAIN_TRAIT_INDEX[trait.domainKey];
    const changedTypeCompositeKeys = options.changedTypeCompositeKeys instanceof Set
        ? options.changedTypeCompositeKeys
        : new Set();

    const representatives = {};
    const representativeLabels = {};

    schema.attributes.forEach(attributeDef => {
        const top = pickTopTypeForAttribute(
            trait,
            attributeDef,
            index,
            changedTypeCompositeKeys
        );

        representatives[attributeDef.key] = top.typeKey;
        representativeLabels[attributeDef.key] = top.typeLabel;
    });

    trait.representatives = representatives;
    trait.representativeLabels = representativeLabels;

    for (const tier of DOMAIN_TIER_ORDER) {
        const titleRules = schema.titles[tier] || [];
        for (const titleRule of titleRules) {
            const allMatched = titleRule.conditions.every(condition => (
                representatives[condition.attribute] === condition.type
            ));
            if (allMatched) {
                trait.tier = tier;
                trait.name = titleRule.name;
                trait.fallbackRepresentative = pickTopTypeAcrossDomain(trait, index, changedTypeCompositeKeys);
                return trait;
            }
        }
    }

    const fallbackTop = pickTopTypeAcrossDomain(trait, index, changedTypeCompositeKeys);
    trait.tier = 'N';
    trait.name = fallbackTop.nName || fallbackTop.typeLabel;
    trait.fallbackRepresentative = fallbackTop;
    return trait;
}

function pickTopTypeForAttribute(trait, attributeDef, index, changedTypeCompositeKeys) {
    const scoresByType = trait.scores[attributeDef.key] || {};

    let maxScore = -Infinity;
    attributeDef.types.forEach(typeDef => {
        const score = Number(scoresByType[typeDef.key]) || 0;
        if (score > maxScore) maxScore = score;
    });

    let candidates = attributeDef.types.filter(typeDef => (Number(scoresByType[typeDef.key]) || 0) === maxScore);
    if (candidates.length <= 1) {
        const selected = candidates[0] || attributeDef.types[0];
        const selectedEntry = index.typeByCompositeKey[toCompositeTypeKey(attributeDef.key, selected.key)];
        return selectedEntry;
    }

    const maxSeq = getMaxUserChangeSeq(candidates, attributeDef.key, trait.lastUserChangeSeqByType);
    if (maxSeq > 0) {
        candidates = candidates.filter(typeDef => {
            const compositeKey = toCompositeTypeKey(attributeDef.key, typeDef.key);
            return Number(trait.lastUserChangeSeqByType[compositeKey]) === maxSeq;
        });
    }

    if (candidates.length > 1 && changedTypeCompositeKeys.size > 0) {
        const actionChangedCandidates = candidates.filter(typeDef => {
            const compositeKey = toCompositeTypeKey(attributeDef.key, typeDef.key);
            return changedTypeCompositeKeys.has(compositeKey);
        });
        if (actionChangedCandidates.length > 0) {
            candidates = actionChangedCandidates;
        }
    }

    const selected = candidates[0];
    return index.typeByCompositeKey[toCompositeTypeKey(attributeDef.key, selected.key)];
}

function pickTopTypeAcrossDomain(trait, index, changedTypeCompositeKeys) {
    let maxScore = -Infinity;
    index.fallbackOrder.forEach(entry => {
        const score = Number(trait.scores[entry.attributeKey]?.[entry.typeKey]) || 0;
        if (score > maxScore) maxScore = score;
    });

    let candidates = index.fallbackOrder.filter(entry => (
        (Number(trait.scores[entry.attributeKey]?.[entry.typeKey]) || 0) === maxScore
    ));

    const maxSeq = getMaxUserChangeSeq(
        candidates.map(entry => ({ key: entry.typeKey })),
        null,
        trait.lastUserChangeSeqByType,
        candidates
    );

    if (maxSeq > 0) {
        candidates = candidates.filter(entry => (
            Number(trait.lastUserChangeSeqByType[entry.compositeKey]) === maxSeq
        ));
    }

    if (candidates.length > 1 && changedTypeCompositeKeys.size > 0) {
        const actionChangedCandidates = candidates.filter(entry => changedTypeCompositeKeys.has(entry.compositeKey));
        if (actionChangedCandidates.length > 0) {
            candidates = actionChangedCandidates;
        }
    }

    return candidates[0] || index.fallbackOrder[0];
}

function getMaxUserChangeSeq(candidates, attributeKey, lastUserChangeSeqByType, prebuiltEntries = null) {
    let maxSeq = 0;

    if (Array.isArray(prebuiltEntries)) {
        prebuiltEntries.forEach(entry => {
            const seq = Number(lastUserChangeSeqByType[entry.compositeKey]) || 0;
            if (seq > maxSeq) maxSeq = seq;
        });
        return maxSeq;
    }

    candidates.forEach(typeDef => {
        const compositeKey = toCompositeTypeKey(attributeKey, typeDef.key);
        const seq = Number(lastUserChangeSeqByType[compositeKey]) || 0;
        if (seq > maxSeq) maxSeq = seq;
    });

    return maxSeq;
}

function applyDomainTraitDelta(person, result, options = {}) {
    if (!person || !person.traits || !result) return false;

    const domainKey = result.domain;
    const attributeKey = result.attribute;
    const typeKey = result.traitType;
    const delta = Number.isFinite(result.delta) ? Math.trunc(result.delta) : 0;

    if (!domainKey || !attributeKey || !typeKey || delta === 0) {
        return false;
    }

    const schema = getDomainTraitSchema(domainKey);
    const index = DOMAIN_TRAIT_INDEX[domainKey];
    if (!schema || !index || !index.attributeByKey[attributeKey]) {
        return false;
    }

    const attributeMeta = index.attributeByKey[attributeKey];
    if (!attributeMeta.typeByKey[typeKey]) {
        return false;
    }

    if (!person.traits[domainKey]) {
        person.traits[domainKey] = createRandomDomainTrait(domainKey);
    }

    const trait = ensureDomainTraitShape(domainKey, person.traits[domainKey]);
    const prevValue = Number(trait.scores[attributeKey][typeKey]) || 0;
    trait.scores[attributeKey][typeKey] = prevValue + delta;

    const changedCompositeKey = toCompositeTypeKey(attributeKey, typeKey);
    if (options.isUserChoice && Number.isFinite(options.actionSeq)) {
        trait.lastUserChangeSeqByType[changedCompositeKey] = Math.trunc(options.actionSeq);
    }

    resolveDomainTrait(trait, {
        changedTypeCompositeKeys: new Set([changedCompositeKey])
    });

    return true;
}

function getDomainTraitRepresentativeSummary(domainKey, trait, withAttributeLabel = true) {
    const schema = getDomainTraitSchema(domainKey);
    if (!schema || !trait || !trait.representatives) return '';

    const items = schema.attributes.map(attributeDef => {
        const pickedTypeKey = trait.representatives[attributeDef.key];
        const pickedType = attributeDef.types.find(typeDef => typeDef.key === pickedTypeKey);
        const pickedLabel = pickedType ? pickedType.label : '-';
        return withAttributeLabel
            ? `${attributeDef.label}:${pickedLabel}`
            : pickedLabel;
    });

    return items.join(', ');
}

function createRandomCoreTraits() {
    return {
        per: createRandomDomainTrait('per'),
        val: createRandomDomainTrait('val'),
        hlt: createRandomDomainTrait('hlt')
    };
}

function createInheritedCoreTraits(parentTraitsA, parentTraitsB) {
    return {
        per: createInheritedDomainTrait('per', parentTraitsA?.per, parentTraitsB?.per),
        val: createInheritedDomainTrait('val', parentTraitsA?.val, parentTraitsB?.val),
        hlt: createInheritedDomainTrait('hlt', parentTraitsA?.hlt, parentTraitsB?.hlt)
    };
}

// 비주얼 조합 → 특성 강제 부여 규칙
// condition: visuals 키-값 조합 (명시된 키만 비교, 나머지 무시)
// override: 덮어쓸 특성 (app/per/val/hlt 중 원하는 것만)
const VISUAL_TRAIT_RULES = [
    { condition: { frontHair: 'fFHA', face: 'Fa', eyes: 'EA', nose: 'NA', mouth: 'MA' }, override: { app: { tier: 'SSR', name: '여신강림' } } },
];

function applyVisualTraitRules(visuals, traits) {
    for (const rule of VISUAL_TRAIT_RULES) {
        const match = Object.entries(rule.condition)
            .every(([key, val]) => visuals[key] === val);
        if (match) {
            for (const [cat, trait] of Object.entries(rule.override)) {
                traits[cat] = trait;
            }
        }
    }
}
