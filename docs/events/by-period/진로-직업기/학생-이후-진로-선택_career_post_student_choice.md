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

- 선택지는 런타임에서 동적으로 생성된다.
- `student`는 후보에서 제외된다.
- `student`를 제외한 직업 중 `JOB_DEFINITIONS[code].appearanceCondition`을 통과한 후보를 최대 4개까지 노출한다.
- 조건을 통과한 직업이 0개면 `housekeeper` 1개를 fallback으로 제공한다.
- 어떤 직업을 고르든 결과 타입은 `set_job(jobCode='<선택한 code>')`이며, 런타임에서 `jobCode`, `jobName`, `jobMonthlyIncomeKrw`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [진로 / 직업기 인덱스](./README.md)

## 운영 메모

- 학생 루트만 별도 후속 진로 이벤트를 가진다.
- 운영상 `student` 체류 기간 60개월은 커리어 템포를 크게 좌우한다.
- 일반 이벤트 정의(`events.js`)의 고정 `choices` 목록과 달리, 실제 노출 선택지는 사람별 조건 평가 결과를 따른다.

## 관련 문서

- [진로 / 직업기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
