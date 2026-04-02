# 장기자랑 실패

## 개요

장기자랑 체인의 실패 후속 이벤트다.  
같은 `perform` 선택이어도 외모 티어가 낮으면 분위기가 실패로 흐른다.

## 기본 정보

- 코드: `talent_show_result_bad`
- 표시 문구: `무대 위의 당신... 분위기가 몹시 어색합니다.`
- 확률: `1.0`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `18세`여야 한다.
- `eventState.choiceByCode.talent_show_17 === 'perform'`여야 한다.
- 외모 티어가 `SSR`, `SR`가 아니어야 한다.

## 선택지와 결과

- `ok` / `당신의 흑역사가 인터넷에 영원히 박제되었습니다.`
  - `resultText`: `당신의 흑역사가 인터넷에 영원히 박제되었습니다.`
  - `result`: `trait_delta(domain='per', attribute='emotional', traitType='rich', delta=-1)`

## 후속 연결

- 이전 이벤트: [장기자랑 (`talent_show_17`)](./장기자랑_talent_show_17.md) (`perform` 선택)
- 다음 이벤트: 없음
- 같은 체인 문서: [장기자랑 체인](../../chains/장기자랑-체인.md)
- 같은 시기 인덱스: [청소년기 인덱스](./README.md)

## 운영 메모

- 성공과 실패 차이가 외모 티어에 강하게 묶여 있다.
- 장기자랑 체인의 손실 루트로 보면 된다.

## 관련 문서

- [청소년기 인덱스](./README.md)
- [장기자랑 체인](../../chains/장기자랑-체인.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
