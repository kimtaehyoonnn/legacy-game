# 자동차 운전

## 개요

79세 시점의 노년 일상/건강 리스크 이벤트다.  
무리한 선택은 질병 악화로 연결될 수 있다.

## 기본 정보

- 코드: `drive_a_car`
- 표시 문구: `자동차를 운전한다.`
- 확률: `0.36`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `79세`여야 한다.
- 질병이 `혼절`, `병사`가 아니어야 한다.

## 선택지와 결과

- `a` / `안전 운전을 최우선으로 한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='val', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=1`이 기록되어 있다.
- `b` / `장거리 운전을 강행한다.`
  - `resultText`는 없다.
  - `result`: `disease(disease='몸살')`
  - `disease='몸살'`로 변경된다.
- `c` / `짧은 거리만 이동한다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `d` / `운전을 그만두고 대중교통을 탄다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='per', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=1`이 기록되어 있다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [노년기 인덱스](./README.md)

## 운영 메모

- 확률은 낮지만 몸살 유입 경로라서 질병 축과 연결해 봐야 한다.
- 후반 일상 이벤트 중 건강 리스크가 비교적 직접적이다.

## 관련 문서

- [노년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
