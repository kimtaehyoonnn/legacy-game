# 성격 운영 문서

## 개요

성격 도메인(`per`)은 캐릭터의 사회성, 감정 표현, 행동 방식, 자기관리, 갈등 대응을 묶어서 표현한다.  
이 시스템은 개별 속성 점수에서 대표 타입을 뽑고, 그 조합으로 최종 티어와 성격명을 정한다.

## 소스 오브 트루스

- `traitsData.js`: `DOMAIN_TRAIT_SCHEMAS.per`, 생성/상속/해석/갱신 로직
- `game.js`: `getDomainTraitDisplayText()`, `buildTraitsBlockHtml()` 표시 로직
- `Person.js`: 노드 카드와 상태창 성격 표시
- `eventEngine.js`: 성격 관련 `trait_delta` 적용 진입점
- `events.js`: 성격 변화 이벤트 정의

## 도메인 구조

- 도메인 키: `per`
- 표시 라벨: `성격`
- 내부 구조:
- `scores`: 속성별 타입 점수
- `representatives`: 속성별 대표 타입
- `representativeLabels`: 대표 타입 표시 문구
- `tier`: `SSR`, `SR`, `R`, `N`
- `name`: 최종 성격명
- `fallbackRepresentative`: 타이틀 미충족 시 대표 fallback 타입
- `lastUserChangeSeqByType`: 최근 사용자 선택 우선순위 기록

## 속성/타입 표

| 속성 key | 표시명 | 타입 key | 타입 라벨 | N 티어 fallback 이름 |
| --- | --- | --- | --- | --- |
| `interpersonal` | 대인관계성 | `active` | 적극교류형 | 적극교류 |
| `interpersonal` | 대인관계성 | `selective` | 선택교류형 | 선택교류 |
| `interpersonal` | 대인관계성 | `distancing` | 거리두기형 | 거리두기 |
| `interpersonal` | 대인관계성 | `isolated` | 고립형 | 관계고립 |
| `emotional` | 감정표현성 | `direct` | 직설적 | 표현직설 |
| `emotional` | 감정표현성 | `restrained` | 절제형 | 표현절제 |
| `emotional` | 감정표현성 | `rich` | 풍부함 | 표현풍부 |
| `emotional` | 감정표현성 | `artistic` | 예술적표현 | 표현예술 |
| `behavior` | 행동성향 | `planned` | 계획형 | 행동계획 |
| `behavior` | 행동성향 | `impulsive` | 충동형 | 행동충동 |
| `behavior` | 행동성향 | `balanced` | 균형형 | 행동균형 |
| `selfManagement` | 자기관리 | `diligent` | 성실함 | 관리성실 |
| `selfManagement` | 자기관리 | `lazy` | 게으름 | 관리게으름 |
| `selfManagement` | 자기관리 | `balanced` | 균형형 | 관리균형 |
| `conflict` | 갈등대응 | `negotiation` | 협상형 | 갈등협상 |
| `conflict` | 갈등대응 | `competitive` | 경쟁적 | 갈등경쟁 |
| `conflict` | 갈등대응 | `avoidant` | 회피형 | 갈등회피 |
| `conflict` | 갈등대응 | `breakthrough` | 정면돌파형 | 갈등돌파 |

## 티어/타이틀 규칙

### SSR

| 이름 | 조건 |
| --- | --- |
| `마당발` | `interpersonal=active`, `behavior=balanced`, `selfManagement=diligent`, `conflict=negotiation` |
| `눈치백단` | `emotional=restrained`, `behavior=planned`, `selfManagement=balanced`, `conflict=avoidant` |
| `독고다이` | `interpersonal=isolated`, `emotional=direct`, `behavior=impulsive`, `selfManagement=lazy` |
| `광인` | `interpersonal=distancing`, `emotional=artistic`, `behavior=impulsive`, `conflict=breakthrough` |

### SR

| 이름 | 조건 |
| --- | --- |
| `이야기꾼` | `emotional=artistic`, `selfManagement=balanced`, `conflict=negotiation` |
| `능구렁이` | `interpersonal=active`, `emotional=rich`, `conflict=avoidant` |
| `관종` | `interpersonal=active`, `emotional=artistic`, `conflict=breakthrough` |
| `포커페이스` | `interpersonal=distancing`, `emotional=restrained`, `behavior=planned` |
| `야무진놈` | `interpersonal=selective`, `behavior=balanced`, `selfManagement=diligent` |

### R

| 이름 | 조건 |
| --- | --- |
| `박치기공룡` | `emotional=direct`, `conflict=competitive` |
| `인간컴퓨터` | `emotional=restrained`, `selfManagement=diligent` |
| `묵묵` | `interpersonal=isolated`, `emotional=restrained` |
| `스노브` | `interpersonal=selective`, `emotional=artistic` |
| `츤데레` | `emotional=restrained`, `conflict=avoidant` |
| `시인병` | `emotional=artistic`, `selfManagement=lazy` |
| `울보` | `emotional=rich`, `behavior=impulsive` |
| `인간탱탱볼` | `behavior=impulsive`, `conflict=breakthrough` |

### N 티어 fallback 규칙

- 위 표의 조건에 해당하지 않으면 `tier`는 `N`이 된다.
- 이 경우 도메인 전체에서 점수가 가장 높은 타입 하나를 골라 그 타입의 `nName`을 `name`으로 사용한다.
- 예: `표현직설`, `갈등회피`, `행동계획` 같은 이름이 직접 성격명으로 노출될 수 있다.

## 생성·상속·갱신 흐름

- 초기 생성은 `createRandomCoreTraits()` -> `createRandomDomainTrait('per')`로 이뤄진다.
- 각 타입 점수는 무작위 초기값으로 시작한다.
- 출생 시에는 `createInheritedCoreTraits()` -> `createInheritedDomainTrait('per', parentA, parentB)`가 사용된다.
- 부모의 같은 타입 점수를 절반 확률로 물려받고, 없으면 무작위 값으로 대체한다.
- 점수 해석은 `resolveDomainTrait()`가 수행한다.
- 속성별 최고 점수 타입을 대표값으로 정하고, 대표값 조합이 타이틀 조건과 맞으면 상위 티어 이름을 부여한다.
- 동점이면 `lastUserChangeSeqByType`와 이번 액션에서 바뀐 타입이 우선한다.
- 이벤트나 선택으로 성격이 바뀌면 `applyDomainTraitDelta()`를 거쳐 재해석된다.

## UI 표시 방식

- 노드 카드와 상태창에서는 `[성격] {이름}` 형식으로 표시된다.
- `showRepresentative`가 켜진 UI에서는 `이름 (대표타입 요약)` 형식으로 보인다.
- 출생 팝업, 결혼 후보 카드, 상태창 모두 `buildTraitsBlockHtml()`를 공유한다.
- `Person.js`의 노드 본문에서는 `getNodeTraitText()`로 `trait.name`만 표시한다.

## 운영 메모

- 성격명은 단일 수치가 아니라 `대인관계성`, `감정표현성`, `행동성향`, `자기관리`, `갈등대응`의 대표 타입 조합으로 만들어진다.
- 따라서 이벤트 하나로 점수 하나만 바뀌어도 대표 타입이 뒤집히면 성격명이 크게 달라질 수 있다.
- 현재 이벤트 데이터의 `trait_delta`는 `per` 도메인에도 `domain`, `attribute`, `traitType`, `delta` 세분화 payload를 사용한다.
- 운영상 성격 이벤트를 설계할 때는 “대인 성향을 올린다” 수준이 아니라 어떤 속성/타입을 밀고 있는지까지 확인하는 것이 안전하다.
