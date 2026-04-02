# 여행

## 개요

54세 시점의 소비형 이벤트다.  
휴식과 소비, 건강 악화 가능성이 함께 묶여 있다.

## 기본 정보

- 코드: `go_on_trip`
- 표시 문구: `여행을 간다.`
- 확률: `0.72`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `54세`여야 한다.
- 생존 인구가 `1명 이상`이어야 한다.

## 선택지와 결과

- `a` / `혼자 조용한 여행을 떠난다.`
  - `resultText`: `느긋한 여행이었지만 숙박비가 꽤 들었습니다.`
  - `result`: `multi([trait_delta(domain='val', attribute='goal', traitType='joy', delta=1), asset_delta(amount=-3000000)])`
  - `asset_delta(amount=-3000000)`으로 자산이 `300만원` 감소한다.
- `b` / `빡빡한 일정으로 여행한다.`
  - `resultText`: `여행 경비를 펑펑 쓰다 몸까지 상했습니다.`
  - `result`: `multi([disease(disease='감기'), asset_delta(amount=-5000000)])`
  - `disease='감기'`로 변경된다.
  - `asset_delta(amount=-5000000)`으로 자산이 `500만원` 감소한다.
- `c` / `가까운 근교만 다녀온다.`
  - `resultText`: `알뜰 여행으로 교통비만 조금 썼습니다.`
  - `result`: `asset_delta(amount=-1000000)`
  - `asset_delta(amount=-1000000)`으로 자산이 `100만원` 감소한다.
- `d` / `여행 대신 휴식을 택한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='hlt', attribute='stress', traitType='high', delta=1)`

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [중년기 인덱스](./README.md)

## 운영 메모

- 소비 이벤트이면서도 질병 진입 전단 역할을 한다.
- 노년기 질병 축과 함께 보는 편이 좋다.

## 관련 문서

- [중년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
