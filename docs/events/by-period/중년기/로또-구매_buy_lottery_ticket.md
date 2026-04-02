# 로또 구매

## 개요

49세 시점의 초대형 경제 변동 이벤트다.  
단일 이벤트 중 자산 폭이 가장 크게 출렁인다.

## 기본 정보

- 코드: `buy_lottery_ticket`
- 표시 문구: `로또를 산다.`
- 확률: `0.58`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `49세`여야 한다.
- 질병이 `혼절`, `병사`가 아니어야 한다.

## 선택지와 결과

- `a` / `한 장만 산다.`
  - `resultText`: `꽝입니다. 복권값만 날렸습니다.`
  - `result`: `asset_delta(amount=-10000)`
  - `asset_delta(amount=-10000)`으로 자산이 `1만원` 감소한다.
- `b` / `여러 장을 산다.`
  - `resultText`: `전부 꽝... 거금을 날렸습니다.`
  - `result`: `multi([trait_delta(domain='val', attribute='risk', traitType='low', delta=-1), asset_delta(amount=-500000)])`
  - `asset_delta(amount=-500000)`으로 자산이 `50만원` 감소한다.
- `c` / `자동 번호로 산다.`
  - `resultText`: `1등 당첨! 인생역전의 그날이 왔습니다!!`
  - `result`: `multi([trait_delta(domain='per', attribute='conflict', traitType='breakthrough', delta=1), asset_delta(amount=1000000000)])`
  - `asset_delta(amount=1000000000)`으로 자산이 `10억원` 증가한다.
- `d` / `안 사고 지나간다.`
  - `resultText`: `절약 정신이 확실합니다.`
  - `result`: `trait_delta(domain='val', attribute='risk', traitType='low', delta=1)`

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [중년기 인덱스](./README.md)

## 운영 메모

- 운영상 가장 극단적인 경제 폭발 이벤트다.
- 확률, 발화 시점, 결과 폭을 함께 봐야 밸런스 판단이 된다.

## 관련 문서

- [중년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
