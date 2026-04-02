# 감기 발생

## 개요

59세 시점의 질병 진입 이벤트다.  
질병 상태를 직접 바꾸며, 이후 노년기 건강 이벤트와 자연스럽게 이어진다.

## 기본 정보

- 코드: `catch_cold`
- 표시 문구: `감기에 걸린다.`
- 확률: `0.85`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `59세`여야 한다.
- 현재 질병이 없어야 한다.

## 선택지와 결과

- `a` / `충분히 쉬고 회복한다.`
  - `resultText`는 없다.
  - `result`: `disease(disease=null)`
  - `disease=null`로 변경된다.
- `b` / `약만 먹고 버틴다.`
  - `resultText`는 없다.
  - `result`: `disease(disease='감기')`
  - `disease='감기'`로 변경된다.
- `c` / `무리해서 더 악화된다.`
  - `resultText`는 없다.
  - `result`: `disease(disease='몸살')`
  - `disease='몸살'`로 변경된다.
- `d` / `체력을 키우기 시작한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='hlt', attribute='fitness', traitType='strong', delta=1)`

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [중년기 인덱스](./README.md)

## 운영 메모

- 질병 트랙의 본격적인 진입점이다.
- 노년기 이벤트와 조건 연결이 있어 후반부 흐름상 중요하다.

## 관련 문서

- [중년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
