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

- `housekeeper` / `하우스키퍼`
  - `resultText`는 없다.
  - `result`: `set_job(jobCode='housekeeper')`
  - 런타임에서 `jobCode='housekeeper'`, `jobName='하우스키퍼'`, `jobMonthlyIncomeKrw=0`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.
- `student` / `학생`
  - `resultText`는 없다.
  - `result`: `set_job(jobCode='student')`
  - 런타임에서 `jobCode='student'`, `jobName='학생'`, `jobMonthlyIncomeKrw=-500000`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.
- `delivery_rider` / `배달기사`
  - `resultText`는 없다.
  - `result`: `set_job(jobCode='delivery_rider')`
  - 런타임에서 `jobCode='delivery_rider'`, `jobName='배달기사'`, `jobMonthlyIncomeKrw=3500000`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.
- `musician` / `음악가`
  - `resultText`는 없다.
  - `result`: `set_job(jobCode='musician')`
  - 런타임에서 `jobCode='musician'`, `jobName='음악가'`, `jobMonthlyIncomeKrw=500000`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [진로 / 직업기 인덱스](./README.md)

## 운영 메모

- 일반 정의는 고정 4개 선택지지만, 실제 게임 시작 직후 1대 가주는 커스텀된 첫 직업 선택지를 받는다.
- 운영상 첫 직업 분포를 볼 때는 일반 정의와 시작 예외를 함께 봐야 한다.

## 관련 문서

- [진로 / 직업기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
