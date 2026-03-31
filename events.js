// 데이터 기반 일반 이벤트 정의
// 스키마: { code, text, probability, condition, choices[] }
// condition: { op:'and'|'or', conditions:[...] } 또는 { target, field, operator, value }
// choices: [{ id, text, result:{ type:'none'|'disease'|'trait_delta'|'set_job', ... } }]
const GENERAL_EVENTS = [
    {
        code: 'career_initial_choice',
        text: '첫 직업을 선택할 시기가 왔다.',
        probability: 1,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 20 },
                { target: 'person', field: 'careerStage', operator: 'eq', value: 'none' }
            ]
        },
        choices: [
            { id: 'housekeeper', text: '하우스키퍼', result: { type: 'set_job', jobCode: 'housekeeper' } },
            { id: 'student', text: '학생', result: { type: 'set_job', jobCode: 'student' } },
            { id: 'delivery_rider', text: '배달기사', result: { type: 'set_job', jobCode: 'delivery_rider' } },
            { id: 'musician', text: '음악가', result: { type: 'set_job', jobCode: 'musician' } }
        ]
    },
    {
        code: 'career_post_student_choice',
        text: '학생 생활을 마치고 다음 진로를 선택할 때다.',
        probability: 1,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'careerStage', operator: 'eq', value: 'selected' },
                { target: 'person', field: 'jobCode', operator: 'eq', value: 'student' },
                { target: 'person', field: 'monthsSinceJobAssigned', operator: 'gte', value: 60 }
            ]
        },
        choices: [
            { id: 'housekeeper', text: '하우스키퍼', result: { type: 'set_job', jobCode: 'housekeeper' } },
            { id: 'highschool_teacher', text: '고등학교 선생', result: { type: 'set_job', jobCode: 'highschool_teacher' } },
            { id: 'lawyer', text: '변호사', result: { type: 'set_job', jobCode: 'lawyer' } },
            { id: 'corporate_employee', text: '대기업 사원', result: { type: 'set_job', jobCode: 'corporate_employee' } }
        ]
    },
    {
        code: 'mart_beg_item',
        text: '마트에 가서 물건을 사달라고 조른다.',
        probability: 0.95,
        condition: { target: 'person', field: 'age', operator: 'eq', value: 5 },
        choices: [
            { id: 'strict', text: '엄하게 혼낸다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'spoil',  text: '아이의 요구를 들어준다.', result: { type: 'trait_delta', trait: 'val', delta: -1 } }
        ]
    },
    {
        code: 'class_urgent_pooping',
        text: '초등학교 수업 시간에 갑자기 오줌이 마렵다.',
        probability: 0.8,
        condition: { target: 'person', field: 'age', operator: 'eq', value: 8 },
        choices: [
            { id: 'wet',  text: '바지에 지린다.',        resultText: '반 친구들이 모두 보고 말았습니다. 대참사가 발생했습니다.',    result: { type: 'trait_delta', trait: 'per', delta: -2 } },
            { id: 'hold', text: '용기를 내서 참아본다.', resultText: '간신히 참아냈습니다.',                                            result: { type: 'none' } },
            { id: 'drip', text: '조금씩 내보내며 버틴다.', resultText: '조절에 실패했습니다. 대참사가 발생했습니다.',                  result: { type: 'trait_delta', trait: 'per', delta: -1 } }
        ]
    },
    {
        code: 'first_crush',
        text: '짝꿍이 마음에 든다.',
        probability: 0.9,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 11 },
                { target: 'person', field: 'isMarried', operator: 'eq', value: false }
            ]
        },
        choices: [
            { id: 'confess',  text: '솔직하게 마음을 고백한다.', result: { type: 'none' } },
            { id: 'tsundere', text: '맘에 들지만 싫어하는 척 한다.', result: { type: 'none' } }
        ]
    },
    {
        code: 'middle_school_chuunibyou',
        text: '사춘기(중2병)이 생긴다. 어떻게 할까?',
        probability: 0.95,
        condition: { target: 'person', field: 'age', operator: 'eq', value: 15 },
        choices: [
            { id: 'obey',    text: '부모님께 순종한다.',           resultText: '당신은 착한 아이입니다.',                                result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'dyehair', text: '반항하기 위해 머리를 물들인다.', resultText: '염색에 실패해 학교에서 놀림을 받습니다. 매력이 떨어집니다.', result: { type: 'trait_delta', trait: 'app', delta: -2 } },
            { id: 'runaway', text: '가출한다.',                    result: { type: 'trait_delta', trait: 'hlt', delta: -1 } }
        ]
    },
    {
        code: 'prepare_college_exam',
        text: '19살, 대입과 진로를 선택해야 할 시간이다.',
        probability: 0.95,
        condition: { target: 'person', field: 'age', operator: 'eq', value: 19 },
        choices: [
            { id: 'elite',  text: '명문 대학교로 진학한다.', resultText: '명문 대학교에 입학했습니다.',               result: { type: 'set_job', jobCode: 'student' } },
            { id: 'normal', text: '일반 대학교로 진학한다.', resultText: '대학교에 입학했습니다.',                   result: { type: 'set_job', jobCode: 'student' } },
            { id: 'work',   text: '취직에 나선다.',           resultText: '좋은 직장을 얻길 바랍니다!',             result: { type: 'none' } },
            { id: 'neet',   text: '아직은 백수가 좋아.',       resultText: '당신은 불효자의 길을 걷습니다!',         result: { type: 'trait_delta', trait: 'val', delta: -2 } }
        ]
    },
    {
        code: 'start_part_time_job',
        text: '아르바이트를 한다.',
        probability: 0.78,
        condition: {
            op: 'or',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 24 },
                {
                    op: 'and',
                    conditions: [
                        { target: 'person', field: 'age', operator: 'eq', value: 25 },
                        { target: 'person', field: 'isMarried', operator: 'eq', value: false }
                    ]
                }
            ]
        },
        choices: [
            { id: 'a', text: '서비스직에 도전한다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'b', text: '야간 근무를 택한다.', result: { type: 'disease', disease: '감기' } },
            { id: 'c', text: '적당히 경험만 쌓는다.', result: { type: 'none' } },
            { id: 'd', text: '조건이 나빠 바로 그만둔다.', result: { type: 'trait_delta', trait: 'val', delta: -1 } }
        ]
    },
    {
        code: 'get_first_fulltime_job',
        text: '취직을 한다.',
        probability: 0.74,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 28 },
                { target: 'person', field: 'disease', operator: 'not_in', value: ['혼절', '병사'] }
            ]
        },
        choices: [
            { id: 'a', text: '안정적인 회사를 고른다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'b', text: '도전적인 스타트업을 택한다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'c', text: '입사 후 번아웃이 온다.', result: { type: 'disease', disease: '몸살' } },
            { id: 'd', text: '일단 다녀보고 판단한다.', result: { type: 'none' } }
        ]
    },
    {
        code: 'workplace_unfair_treatment',
        text: '직장에서 부당한 대우를 받는다.',
        probability: 0.62,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 32 },
                { target: 'person', field: 'gender', operator: 'in', value: ['M', 'F'] }
            ]
        },
        choices: [
            { id: 'a', text: '정식으로 문제를 제기한다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'b', text: '당분간 참고 버틴다.', result: { type: 'trait_delta', trait: 'val', delta: -1 } },
            { id: 'c', text: '즉시 이직을 준비한다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'd', text: '스트레스로 몸살이 난다.', result: { type: 'disease', disease: '몸살' } }
        ]
    },
    {
        code: 'viral_sns_post',
        text: 'SNS에 올린 글이 대박이 난다.',
        probability: 0.33,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 37 },
                { target: 'game', field: 'year', operator: 'gte', value: 15 }
            ]
        },
        choices: [
            { id: 'a', text: '콘텐츠 활동을 본격화한다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'b', text: '관심이 부담되어 숨는다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } },
            { id: 'c', text: '반응을 차분히 관찰한다.', result: { type: 'none' } },
            { id: 'd', text: '무리하게 달리다 지친다.', result: { type: 'disease', disease: '감기' } }
        ]
    },
    {
        code: 'prepare_second_chapter',
        text: '인생의 2막을 준비한다.',
        probability: 0.65,
        condition: { target: 'person', field: 'age', operator: 'eq', value: 44 },
        choices: [
            { id: 'a', text: '새로운 공부를 시작한다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'b', text: '건강 루틴을 만든다.', result: { type: 'trait_delta', trait: 'hlt', delta: 1 } },
            { id: 'c', text: '현 상태를 유지한다.', result: { type: 'none' } },
            { id: 'd', text: '변화를 미루고 불안해한다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } }
        ]
    },
    {
        code: 'buy_lottery_ticket',
        text: '로또를 산다.',
        probability: 0.58,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 49 },
                { target: 'person', field: 'disease', operator: 'not_in', value: ['혼절', '병사'] }
            ]
        },
        choices: [
            { id: 'a', text: '한 장만 산다.', result: { type: 'none' } },
            { id: 'b', text: '여러 장을 산다.', result: { type: 'trait_delta', trait: 'val', delta: -1 } },
            { id: 'c', text: '자동 번호로 산다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'd', text: '안 사고 지나간다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } }
        ]
    },
    {
        code: 'go_on_trip',
        text: '여행을 간다.',
        probability: 0.72,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 54 },
                { target: 'game', field: 'alivePopulation', operator: 'gte', value: 1 }
            ]
        },
        choices: [
            { id: 'a', text: '혼자 조용한 여행을 떠난다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'b', text: '빡빡한 일정으로 여행한다.', result: { type: 'disease', disease: '감기' } },
            { id: 'c', text: '가까운 근교만 다녀온다.', result: { type: 'none' } },
            { id: 'd', text: '여행 대신 휴식을 택한다.', result: { type: 'trait_delta', trait: 'hlt', delta: 1 } }
        ]
    },
    {
        code: 'catch_cold',
        text: '감기에 걸린다.',
        probability: 0.85,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 59 },
                { target: 'person', field: 'disease', operator: 'eq', value: null }
            ]
        },
        choices: [
            { id: 'a', text: '충분히 쉬고 회복한다.', result: { type: 'disease', disease: null } },
            { id: 'b', text: '약만 먹고 버틴다.', result: { type: 'disease', disease: '감기' } },
            { id: 'c', text: '무리해서 더 악화된다.', result: { type: 'disease', disease: '몸살' } },
            { id: 'd', text: '체력을 키우기 시작한다.', result: { type: 'trait_delta', trait: 'hlt', delta: 1 } }
        ]
    },
    {
        code: 'lose_appetite',
        text: '밥이 먹기 싫어진다.',
        probability: 0.67,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 65 },
                { target: 'person', field: 'disease', operator: 'in', value: [null, '감기', '몸살'] }
            ]
        },
        choices: [
            { id: 'a', text: '식단을 가볍게 조정한다.', result: { type: 'none' } },
            { id: 'b', text: '억지로 거르며 버틴다.', result: { type: 'disease', disease: '몸살' } },
            { id: 'c', text: '건강 검진을 받아본다.', result: { type: 'trait_delta', trait: 'hlt', delta: 1 } },
            { id: 'd', text: '기분 탓이라 생각하고 넘긴다.', result: { type: 'trait_delta', trait: 'val', delta: -1 } }
        ]
    },
    {
        code: 'life_gets_comfortable',
        text: '삶이 갑자기 편안해진다.',
        probability: 0.41,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 70 },
                { target: 'game', field: 'year', operator: 'gte', value: 20 }
            ]
        },
        choices: [
            { id: 'a', text: '느긋하게 일상을 즐긴다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'b', text: '여유를 건강 관리에 쓴다.', result: { type: 'trait_delta', trait: 'hlt', delta: 1 } },
            { id: 'c', text: '별다른 변화는 없다.', result: { type: 'none' } },
            { id: 'd', text: '긴장이 풀려 무기력해진다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } }
        ]
    },
    {
        code: 'look_at_the_sky',
        text: '하늘을 바라본다.',
        probability: 0.55,
        condition: {
            op: 'or',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 73 },
                {
                    op: 'and',
                    conditions: [
                        { target: 'person', field: 'age', operator: 'eq', value: 74 },
                        { target: 'person', field: 'disease', operator: 'neq', value: '병사' }
                    ]
                }
            ]
        },
        choices: [
            { id: 'a', text: '지난 삶을 천천히 돌아본다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'b', text: '앞으로 할 일을 정리한다.', result: { type: 'none' } },
            { id: 'c', text: '살짝 우울해진다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } },
            { id: 'd', text: '산책을 시작한다.', result: { type: 'trait_delta', trait: 'hlt', delta: 1 } }
        ]
    },
    {
        code: 'drive_a_car',
        text: '자동차를 운전한다.',
        probability: 0.36,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 79 },
                { target: 'person', field: 'disease', operator: 'not_in', value: ['혼절', '병사'] }
            ]
        },
        choices: [
            { id: 'a', text: '안전 운전을 최우선으로 한다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'b', text: '장거리 운전을 강행한다.', result: { type: 'disease', disease: '몸살' } },
            { id: 'c', text: '짧은 거리만 이동한다.', result: { type: 'none' } },
            { id: 'd', text: '운전을 그만두고 대중교통을 탄다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } }
        ]
    },
    {
        code: 'buy_land',
        text: '땅을 구매한다.',
        probability: 0.24,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 88 },
                { target: 'game', field: 'totalPopulation', operator: 'gte', value: 1 }
            ]
        },
        choices: [
            { id: 'a', text: '작은 땅을 신중히 산다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'b', text: '무리하게 큰 계약을 한다.', result: { type: 'trait_delta', trait: 'val', delta: -1 } },
            { id: 'c', text: '가족과 공동명의로 산다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'd', text: '마음만 먹고 보류한다.', result: { type: 'none' } }
        ]
    },
    {
        code: 'run_for_assembly',
        text: '국회의원에 출마한다.',
        probability: 0.17,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 92 },
                { target: 'person', field: 'gender', operator: 'in', value: ['M', 'F'] }
            ]
        },
        choices: [
            { id: 'a', text: '정책 중심으로 선거를 치른다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'b', text: '공격적인 선거전을 펼친다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } },
            { id: 'c', text: '건강을 우선해 사퇴한다.', result: { type: 'trait_delta', trait: 'hlt', delta: 1 } },
            { id: 'd', text: '상징적으로만 도전한다.', result: { type: 'none' } }
        ]
    },
    {
        code: 'see_yellow_coat',
        text: '노란 코트가 옷가게에 있는 걸 본다.',
        probability: 0.51,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 100 },
                { target: 'game', field: 'year', operator: 'gte', value: 30 }
            ]
        },
        choices: [
            { id: 'a', text: '추억을 떠올리며 구매한다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'b', text: '지나가듯 보고 웃는다.', result: { type: 'none' } },
            { id: 'c', text: '충동구매 후 후회한다.', result: { type: 'trait_delta', trait: 'val', delta: -1 } },
            { id: 'd', text: '옷보다 건강부터 챙긴다.', result: { type: 'disease', disease: null } }
        ]
    },

    // ─── 11살 짝꿍 고백 결과 (12살 때 트리거) ───
    {
        code: 'first_crush_confess_good',
        text: '두근두근... 용기 있는 고백에 짝꿍이 환하게 웃습니다.',
        probability: 1.0,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 12 },
                { target: 'person', field: 'eventState.choiceByCode.first_crush', operator: 'eq', value: 'confess' },
                { target: 'person', field: 'traits.app.tier', operator: 'in', value: ['SSR', 'SR'] }
            ]
        },
        choices: [
            { id: 'ok', text: '짝꿍과 연인이 되었습니다!', resultText: '짝꿍과 연인이 되었습니다! 첫사랑이 이루어지는 순간입니다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } }
        ]
    },
    {
        code: 'first_crush_confess_bad',
        text: '짝꿍이 당신을 물끄러미 바라보더니... 고개를 젓습니다.',
        probability: 1.0,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 12 },
                { target: 'person', field: 'eventState.choiceByCode.first_crush', operator: 'eq', value: 'confess' },
                { target: 'person', field: 'traits.app.tier', operator: 'not_in', value: ['SSR', 'SR'] }
            ]
        },
        choices: [
            { id: 'ok', text: '짝꿍이 당신을 역겨워합니다.', resultText: '짝꿍이 당신을 역겨워합니다. 거절당했습니다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } }
        ]
    },
    {
        code: 'first_crush_tsundere_good',
        text: '싫어하는 척했지만... 짝꿍이 먼저 말을 걸어옵니다.',
        probability: 1.0,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 12 },
                { target: 'person', field: 'eventState.choiceByCode.first_crush', operator: 'eq', value: 'tsundere' },
                { target: 'person', field: 'traits.app.tier', operator: 'in', value: ['SSR', 'SR'] }
            ]
        },
        choices: [
            { id: 'ok', text: '짝꿍이 당신을 마음에 들어합니다.', resultText: '짝꿍이 당신을 마음에 들어합니다. 설레는 봄날입니다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } }
        ]
    },
    {
        code: 'first_crush_tsundere_bad',
        text: '싫다는 말을 그대로 믿었는지, 짝꿍은 당신을 완전히 무시합니다.',
        probability: 1.0,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 12 },
                { target: 'person', field: 'eventState.choiceByCode.first_crush', operator: 'eq', value: 'tsundere' },
                { target: 'person', field: 'traits.app.tier', operator: 'not_in', value: ['SSR', 'SR'] }
            ]
        },
        choices: [
            { id: 'chaos', text: '그녀의 관심을 끌기 위해 소란을 피운다.', resultText: '학폭위원회에 소집되었습니다. 큰 사고를 쳤습니다.', result: { type: 'trait_delta', trait: 'val', delta: -2 } },
            { id: 'quiet', text: '그저 조용히 있는다.',                    resultText: '누구에게나 그런 날은 있는 법이죠.',              result: { type: 'none' } }
        ]
    },

    // ─── 15살 가출 후 위기 (16살 때 트리거) ───
    {
        code: 'runaway_danger_16',
        text: '길거리를 떠돌던 중 수상한 어른이 집에 가자고 합니다...',
        probability: 1.0,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 16 },
                { target: 'person', field: 'eventState.choiceByCode.middle_school_chuunibyou', operator: 'eq', value: 'runaway' }
            ]
        },
        choices: [
            { id: 'follow',   text: '따라간다.',                resultText: '그저 끔찍한 결과만이 기다리고 있었을 뿐입니다.\n당신은 사망했습니다.', result: { type: 'disease', disease: '혼절' } },
            { id: 'reject',   text: '그건 안돼!! 집으로 돌아간다.', resultText: '당신은 방황 끝에 집에 무사히 도착했습니다.\n지능 +2, 건강 -1', result: { type: 'trait_delta', trait: 'val', delta: 2 } },
            { id: 'gangster', text: '나쁜 패거리와 어울린다.',   resultText: '친구들이 집에는 돌아가라고 하네요.\n지능 -1, 매력 +2',             result: { type: 'trait_delta', trait: 'val', delta: -1 } }
        ]
    },

    // ─── 17살 장기자랑 ───
    {
        code: 'talent_show_17',
        text: '학교에서 장기자랑이 열린다.',
        probability: 0.9,
        condition: { target: 'person', field: 'age', operator: 'eq', value: 17 },
        choices: [
            { id: 'perform',  text: '나의 매력을 보여줄 때가 온 것 같다.', result: { type: 'none' } },
            { id: 'peaceful', text: '평범한게 좋은거야.',                   resultText: '당신은 평온한 일상이 어울려보이네요.',       result: { type: 'none' } },
            { id: 'boo',      text: '다른 친구들의 공연을 보며 야유한다.',  resultText: '모두가 당신에게 돌을 던집니다. 건강 -1, 매력 -5', result: { type: 'trait_delta', trait: 'per', delta: -2 } }
        ]
    },
    {
        code: 'talent_show_result_good',
        text: '무대에 서는 순간 모두의 시선이 집중됩니다.',
        probability: 1.0,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 18 },
                { target: 'person', field: 'eventState.choiceByCode.talent_show_17', operator: 'eq', value: 'perform' },
                { target: 'person', field: 'traits.app.tier', operator: 'in', value: ['SSR', 'SR'] }
            ]
        },
        choices: [
            { id: 'ok', text: '모두의 이목을 끌었습니다! 당신은 인기인!', resultText: '모두의 이목을 끌었습니다! 당신은 인기인!', result: { type: 'trait_delta', trait: 'app', delta: 1 } }
        ]
    },
    {
        code: 'talent_show_result_bad',
        text: '무대 위의 당신... 분위기가 몹시 어색합니다.',
        probability: 1.0,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 18 },
                { target: 'person', field: 'eventState.choiceByCode.talent_show_17', operator: 'eq', value: 'perform' },
                { target: 'person', field: 'traits.app.tier', operator: 'not_in', value: ['SSR', 'SR'] }
            ]
        },
        choices: [
            { id: 'ok', text: '당신의 흑역사가 인터넷에 영원히 박제되었습니다.', resultText: '당신의 흑역사가 인터넷에 영원히 박제되었습니다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } }
        ]
    }
];
