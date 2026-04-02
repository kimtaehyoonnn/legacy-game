# 아르바이트 시작

## 개요

20대 중반의 경제/건강 복합 이벤트다.  
아르바이트 선택에 따라 자산과 질병, 성향 변화가 함께 발생한다.

## 기본 정보

- 코드: `start_part_time_job`
- 표시 문구: `아르바이트를 한다.`
- 확률: `0.78`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `24세`이거나, `25세`이면서 미혼이어야 한다.

## 선택지와 결과

- `a` / `서비스직에 도전한다.`
  - `resultText`: `적극적인 서비스 정신으로 팁과 인센티브를 듬뿍 받았습니다.`
  - `result`: `multi([trait_delta(trait='per', delta=1), asset_delta(amount=3000000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=1`이 기록되어 있다.
  - `asset_delta(amount=3000000)`으로 자산이 `300만원` 증가한다.
- `b` / `야간 근무를 택한다.`
  - `resultText`: `야간 수당이 쏠쏠하지만 무리한 탓에 몸이 상했습니다.`
  - `result`: `multi([disease(disease='감기'), asset_delta(amount=2000000)])`
  - `disease='감기'`로 변경된다.
  - `asset_delta(amount=2000000)`으로 자산이 `200만원` 증가한다.
- `c` / `적당히 경험만 쌓는다.`
  - `resultText`: `소박하게 용돈벌이가 됐습니다.`
  - `result`: `asset_delta(amount=1000000)`
  - `asset_delta(amount=1000000)`으로 자산이 `100만원` 증가한다.
- `d` / `조건이 나빠 바로 그만둔다.`
  - `resultText`: `짧은 근무로 받은 급여가 교통비도 안 됩니다.`
  - `result`: `multi([trait_delta(trait='val', delta=-1), asset_delta(amount=-500000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=-1`이 기록되어 있다.
  - `asset_delta(amount=-500000)`으로 자산이 `50만원` 감소한다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [진로 / 직업기 인덱스](./README.md)

## 운영 메모

- 직업기 초반 이벤트 중 자산 보정 폭이 비교적 큰 편이다.
- 질병 유입과 자산 보상을 동시에 얹는 선택지가 있어 체감이 분명하다.

## 관련 문서

- [진로 / 직업기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
