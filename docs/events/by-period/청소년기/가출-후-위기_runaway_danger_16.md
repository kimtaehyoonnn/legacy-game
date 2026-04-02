# 가출 후 위기

## 개요

가출 체인의 후속 이벤트다.  
16세 시점에 발화하며, 선택에 따라 치명적인 결과로 이어질 수 있다.

## 기본 정보

- 코드: `runaway_danger_16`
- 표시 문구: `길거리를 떠돌던 중 수상한 어른이 집에 가자고 합니다...`
- 확률: `1.0`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `16세`여야 한다.
- `eventState.choiceByCode.middle_school_chuunibyou === 'runaway'`여야 한다.

## 선택지와 결과

- `follow` / `따라간다.`
  - `resultText`: `그저 끔찍한 결과만이 기다리고 있었을 뿐입니다.\n당신은 사망했습니다.`
  - `result`: `disease(disease='혼절')`
  - `disease='혼절'`로 변경된다.
- `reject` / `그건 안돼!! 집으로 돌아간다.`
  - `resultText`: `당신은 방황 끝에 집에 무사히 도착했습니다.\n지능 +2, 건강 -1`
  - `result`: `trait_delta(trait='val', delta=2)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=2`가 기록되어 있다.
- `gangster` / `나쁜 패거리와 어울린다.`
  - `resultText`: `친구들이 집에는 돌아가라고 하네요.\n지능 -1, 매력 +2`
  - `result`: `trait_delta(trait='val', delta=-1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=-1`이 기록되어 있다.

## 후속 연결

- 이전 이벤트: [중2병 (`middle_school_chuunibyou`)](./중2병_middle_school_chuunibyou.md) (`runaway` 선택)
- 다음 이벤트: 없음
- 같은 체인 문서: [가출 체인](../../chains/가출-체인.md)
- 같은 시기 인덱스: [청소년기 인덱스](./README.md)

## 운영 메모

- 직접 `병사`는 아니지만 `혼절` 상태로 이어져 매우 위험하다.
- 체인은 짧지만 위험 강도는 높은 편이라 운영상 주의해서 보는 이벤트다.

## 관련 문서

- [청소년기 인덱스](./README.md)
- [가출 체인](../../chains/가출-체인.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
