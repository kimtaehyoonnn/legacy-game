# 건강 운영 문서

## 개요

건강 도메인(`hlt`)은 캐릭터의 체력, 회복력, 취약 부위, 성적 욕구, 스트레스 내성을 묶어서 표현한다.  
건강 타이틀은 별도 질병 상태와는 다른 층위의 특성 시스템이며, 질병 시스템은 `disease` 필드에서 따로 관리된다.

## 소스 오브 트루스

- `traitsData.js`: `DOMAIN_TRAIT_SCHEMAS.hlt`, 생성/상속/해석/갱신 로직
- `game.js`: `getDomainTraitDisplayText()`, `buildTraitsBlockHtml()` 표시 로직
- `Person.js`: 노드 카드와 상태창 건강 표시
- `eventEngine.js`: 건강 관련 `trait_delta` 적용 진입점
- `events.js`: 건강 변화 이벤트 정의

## 도메인 구조

- 도메인 키: `hlt`
- 표시 라벨: `건강`
- 내부 구조:
- `scores`: 속성별 타입 점수
- `representatives`: 속성별 대표 타입
- `representativeLabels`: 대표 타입 표시 문구
- `tier`: `SSR`, `SR`, `R`, `N`
- `name`: 최종 건강명
- `fallbackRepresentative`: 타이틀 미충족 시 대표 fallback 타입
- `lastUserChangeSeqByType`: 최근 사용자 선택 우선순위 기록

## 속성/타입 표

| 속성 key | 표시명 | 타입 key | 타입 라벨 | N 티어 fallback 이름 |
| --- | --- | --- | --- | --- |
| `fitness` | 기본체력 | `strong` | 강함 | 체력강함 |
| `fitness` | 기본체력 | `normal` | 보통 | 체력보통 |
| `fitness` | 기본체력 | `weak` | 약함 | 체력약함 |
| `recovery` | 회복력 | `fast` | 빠름 | 회복빠름 |
| `recovery` | 회복력 | `slow` | 느림 | 회복느림 |
| `recovery` | 회복력 | `normal` | 보통 | 회복보통 |
| `vulnerability` | 취약점 | `none` | 없음 | 취약없음 |
| `vulnerability` | 취약점 | `respiratory` | 호흡기 | 호흡취약 |
| `vulnerability` | 취약점 | `digestive` | 소화기 | 소화취약 |
| `vulnerability` | 취약점 | `heart` | 심장 | 심장취약 |
| `vulnerability` | 취약점 | `hair` | 머리숱 | 머리숱취약 |
| `libido` | 성적욕구 | `high` | 높음 | 성욕높음 |
| `libido` | 성적욕구 | `normal` | 보통 | 성욕보통 |
| `libido` | 성적욕구 | `low` | 낮음 | 성욕낮음 |
| `stress` | 스트레스내성 | `high` | 높음 | 스트레스내성높음 |
| `stress` | 스트레스내성 | `normal` | 보통 | 스트레스내성보통 |
| `stress` | 스트레스내성 | `low` | 낮음 | 스트레스내성낮음 |

## 티어/타이틀 규칙

### SSR

| 이름 | 조건 |
| --- | --- |
| `무병장수` | `fitness=strong`, `recovery=fast`, `vulnerability=none`, `stress=high` |
| `개복치` | `fitness=weak`, `recovery=slow`, `libido=high`, `stress=low` |
| `지극평범` | `fitness=normal`, `recovery=normal`, `libido=normal`, `stress=normal` |

### SR

| 이름 | 조건 |
| --- | --- |
| `인자강` | `fitness=strong`, `vulnerability=none`, `stress=high` |
| `에너자이저` | `fitness=strong`, `recovery=fast`, `libido=high` |
| `변강쇠` | `recovery=fast`, `vulnerability=none`, `libido=high` |
| `비실이` | `fitness=weak`, `recovery=slow`, `stress=low` |
| `무욕인` | `recovery=slow`, `stress=low`, `libido=low` |
| `보통평범` | `fitness=normal`, `recovery=normal`, `stress=normal` |

### R

| 이름 | 조건 |
| --- | --- |
| `뿡뿡이` | `vulnerability=digestive`, `stress=high` |
| `대머리수리` | `vulnerability=hair`, `libido=high` |
| `튼튼이` | `fitness=strong`, `stress=high` |
| `멘탈좀비` | `recovery=fast`, `stress=low` |
| `약간평범` | `fitness=normal`, `recovery=normal` |

### N 티어 fallback 규칙

- 타이틀 조건에 걸리지 않으면 `tier`는 `N`이 된다.
- 이 경우 도메인 전체 최고 점수 타입의 `nName`이 최종 건강명으로 사용된다.
- 예: `체력강함`, `호흡취약`, `스트레스내성보통` 같은 이름이 그대로 건강명으로 노출될 수 있다.

## 생성·상속·갱신 흐름

- 초기 생성은 `createRandomCoreTraits()` -> `createRandomDomainTrait('hlt')`로 이뤄진다.
- 출생 시에는 `createInheritedCoreTraits()` -> `createInheritedDomainTrait('hlt', parentA, parentB)`를 사용한다.
- 점수 해석은 `resolveDomainTrait()`가 수행한다.
- 속성별 대표 타입을 정한 뒤, `fitness`, `recovery`, `vulnerability`, `libido`, `stress` 조합이 타이틀 규칙과 맞으면 상위 티어 이름을 부여한다.
- 동점이면 최근 사용자 선택 순서(`lastUserChangeSeqByType`)와 이번 액션 변화분이 우선한다.
- 건강 도메인 갱신은 `applyDomainTraitDelta()` 이후 즉시 재해석된다.

## UI 표시 방식

- 노드 카드와 상태창에서는 `[건강] {이름}` 형식으로 보인다.
- 대표 타입 표시가 켜지면 `이름 (대표타입 요약)` 형식으로 노출된다.
- 출생 팝업, 결혼 후보 카드, 상태창 모두 공통 표시 헬퍼를 사용한다.
- 건강 특성 표시는 질병 상태 표시와 별개로 존재한다.

## 운영 메모

- 건강 타이틀이 좋다고 해서 현재 `disease` 상태가 자동으로 좋아지는 것은 아니다.
- 실제 질병 상태는 `감기`, `몸살`, `혼절`, `병사` 같은 문자열로 따로 관리된다.
- 즉, 건강 도메인은 “체질/성향”, 질병 시스템은 “현재 상태”에 가깝다.
- 운영상 건강 밸런스를 볼 때는 `hlt` 문서와 함께 이벤트 문서의 질병 관련 이벤트도 같이 봐야 한다.
- 현재 이벤트 데이터의 `trait_delta`는 `hlt` 도메인에도 `domain`, `attribute`, `traitType`, `delta` 세분화 payload를 사용한다.
- 건강 관련 서사나 선택지를 만들 때는 건강 타이틀과 질병 상태를 혼동하지 않도록 주의하는 편이 좋다.
