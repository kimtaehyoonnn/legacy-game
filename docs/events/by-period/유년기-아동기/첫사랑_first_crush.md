# 첫사랑

## 개요

11세 시점의 감정 이벤트이자 첫사랑 체인의 시작점이다.  
즉시 효과보다 다음 해 분기 입력값 역할이 더 중요하다.

## 기본 정보

- 코드: `first_crush`
- 표시 문구: `짝꿍이 마음에 든다.`
- 확률: `0.9`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `11세`여야 한다.
- `isMarried === false`여야 한다.

## 선택지와 결과

- `confess` / `솔직하게 마음을 고백한다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `tsundere` / `맘에 들지만 싫어하는 척 한다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- 모든 선택지는 적용 후 `eventState.choiceByCode.first_crush`에 선택한 `id`가 저장된다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: `confess + 외모 SSR/SR ->` [첫사랑 고백 성공 (`first_crush_confess_good`)](./첫사랑-고백-성공_first_crush_confess_good.md), `confess + 외모 비SSR/SR ->` [첫사랑 고백 실패 (`first_crush_confess_bad`)](./첫사랑-고백-실패_first_crush_confess_bad.md), `tsundere + 외모 SSR/SR ->` [첫사랑 츤데레 성공 (`first_crush_tsundere_good`)](./첫사랑-츤데레-성공_first_crush_tsundere_good.md), `tsundere + 외모 비SSR/SR ->` [첫사랑 츤데레 실패 (`first_crush_tsundere_bad`)](./첫사랑-츤데레-실패_first_crush_tsundere_bad.md)
- 같은 체인 문서: [첫사랑 체인](../../chains/첫사랑-체인.md)
- 같은 시기 인덱스: [유년기 / 아동기 인덱스](./README.md)

## 운영 메모

- 이 이벤트는 실제 보상보다 `eventState.choiceByCode.first_crush`에 무엇이 기록되는지가 핵심이다.
- 12세 후속 이벤트는 외모 티어까지 같이 보므로, 입력 이벤트로서의 중요성이 높다.

## 관련 문서

- [유년기 / 아동기 인덱스](./README.md)
- [첫사랑 체인](../../chains/첫사랑-체인.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
