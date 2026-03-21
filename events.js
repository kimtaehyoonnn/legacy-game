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
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 5 },
                { target: 'game', field: 'year', operator: 'gte', value: 0 }
            ]
        },
        choices: [
            { id: 'a', text: '울면서 끝까지 조른다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } },
            { id: 'b', text: '가격표를 보고 포기한다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'c', text: '작은 간식으로 타협한다.', result: { type: 'none' } },
            { id: 'd', text: '아무 말 없이 따라간다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } }
        ]
    },
    {
        code: 'class_urgent_pooping',
        text: '초등학교 수업 시간에 갑자기 똥이 마렵다.',
        probability: 0.8,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 8 },
                { target: 'person', field: 'isMarried', operator: 'eq', value: false }
            ]
        },
        choices: [
            { id: 'a', text: '손을 들고 화장실을 요청한다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'b', text: '끝까지 참아본다.', result: { type: 'disease', disease: '몸살' } },
            { id: 'c', text: '몰래 나간다.', result: { type: 'trait_delta', trait: 'val', delta: -1 } },
            { id: 'd', text: '친구에게 도움을 요청한다.', result: { type: 'none' } }
        ]
    },
    {
        code: 'first_crush',
        text: '짝꿍이 마음에 든다.',
        probability: 0.7,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 11 },
                { target: 'person', field: 'isMarried', operator: 'eq', value: false }
            ]
        },
        choices: [
            { id: 'a', text: '고백 편지를 쓴다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'b', text: '몰래 지켜보기만 한다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } },
            { id: 'c', text: '친구로 지내기로 한다.', result: { type: 'none' } },
            { id: 'd', text: '공부에 집중하기로 한다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } }
        ]
    },
    {
        code: 'middle_school_chuunibyou',
        text: '사춘기(중2병)이 생긴다.',
        probability: 0.9,
        condition: { target: 'person', field: 'age', operator: 'eq', value: 15 },
        choices: [
            { id: 'a', text: '혼자만의 세계에 빠진다.', result: { type: 'trait_delta', trait: 'per', delta: -1 } },
            { id: 'b', text: '운동으로 에너지를 푼다.', result: { type: 'trait_delta', trait: 'hlt', delta: 1 } },
            { id: 'c', text: '가족과 대화를 늘린다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'd', text: '특별한 변화 없이 지나간다.', result: { type: 'none' } }
        ]
    },
    {
        code: 'prepare_college_exam',
        text: '대입을 준비한다.',
        probability: 0.92,
        condition: {
            op: 'and',
            conditions: [
                { target: 'person', field: 'age', operator: 'eq', value: 19 },
                { target: 'game', field: 'alivePopulation', operator: 'gte', value: 1 }
            ]
        },
        choices: [
            { id: 'a', text: '입시 학원을 등록한다.', result: { type: 'trait_delta', trait: 'val', delta: 1 } },
            { id: 'b', text: '독학으로 준비한다.', result: { type: 'trait_delta', trait: 'per', delta: 1 } },
            { id: 'c', text: '진로를 다시 탐색한다.', result: { type: 'none' } },
            { id: 'd', text: '스트레스로 잠을 줄인다.', result: { type: 'disease', disease: '감기' } }
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
    }
];
