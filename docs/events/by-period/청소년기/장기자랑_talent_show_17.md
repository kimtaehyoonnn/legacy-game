# 장기자랑

## 개요

17세 시점의 공연 이벤트이자 장기자랑 체인의 시작점이다.  
무대에 설지 여부가 다음 해 성공/실패 분기로 이어진다.

## 기본 정보

- 코드: `talent_show_17`
- 표시 문구: `학교에서 장기자랑이 열린다.`
- 확률: `0.9`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `17세`여야 한다.
- 다른 추가 조건은 없다.

## 선택지와 결과

- `perform` / `나의 매력을 보여줄 때가 온 것 같다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `peaceful` / `평범한게 좋은거야.`
  - `resultText`: `당신은 평온한 일상이 어울려보이네요.`
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `boo` / `다른 친구들의 공연을 보며 야유한다.`
  - `resultText`: `모두가 당신에게 돌을 던집니다. 건강 -1, 매력 -5`
  - `result`: `multi([trait_delta(domain='per', attribute='interpersonal', traitType='active', delta=-1), trait_delta(domain='per', attribute='conflict', traitType='negotiation', delta=-1)])`
- 모든 선택지는 적용 후 `eventState.choiceByCode.talent_show_17`에 선택한 `id`가 저장된다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: `perform + 외모 SSR/SR ->` [장기자랑 성공 (`talent_show_result_good`)](./장기자랑-성공_talent_show_result_good.md), `perform + 외모 비SSR/SR ->` [장기자랑 실패 (`talent_show_result_bad`)](./장기자랑-실패_talent_show_result_bad.md)
- 같은 체인 문서: [장기자랑 체인](../../chains/장기자랑-체인.md)
- 같은 시기 인덱스: [청소년기 인덱스](./README.md)

## 운영 메모

- `perform`가 아니면 후속 체인이 열리지 않는다.
- 외모 티어가 실제 결과를 가르는 체인 입력 이벤트다.

## 관련 문서

- [청소년기 인덱스](./README.md)
- [장기자랑 체인](../../chains/장기자랑-체인.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
