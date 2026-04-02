# SNS 바이럴

## 개요

37세 시점의 큰 자산 상승 가능성 이벤트다.  
중반기 경제 변동성이 큰 대표 사례 중 하나다.

## 기본 정보

- 코드: `viral_sns_post`
- 표시 문구: `SNS에 올린 글이 대박이 난다.`
- 확률: `0.33`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `37세`여야 한다.
- 게임 연차가 `15년 이상`이어야 한다.

## 선택지와 결과

- `a` / `콘텐츠 활동을 본격화한다.`
  - `resultText`: `광고 협찬과 후원이 쇄도했습니다!`
  - `result`: `multi([trait_delta(trait='per', delta=1), asset_delta(amount=20000000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=1`이 기록되어 있다.
  - `asset_delta(amount=20000000)`으로 자산이 `2000만원` 증가한다.
- `b` / `관심이 부담되어 숨는다.`
  - `resultText`: `잠깐의 바이럴로 광고 수익이 조금 들어왔습니다.`
  - `result`: `multi([trait_delta(trait='per', delta=-1), asset_delta(amount=5000000)])`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=-1`이 기록되어 있다.
  - `asset_delta(amount=5000000)`으로 자산이 `500만원` 증가한다.
- `c` / `반응을 차분히 관찰한다.`
  - `resultText`: `조용히 수익화해서 용돈을 챙겼습니다.`
  - `result`: `asset_delta(amount=5000000)`
  - `asset_delta(amount=5000000)`으로 자산이 `500만원` 증가한다.
- `d` / `무리하게 달리다 지친다.`
  - `resultText`: `장비 구입과 병원비로 오히려 적자입니다.`
  - `result`: `multi([disease(disease='감기'), asset_delta(amount=-1000000)])`
  - `disease='감기'`로 변경된다.
  - `asset_delta(amount=-1000000)`으로 자산이 `100만원` 감소한다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [진로 / 직업기 인덱스](./README.md)

## 운영 메모

- `buy_lottery_ticket`, `buy_land`와 함께 경제 변동성이 큰 축이다.
- 확률은 낮지만 자산 체감이 커서 운영상 눈에 띈다.

## 관련 문서

- [진로 / 직업기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
