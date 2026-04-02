# 첫사랑 고백 실패

## 개요

첫사랑 체인의 고백 실패 분기다.  
같은 고백 선택이어도 외모 티어가 낮으면 반대 결과로 이어진다.

## 기본 정보

- 코드: `first_crush_confess_bad`
- 표시 문구: `짝꿍이 당신을 물끄러미 바라보더니... 고개를 젓습니다.`
- 확률: `1.0`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `12세`여야 한다.
- `eventState.choiceByCode.first_crush === 'confess'`여야 한다.
- 외모 티어가 `SSR`, `SR`가 아니어야 한다.

## 선택지와 결과

- `ok` / `짝꿍이 당신을 역겨워합니다.`
  - `resultText`: `짝꿍이 당신을 역겨워합니다. 거절당했습니다.`
  - `result`: `trait_delta(domain='per', attribute='emotional', traitType='direct', delta=-1)`

## 후속 연결

- 이전 이벤트: [첫사랑 (`first_crush`)](./첫사랑_first_crush.md)
- 다음 이벤트: 없음
- 같은 체인 문서: [첫사랑 체인](../../chains/첫사랑-체인.md)
- 같은 시기 인덱스: [유년기 / 아동기 인덱스](./README.md)

## 운영 메모

- 입력 선택은 같아도 외모 티어에 따라 보상이 뒤집히는 구조다.
- 체인 설계상 플레이어가 외모 티어 중요성을 간접 체감하게 만든다.

## 관련 문서

- [유년기 / 아동기 인덱스](./README.md)
- [첫사랑 체인](../../chains/첫사랑-체인.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
