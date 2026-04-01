const JOB_DEFINITIONS = {
    housekeeper:        { name: '하우스키퍼',       monthlyIncomeKrw: 0 },
    student:            { name: '학생',             monthlyIncomeKrw: -500_000 },
    delivery_rider:     { name: '배달기사',         monthlyIncomeKrw: 3_500_000 },
    musician:           { name: '음악가',           monthlyIncomeKrw: 500_000 },
    highschool_teacher: { name: '고등학교 선생',     monthlyIncomeKrw: 3_000_000 },
    lawyer:             { name: '변호사',           monthlyIncomeKrw: 6_000_000 },
    corporate_employee: { name: '대기업 사원',     monthlyIncomeKrw: 5_000_000 },
    convenience_part:   { name: '편의점 알바',     monthlyIncomeKrw: 1_200_000 },
    barista:            { name: '카페 바리스타',   monthlyIncomeKrw: 1_800_000 },
    nurse:              { name: '간호사',           monthlyIncomeKrw: 3_000_000 },
    doctor:             { name: '의사',             monthlyIncomeKrw: 10_000_000 },
    programmer:         { name: '프로그래머',       monthlyIncomeKrw: 5_500_000 },
    designer:           { name: '디자이너',         monthlyIncomeKrw: 3_000_000 },
    youtuber:           { name: '유튜버',           monthlyIncomeKrw: 0, incomeRandomRange: { min: 0, max: 10_000_000, step: 100_000 } },
    civil_servant:      { name: '공무원',           monthlyIncomeKrw: 2_800_000 },
    police:             { name: '경찰',             monthlyIncomeKrw: 3_200_000 },
    firefighter:        { name: '소방관',           monthlyIncomeKrw: 3_200_000 },
    taxi_driver:        { name: '택시기사',         monthlyIncomeKrw: 2_500_000 },
    construction:       { name: '건설 노동자',     monthlyIncomeKrw: 3_500_000 },
    farmer:             { name: '농부',             monthlyIncomeKrw: 2_000_000 },
    sme_employee:       { name: '중소기업 사원',   monthlyIncomeKrw: 2_600_000 }
};

const ALL_JOB_CODES = Object.keys(JOB_DEFINITIONS);
