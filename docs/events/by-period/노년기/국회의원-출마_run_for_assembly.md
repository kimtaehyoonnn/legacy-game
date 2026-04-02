# 국회의원 출마

## 개요

92세 시점의 희귀 정치 서사 이벤트다.  
경제 변화 없이 가치관, 성격, 건강 방향만 조정한다.

## 기본 정보

- 코드: `run_for_assembly`
- 표시 문구: `국회의원에 출마한다.`
- 확률: `0.17`
- 원본 정의 파일: `events.js`

## 발화 조건

- 나이가 `92세`여야 한다.
- 성별이 `M` 또는 `F`여야 한다.

## 선택지와 결과

- `a` / `정책 중심으로 선거를 치른다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='val', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='val', delta=1`이 기록되어 있다.
- `b` / `공격적인 선거전을 펼친다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='per', delta=-1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='per', delta=-1`이 기록되어 있다.
- `c` / `건강을 우선해 사퇴한다.`
  - `resultText`는 없다.
  - `result`: `trait_delta(trait='hlt', delta=1)`
  - `trait_delta`는 이벤트 정의의 축약형 payload 그대로 `trait='hlt', delta=1`이 기록되어 있다.
- `d` / `상징적으로만 도전한다.`
  - `resultText`는 없다.
  - `result`: `none`
  - 실제 `result`는 `none`이며, 즉시 바뀌는 상태값은 없다.

## 후속 연결

- 이전 이벤트: 없음
- 다음 이벤트: 없음
- 같은 체인 문서: 없음
- 같은 시기 인덱스: [노년기 인덱스](./README.md)

## 운영 메모

- 확률이 매우 낮아 희귀 체험용 이벤트에 가깝다.
- 경제 변화 없이 성향 조정만 있어 톤 전환 역할이 크다.

## 관련 문서

- [노년기 인덱스](./README.md)
- [체인 허브](../../chains/README.md)
- [이벤트 허브](../../README.md)
- [이벤트 개요 문서](../../../events.md)
