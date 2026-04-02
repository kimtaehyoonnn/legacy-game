# 중2병

## 개요

15세 시점의 반항 이벤트이자 가출 체인의 입력점이다.  
선택지에 따라 외모, 건강, 성격 축이 흔들리고 `runaway`만 별도 체인을 연다.

## 기본 정보

- 코드: `middle_school_chuunibyou`
- 표시 문구: `사춘기(중2병)이 생긴다. 어떻게 할까?`
- 확률: `0.95`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `15세`여야 한다.
- 다른 추가 조건은 없다.

## 선택지와 결과

- `obey` / `부모님께 순종한다.`
  - `resultText`: `당신은 착한 아이입니다.`
  - `result`: `trait_delta(trait='per', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=1`이 기록되어 있다.
- `dyehair` / `반항하기 위해 머리를 물들인다.`
  - `resultText`: `염색에 실패해 학교에서 놀림을 받습니다. 매력이 떨어집니다.`
  - `result`: `trait_delta(trait='app', delta=-2)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='app', delta=-2`가 기록되어 있다.
- `runaway` / `가출한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='hlt', delta=-1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='hlt', delta=-1`이 기록되어 있다.
- 모든 선택지는 적용 후 `eventState.choiceByCode.middle_school_chuunibyou`에 선택한 `id`가 저장된다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: `runaway 선택 시 ->` [가출 후 위기 (`runaway_danger_16`)](./가출-후-위기_runaway_danger_16.md)
- 같은 체인 문서: [가출 체인](../../chains/가출-체인.md)
- 같은 시기 인덱스: [청소년기 인덱스](./README.md)

## 운영 메모

- `runaway`는 다른 선택과 달리 다음 해 생존 리스크 이벤트를 연다.
- 청소년기 이벤트 중 후속 체인 영향이 가장 직접적인 편이다.

## 관련 문서

- [청소년기 인덱스](./README.md)
- [가출 체인](../../chains/가출-체인.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
