# 학생 이후 진로 선택

## 개요

학생 루트 전용 후속 진로 이벤트다.  
나이가 아니라 학생 유지 기간이 발화 기준이라 템포 영향이 크다.

## 기본 정보

- 코드: `career_post_student_choice`
- 표시 문구: `학생 생활을 마치고 다음 진로를 선택할 때다.`
- 확률: `1.0`
- 원본 정의 파일: `events.js`

## 발화 조건

- `careerStage === 'selected'`여야 한다.
- `jobCode === 'student'`여야 한다.
- `monthsSinceJobAssigned >= 60`이어야 한다.

## 선택지와 결과

- `housekeeper` / `하우스키퍼`
  - `resultText`는 없다.
  - `result`: `set_job(jobCode='housekeeper')`
  - 런타임에서 `jobCode='housekeeper'`, `jobName='하우스키퍼'`, `jobMonthlyIncomeKrw=0`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.
- `highschool_teacher` / `고등학교 선생`
  - `resultText`는 없다.
  - `result`: `set_job(jobCode='highschool_teacher')`
  - 런타임에서 `jobCode='highschool_teacher'`, `jobName='고등학교 선생'`, `jobMonthlyIncomeKrw=3000000`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.
- `lawyer` / `변호사`
  - `resultText`는 없다.
  - `result`: `set_job(jobCode='lawyer')`
  - 런타임에서 `jobCode='lawyer'`, `jobName='변호사'`, `jobMonthlyIncomeKrw=6000000`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.
- `corporate_employee` / `대기업 사원`
  - `resultText`는 없다.
  - `result`: `set_job(jobCode='corporate_employee')`
  - 런타임에서 `jobCode='corporate_employee'`, `jobName='대기업 사원'`, `jobMonthlyIncomeKrw=5000000`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [진로 / 직업기 인덱스](./README.md)

## 운영 메모

- 학생 루트만 별도 후속 진로 이벤트를 가진다.
- 운영상 `student` 체류 기간 60개월은 커리어 템포를 크게 좌우한다.

## 관련 문서

- [진로 / 직업기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
