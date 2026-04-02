# 삶의 여유

## 개요

70세 시점의 후반 완화 이벤트다.  
서사를 부드럽게 만들면서 감정과 건강 방향만 조정한다.

## 기본 정보

- 코드: `life_gets_comfortable`
- 표시 문구: `삶이 갑자기 편안해진다.`
- 확률: `0.41`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `70세`여야 한다.
- 게임 연차가 `20년 이상`이어야 한다.

## 선택지와 결과

- `a` / `느긋하게 일상을 즐긴다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='per', attribute='emotional', traitType='rich', delta=1)`
- `b` / `여유를 건강 관리에 쓴다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='hlt', attribute='stress', traitType='high', delta=1)`
- `c` / `별다른 변화는 없다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `d` / `긴장이 풀려 무기력해진다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='per', attribute='selfManagement', traitType='diligent', delta=-1)`

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [노년기 인덱스](./README.md)

## 운영 메모

- 후반 분위기를 누그러뜨리는 감정형 이벤트다.
- 경제 변화 없이 감정/건강 축만 움직이는 것이 특징이다.

## 관련 문서

- [노년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
