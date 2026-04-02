# 식욕 저하

## 개요

65세 시점의 질병 조건 연계 이벤트다.  
질병이 약하게 이어진 상태에서 한 번 더 건강 축을 흔든다.

## 기본 정보

- 코드: `lose_appetite`
- 표시 문구: `밥이 먹기 싫어진다.`
- 확률: `0.67`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `65세`여야 한다.
- 질병이 `null`, `감기`, `몸살` 중 하나여야 한다.

## 선택지와 결과

- `a` / `식단을 가볍게 조정한다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `b` / `억지로 거르며 버틴다.`
  - `resultText`는 없다.
  - `result`: `disease(disease='몸살')`
  - `disease='몸살'`로 변경된다.
- `c` / `건강 검진을 받아본다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='hlt', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='hlt', delta=1`이 기록되어 있다.
- `d` / `기분 탓이라 생각하고 넘긴다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='val', delta=-1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=-1`이 기록되어 있다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [노년기 인덱스](./README.md)

## 운영 메모

- 질병 보유 여부를 직접 조건으로 거는 대표 사례다.
- 건강 특성과 질병 상태를 분리해서 보는 데 도움이 된다.

## 관련 문서

- [노년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
