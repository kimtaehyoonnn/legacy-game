# 대입과 진로 선택

## 개요

19세 시점의 진학/취업 갈림길 이벤트다.  
대학 진학 루트는 직접 `student` 직업으로 이어진다.

## 기본 정보

- 코드: `prepare_college_exam`
- 표시 문구: `19살, 대입과 진로를 선택해야 할 시간이다.`
- 확률: `0.95`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `19세`여야 한다.
- 다른 추가 조건은 없다.

## 선택지와 결과

- `elite` / `명문 대학교로 진학한다.`
  - `resultText`: `명문 대학교에 입학했습니다.`
  - `result`: `set_job(jobCode='student')`
  - 런타임에서 `jobCode='student'`, `jobName='학생'`, `jobMonthlyIncomeKrw=-500000`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.
- `normal` / `일반 대학교로 진학한다.`
  - `resultText`: `대학교에 입학했습니다.`
  - `result`: `set_job(jobCode='student')`
  - 런타임에서 `jobCode='student'`, `jobName='학생'`, `jobMonthlyIncomeKrw=-500000`, `jobAssignedMonth`, `careerStage='selected'`가 갱신된다.
- `work` / `취직에 나선다.`
  - `resultText`: `좋은 직장을 얻길 바랍니다!`
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `neet` / `아직은 백수가 좋아.`
  - `resultText`: `당신은 불효자의 길을 걷습니다!`
  - `result`: `multi([trait_delta(domain='val', attribute='goal', traitType='growth', delta=-1), trait_delta(domain='val', attribute='priority', traitType='family', delta=-1)])`

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [청소년기 인덱스](./README.md)

## 운영 메모

- 20세 첫 직업 이벤트보다 앞서 `student` 진입을 만들 수 있다.
- 학생 루트의 실제 전초전 역할을 한다.

## 관련 문서

- [청소년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
