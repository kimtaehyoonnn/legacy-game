# 하늘을 바라본다

## 개요

73세와 74세를 걸쳐 발화 가능한 회고형 이벤트다.  
후반 감정선을 정리하는 서사 이벤트에 가깝다.

## 기본 정보

- 코드: `look_at_the_sky`
- 표시 문구: `하늘을 바라본다.`
- 확률: `0.55`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `73세`이거나, `74세`이면서 질병이 `병사`가 아니어야 한다.

## 선택지와 결과

- `a` / `지난 삶을 천천히 돌아본다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='val', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=1`이 기록되어 있다.
- `b` / `앞으로 할 일을 정리한다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `c` / `살짝 우울해진다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='per', delta=-1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=-1`이 기록되어 있다.
- `d` / `산책을 시작한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='hlt', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='hlt', delta=1`이 기록되어 있다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [노년기 인덱스](./README.md)

## 운영 메모

- 드물게 두 연령 타이밍을 묶는 복합 조건 이벤트다.
- 결과보다 분위기와 후반 감정선 유지 역할이 크다.

## 관련 문서

- [노년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
