# 직장 부당대우

## 개요

30대 초반 직장 스트레스 이벤트다.  
문제 제기, 인내, 이직, 건강 악화 선택으로 경제와 성향 변화가 갈린다.

## 기본 정보

- 코드: `workplace_unfair_treatment`
- 표시 문구: `직장에서 부당한 대우를 받는다.`
- 확률: `0.62`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `32세`여야 한다.
- 성별이 `M` 또는 `F`여야 한다.

## 선택지와 결과

- `a` / `정식으로 문제를 제기한다.`
  - `resultText`: `노동청 신고 끝에 합의금을 받아냈습니다.`
  - `result`: `multi([trait_delta(domain='per', attribute='conflict', traitType='negotiation', delta=1), asset_delta(amount=5000000)])`
  - `asset_delta(amount=5000000)`으로 자산이 `500만원` 증가한다.
- `b` / `당분간 참고 버틴다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='val', attribute='morality', traitType='principle', delta=-1)`
- `c` / `즉시 이직을 준비한다.`
  - `resultText`: `이직 공백기 동안 생활비가 줄었습니다.`
  - `result`: `multi([trait_delta(domain='val', attribute='goal', traitType='growth', delta=1), asset_delta(amount=-2000000)])`
  - `asset_delta(amount=-2000000)`으로 자산이 `200만원` 감소한다.
- `d` / `스트레스로 몸살이 난다.`
  - `resultText`: `병원 신세를 지며 돈도 나갔습니다.`
  - `result`: `multi([disease(disease='몸살'), asset_delta(amount=-3000000)])`
  - `disease='몸살'`로 변경된다.
  - `asset_delta(amount=-3000000)`으로 자산이 `300만원` 감소한다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [진로 / 직업기 인덱스](./README.md)

## 운영 메모

- 손익과 성향 변화를 동시에 체감시키는 직장 스트레스 이벤트다.
- 몸살 유입 선택지가 있어 건강 축과도 연결된다.

## 관련 문서

- [진로 / 직업기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
