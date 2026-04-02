# 첫사랑 츤데레 성공

## 개요

첫사랑 체인의 츤데레 성공 분기다.  
고백 대신 애매한 태도를 골랐더라도 외모 티어가 높으면 긍정 결과가 나온다.

## 기본 정보

- 코드: `first_crush_tsundere_good`
- 표시 문구: `싫어하는 척했지만... 짝꿍이 먼저 말을 걸어옵니다.`
- 확률: `1.0`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `12세`여야 한다.
- `eventState.choiceByCode.first_crush === 'tsundere'`여야 한다.
- 외모 티어가 `SSR` 또는 `SR`이어야 한다.

## 선택지와 결과

- `ok` / `짝꿍이 당신을 마음에 들어합니다.`
  - `resultText`: `짝꿍이 당신을 마음에 들어합니다. 설레는 봄날입니다.`
  - `result`: `trait_delta(domain='per', attribute='interpersonal', traitType='selective', delta=1)`

## 후속 연결

- 이전 이벤트: [첫사랑 (`first_crush`)](./첫사랑_first_crush.md)
- 다음 이벤트: 없음
- 같은 체인 문서: [첫사랑 체인](../../chains/첫사랑-체인.md)
- 같은 시기 인덱스: [유년기 / 아동기 인덱스](./README.md)

## 운영 메모

- 고백이 아니라도 성공 루트가 존재한다는 점이 첫사랑 체인의 재미 포인트다.
- 결국 외모 티어가 성공/실패를 가르는 구조는 동일하다.

## 관련 문서

- [유년기 / 아동기 인덱스](./README.md)
- [첫사랑 체인](../../chains/첫사랑-체인.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
