# 첫 정규직 취업

## 개요

28세 시점의 정규직 경험 이벤트다.  
제목은 취업이지만 실제로는 자산과 건강, 성향 변화 중심으로 작동한다.

## 기본 정보

- 코드: `get_first_fulltime_job`
- 표시 문구: `취직을 한다.`
- 확률: `0.74`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `28세`여야 한다.
- 질병이 `혼절`, `병사`가 아니어야 한다.

## 선택지와 결과

- `a` / `안정적인 회사를 고른다.`
  - `resultText`: `입사 축하금과 초기 급여가 통장에 들어왔습니다.`
  - `result`: `multi([trait_delta(trait='val', delta=1), asset_delta(amount=5000000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=1`이 기록되어 있다.
  - `asset_delta(amount=5000000)`으로 자산이 `500만원` 증가한다.
- `b` / `도전적인 스타트업을 택한다.`
  - `resultText`: `초봉은 낮지만 스톡옵션이 기대됩니다.`
  - `result`: `multi([trait_delta(trait='per', delta=1), asset_delta(amount=2000000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=1`이 기록되어 있다.
  - `asset_delta(amount=2000000)`으로 자산이 `200만원` 증가한다.
- `c` / `입사 후 번아웃이 온다.`
  - `resultText`: `병원비와 약값이 만만치 않습니다.`
  - `result`: `multi([disease(disease='몸살'), asset_delta(amount=-2000000)])`
  - `disease='몸살'`로 변경된다.
  - `asset_delta(amount=-2000000)`으로 자산이 `200만원` 감소한다.
- `d` / `일단 다녀보고 판단한다.`
  - `resultText`: `평범하게 첫 월급을 받았습니다.`
  - `result`: `asset_delta(amount=3000000)`
  - `asset_delta(amount=3000000)`으로 자산이 `300만원` 증가한다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [진로 / 직업기 인덱스](./README.md)

## 운영 메모

- 이름과 달리 `set_job` 결과가 없다는 점을 문서에서 분리해 인식하는 편이 좋다.
- 직업 서사라기보다 첫 사회생활 이벤트에 가깝다.

## 관련 문서

- [진로 / 직업기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
