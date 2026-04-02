# 첫 직업 선택

## 개요

20세 시점의 기본 진로 이벤트다.  
캐릭터의 첫 직업을 직접 정하는 핵심 진입점이다.

## 기본 정보

- 코드: `career_initial_choice`
- 표시 문구: `첫 직업을 선택할 시기가 왔다.`
- 확률: `1.0`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `20세`여야 한다.
- `careerStage === 'none'`이어야 한다.

## 선택지와 결과

- 선택지는 런타임에서 동적으로 생성된다.
- `student`는 항상 고정 포함된다.
- `student`를 제외한 직업 중 `JOB_DEFINITIONS[code].appearanceCondition`을 통과한 후보를 최대 3개까지 추가한다.
- 총 선택지 수는 `1~4개`다.
- 어떤 직업을 고르든 결과 타입은 `set_job(jobCode='<선택한 code>')`이며, 런타임에서 `jobCode`, `jobName`, `jobMonthlyIncomeKrw`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [진로 / 직업기 인덱스](./README.md)

## 운영 메모

- 일반 이벤트 정의(`events.js`)에 기본 `choices`가 있어도, 실제 팝업 노출 시점에는 사람의 성격/가치관 조건을 기준으로 선택지를 재구성한다.
- 게임 시작 직후 1대 가주도 같은 동적 직업 선택 규칙을 사용한다.

## 관련 문서

- [진로 / 직업기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
