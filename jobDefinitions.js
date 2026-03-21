const JOB_DEFINITIONS = {
    housekeeper: { name: '하우스키퍼', monthlyIncomeKrw: 0 },
    student: { name: '학생', monthlyIncomeKrw: -500_000 },
    delivery_rider: { name: '배달기사', monthlyIncomeKrw: 3_500_000 },
    musician: { name: '음악가', monthlyIncomeKrw: 500_000 },
    highschool_teacher: { name: '고등학교 선생', monthlyIncomeKrw: 3_000_000 },
    lawyer: { name: '변호사', monthlyIncomeKrw: 6_000_000 },
    corporate_employee: { name: '대기업 사원', monthlyIncomeKrw: 5_000_000 }
};

const INITIAL_JOB_OPTIONS = ['housekeeper', 'student', 'delivery_rider', 'musician'];
const SECOND_JOB_OPTIONS = ['housekeeper', 'highschool_teacher', 'lawyer', 'corporate_employee'];
const ALL_JOB_CODES = Object.keys(JOB_DEFINITIONS);
