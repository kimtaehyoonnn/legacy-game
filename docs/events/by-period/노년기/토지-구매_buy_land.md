# 토지 구매

## 개요

88세 시점의 대형 지출 이벤트다.  
후반부 자산 감소를 강하게 만드는 대표 사례다.

## 기본 정보

- 코드: `buy_land`
- 표시 문구: `땅을 구매한다.`
- 확률: `0.24`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `88세`여야 한다.
- 전체 인구가 `1명 이상`이어야 한다.

## 선택지와 결과

- `a` / `작은 땅을 신중히 산다.`
  - `resultText`: `알뜰한 투자로 알짜배기 토지를 마련했습니다.`
  - `result`: `multi([trait_delta(trait='val', delta=1), asset_delta(amount=-50000000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=1`이 기록되어 있다.
  - `asset_delta(amount=-50000000)`으로 자산이 `5000만원` 감소한다.
- `b` / `무리하게 큰 계약을 한다.`
  - `resultText`: `빚을 내서 무리한 계약을 맺었습니다.`
  - `result`: `multi([trait_delta(trait='val', delta=-1), asset_delta(amount=-200000000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=-1`이 기록되어 있다.
  - `asset_delta(amount=-200000000)`으로 자산이 `2억원` 감소한다.
- `c` / `가족과 공동명의로 산다.`
  - `resultText`: `가족과 부담을 나눠 합리적으로 구매했습니다.`
  - `result`: `multi([trait_delta(trait='per', delta=1), asset_delta(amount=-30000000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=1`이 기록되어 있다.
  - `asset_delta(amount=-30000000)`으로 자산이 `3000만원` 감소한다.
- `d` / `마음만 먹고 보류한다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [노년기 인덱스](./README.md)

## 운영 메모

- `buy_lottery_ticket`와 반대로 큰 폭의 자산 감소를 만든다.
- 운영상 후반 자산 하방 압력 이벤트로 본다.

## 관련 문서

- [노년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
