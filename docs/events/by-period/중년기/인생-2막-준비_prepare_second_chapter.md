# 인생 2막 준비

## 개요

44세 시점의 중년 전환기 이벤트다.  
경제 변화 없이 성향 축만 부드럽게 조정하는 역할을 한다.

## 기본 정보

- 코드: `prepare_second_chapter`
- 표시 문구: `인생의 2막을 준비한다.`
- 확률: `0.65`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `44세`여야 한다.

## 선택지와 결과

- `a` / `새로운 공부를 시작한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='val', attribute='goal', traitType='growth', delta=1)`
- `b` / `건강 루틴을 만든다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='hlt', attribute='recovery', traitType='fast', delta=1)`
- `c` / `현 상태를 유지한다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `d` / `변화를 미루고 불안해한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='per', attribute='behavior', traitType='planned', delta=-1)`

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [중년기 인덱스](./README.md)

## 운영 메모

- 중년기 문턱에서 플레이 감정을 정리해 주는 완충 이벤트다.
- 큰 보상이나 페널티 없이 방향성만 조정한다.

## 관련 문서

- [중년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
