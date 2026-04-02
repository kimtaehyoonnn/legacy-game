# 첫사랑 고백 성공

## 개요

첫사랑 체인의 고백 성공 분기다.  
외모 티어가 높을 때만 열리는 긍정 후속 이벤트다.

## 기본 정보

- 코드: `first_crush_confess_good`
- 표시 문구: `두근두근... 용기 있는 고백에 짝꿍이 환하게 웃습니다.`
- 확률: `1.0`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `12세`여야 한다.
- `eventState.choiceByCode.first_crush === 'confess'`여야 한다.
- 외모 티어가 `SSR` 또는 `SR`이어야 한다.

## 선택지와 결과

- `ok` / `짝꿍과 연인이 되었습니다!`
  - `resultText`: `짝꿍과 연인이 되었습니다! 첫사랑이 이루어지는 순간입니다.`
  - `result`: `trait_delta(trait='per', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=1`이 기록되어 있다.

## 후속 연결

- 이전 이벤트: [첫사랑 (`first_crush`)](./첫사랑_first_crush.md)
- 다음 이벤트: 없음
- 같은 체인 문서: [첫사랑 체인](../../chains/첫사랑-체인.md)
- 같은 시기 인덱스: [유년기 / 아동기 인덱스](./README.md)

## 운영 메모

- `confess` 루트의 성공 케이스다.
- 외모 티어 조건이 직접 결과를 가르는 대표 사례다.

## 관련 문서

- [유년기 / 아동기 인덱스](./README.md)
- [첫사랑 체인](../../chains/첫사랑-체인.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
