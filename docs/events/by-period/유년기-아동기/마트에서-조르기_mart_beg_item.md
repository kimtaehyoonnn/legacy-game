# 마트에서 조르기

## 개요

5세 시점에 등장하는 초기 성향 보정 이벤트다.  
부모의 대응에 따라 성격 또는 가치관 축이 가볍게 흔들린다.

## 기본 정보

- 코드: `mart_beg_item`
- 표시 문구: `마트에 가서 물건을 사달라고 조른다.`
- 확률: `0.95`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `5세`여야 한다.
- 다른 추가 조건은 없다.

## 선택지와 결과

- `strict` / `엄하게 혼낸다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='per', attribute='selfManagement', traitType='diligent', delta=1)`
- `spoil` / `아이의 요구를 들어준다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='val', attribute='goal', traitType='stability', delta=-1)`

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [유년기 / 아동기 인덱스](./README.md)

## 운영 메모

- 가장 이른 연령대 이벤트 중 하나라 초반 성향 방향을 정하는 인상만 남기는 편이 좋다.
- 체인형 이벤트는 아니지만, 플레이 초반 성격/가치관 체감에 영향을 준다.

## 관련 문서

- [유년기 / 아동기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
