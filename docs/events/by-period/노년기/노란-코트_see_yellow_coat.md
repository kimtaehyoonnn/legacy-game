# 노란 코트

## 개요

100세 시점의 초후반 회수형 이벤트다.  
긴 수명과 충분한 게임 연차를 전제로 하는 매우 늦은 타이밍의 서사 이벤트다.

## 기본 정보

- 코드: `see_yellow_coat`
- 표시 문구: `노란 코트가 옷가게에 있는 걸 본다.`
- 확률: `0.51`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `100세`여야 한다.
- 게임 연차가 `30년 이상`이어야 한다.

## 선택지와 결과

- `a` / `추억을 떠올리며 구매한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='per', attribute='emotional', traitType='rich', delta=1)`
- `b` / `지나가듯 보고 웃는다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.
- `c` / `충동구매 후 후회한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(domain='val', attribute='risk', traitType='low', delta=-1)`
- `d` / `옷보다 건강부터 챙긴다.`
  - `resultText`는 없다.
  - `result`: `disease(disease=null)`
  - `disease=null`로 변경된다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [노년기 인덱스](./README.md)

## 운영 메모

- 100세 도달 전제라 실제 체감 빈도는 낮다.
- 매우 후반부 감정 회수와 질병 해제 선택지를 함께 제공한다.

## 관련 문서

- [노년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
