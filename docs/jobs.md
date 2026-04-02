# 직업 운영 문서

## 개요

현 프로젝트의 직업 시스템은 `JOB_DEFINITIONS`를 기준으로 움직인다.  
직업은 캐릭터별 월수입과 커리어 상태를 결정하고, 월 자산 정산에서 연령별 고정지출과 합산된다.

최근 변경으로 `career_initial_choice`, `career_post_student_choice`의 선택지는 고정 목록이 아니라, 캐릭터의 성격/가치관 특성에 따라 동적으로 구성된다.

## 데이터 구조

### 직업 정의 스키마

```js
{
  code: {
    name: '표시 이름',
    monthlyIncomeKrw: 숫자,
    incomeRandomRange: {
      min: 숫자,
      max: 숫자,
      step: 숫자
    }, // 선택 필드
    appearanceCondition: {
      // 선택 필드, 이벤트 조건 DSL 재사용
      // 예: { target, field, operator, value }
      // 예: { op: 'and'|'or', conditions: [...] }
    }
  }
}
```

### `appearanceCondition` 해석 규칙

- `eventEngine.js`의 조건 DSL(`eq`, `gte`, `in`, `and`, `or` 등)을 그대로 사용한다.
- 조건 미지정 직업은 항상 진로 선택 후보가 될 수 있다.
- 조건에서 참조 가능한 대표 경로:
- `traits.per.representatives.*`
- `traits.val.representatives.*`
- `traits.per.scores.*.*`
- `traits.val.scores.*.*`

### 캐릭터 직업 상태 필드

| 필드 | 의미 |
| --- | --- |
| `jobCode` | 현재 직업 코드 |
| `jobName` | UI에 표시할 직업명 |
| `jobMonthlyIncomeKrw` | 현재 월수입 |
| `jobAssignedMonth` | 직업이 배정된 전역 월 |
| `careerStage` | `none`, `selected`, `retired` |
| `monthsSinceJobAssigned` | 이벤트 조건 평가 시 계산되는 근속 개월 수 |

## 직업 배정/변경 규칙

- `setPersonJob(person, jobCode, assignedMonth)`이 실제 직업 배정을 수행한다.
- `incomeRandomRange`가 있으면 `monthlyIncomeKrw` 대신 랜덤 월수입을 굴린다.
- `retirePersonJob(person)`은 직업과 월수입을 비우고 `careerStage`를 `retired`로 바꾼다.
- `assignRandomCareerForLateJoiner(person)`는 `isAlive && isMain`이며, `20세 이상 64세 이하`이고 `careerStage === 'none'`인 캐릭터에게 전체 직업군 중 하나를 랜덤 배정한다.

### 동적 진로 선택 규칙

- `career_initial_choice`
- `student`는 항상 포함된다.
- `student` 제외 직업 중 `appearanceCondition`을 통과한 후보를 섞어 최대 3개를 추가한다.
- 총 선택지는 `1~4개` 범위다.
- `career_post_student_choice`
- `student`는 후보에서 제외된다.
- 조건 통과 직업을 최대 4개 노출한다.
- 조건 통과 직업이 0개면 `housekeeper` 1개를 fallback으로 제공한다.

## 수입/지출 반영 규칙

- 월수입은 `financeSystem.js`의 `getFixedMonthlyIncomeKrw()`에서 그대로 사용된다.
- 월지출은 나이 기준 고정값이다.
- `0~19세`: `100만원`
- `20~29세`: `150만원`
- `30~54세`: `250만원`
- `55~69세`: `150만원`
- `70세 이상`: `100만원`
- 최종 월 자산 변화는 `직업 월수입 - 연령별 고정지출`이며, 모든 `isAlive && isMain` 가족 구성원의 합계가 가문 자산에 더해진다.

## 직업 목록

| code | 이름 | 기본 월수입 | 랜덤 수입 | `appearanceCondition` |
| --- | --- | ---: | --- | --- |
| `housekeeper` | 하우스키퍼 | 0원 | 없음 | 없음 |
| `student` | 학생 | -50만원 | 없음 | 없음 |
| `delivery_rider` | 배달기사 | 350만원 | 없음 | 없음 |
| `musician` | 음악가 | 50만원 | 없음 | `per.emotional=artistic` 또는 `val.goal=joy` |
| `highschool_teacher` | 고등학교 선생 | 300만원 | 없음 | 없음 |
| `lawyer` | 변호사 | 600만원 | 없음 | `val.morality=principle` AND `per.selfManagement=diligent` |
| `corporate_employee` | 대기업 사원 | 500만원 | 없음 | 없음 |
| `convenience_part` | 편의점 알바 | 120만원 | 없음 | 없음 |
| `barista` | 카페 바리스타 | 180만원 | 없음 | 없음 |
| `nurse` | 간호사 | 300만원 | 없음 | 없음 |
| `doctor` | 의사 | 1,000만원 | 없음 | `per.scores.selfManagement.diligent>=4` AND `val.scores.goal.growth>=3` |
| `programmer` | 프로그래머 | 550만원 | 없음 | `per.behavior in [planned, balanced]` AND `val.scores.goal.growth>=3` |
| `designer` | 디자이너 | 300만원 | 없음 | 없음 |
| `youtuber` | 유튜버 | 0원 | `0원~1,000만원`, 10만원 단위 | 없음 |
| `civil_servant` | 공무원 | 280만원 | 없음 | `val.goal=stability` AND `per.behavior=planned` |
| `police` | 경찰 | 320만원 | 없음 | `val.priority=nation` 또는 `per.conflict=competitive` |
| `firefighter` | 소방관 | 320만원 | 없음 | `per.conflict=breakthrough` 또는 `per.scores.selfManagement.diligent>=4` |
| `taxi_driver` | 택시기사 | 250만원 | 없음 | 없음 |
| `construction` | 건설 노동자 | 350만원 | 없음 | 없음 |
| `farmer` | 농부 | 200만원 | 없음 | 없음 |
| `sme_employee` | 중소기업 사원 | 260만원 | 없음 | 없음 |

## 운영 메모

- `student`는 월수입이 `-50만원`이라서 실질적으로 교육비/생활비를 뜻한다.
- `youtuber`는 유일한 랜덤 수입 직업이다. 범위는 `0원 ~ 1,000만원`, `10만원` 단위다.
- 1대 가주 시작 이벤트도 동일한 동적 진로 선택 로직을 사용한다.
- 결혼 후보 생성과 후발 주인공 랜덤 직업 배정은 현재 `appearanceCondition`을 사용하지 않고 전체 직업군 랜덤을 유지한다.
- 65세 이상은 매월 업데이트 중 `retirePersonJob()` 대상이 된다.
