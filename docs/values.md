# 가치관 운영 문서

## 개요

가치관 도메인(`val`)은 캐릭터가 무엇을 우선하고, 어떤 목표를 추구하며, 어떤 기준으로 관계와 위험을 해석하는지를 표현한다.  
성격·건강과 같은 공통 엔진을 쓰지만, 이름 해석은 가치 판단과 선택 기준에 초점이 맞춰져 있다.

## 소스 오브 트루스

- `traitsData.js`: `DOMAIN_TRAIT_SCHEMAS.val`, 생성/상속/해석/갱신 로직
- `game.js`: `getDomainTraitDisplayText()`, `buildTraitsBlockHtml()` 표시 로직
- `Person.js`: 노드 카드와 상태창 가치관 표시
- `eventEngine.js`: 가치관 관련 `trait_delta` 적용 진입점
- `events.js`: 가치관 변화 이벤트 정의

## 도메인 구조

- 도메인 키: `val`
- 표시 라벨: `가치관`
- 내부 구조:
- `scores`: 속성별 타입 점수
- `representatives`: 속성별 대표 타입
- `representativeLabels`: 대표 타입 표시 문구
- `tier`: `SSR`, `SR`, `R`, `N`
- `name`: 최종 가치관명
- `fallbackRepresentative`: 타이틀 미충족 시 대표 fallback 타입
- `lastUserChangeSeqByType`: 최근 사용자 선택 우선순위 기록

## 속성/타입 표

| 속성 key | 표시명 | 타입 key | 타입 라벨 | N 티어 fallback 이름 |
| --- | --- | --- | --- | --- |
| `priority` | 우선순위 | `personal` | 개인 | 개인우선 |
| `priority` | 우선순위 | `family` | 가족 | 가족우선 |
| `priority` | 우선순위 | `nation` | 국가 | 국가우선 |
| `priority` | 우선순위 | `workplace` | 직장 | 직장우선 |
| `goal` | 목표지향 | `stability` | 안정 | 안정지향 |
| `goal` | 목표지향 | `growth` | 성장 | 성장지향 |
| `goal` | 목표지향 | `freedom` | 자유 | 자유지향 |
| `goal` | 목표지향 | `equality` | 평등 | 평등지향 |
| `goal` | 목표지향 | `joy` | 즐거움 | 즐거움지향 |
| `morality` | 도덕기준 | `principle` | 원칙 | 원칙중심 |
| `morality` | 도덕기준 | `consequence` | 결과 | 결과중심 |
| `morality` | 도덕기준 | `emotion` | 감정 | 감정중심 |
| `relation` | 관계기준 | `loyalty` | 충성 | 충성기준 |
| `relation` | 관계기준 | `fairness` | 공정 | 공정기준 |
| `relation` | 관계기준 | `love` | 사랑 | 사랑기준 |
| `relation` | 관계기준 | `pragmatic` | 실리 | 실리기준 |
| `risk` | 위험선호도 | `high` | 높음 | 위험선호고 |
| `risk` | 위험선호도 | `medium` | 보통 | 위험선호중 |
| `risk` | 위험선호도 | `low` | 낮음 | 위험선호저 |

## 티어/타이틀 규칙

### SSR

| 이름 | 조건 |
| --- | --- |
| `혁명가` | `priority=family`, `morality=consequence`, `relation=fairness`, `risk=high` |
| `애국자` | `priority=nation`, `goal=growth`, `morality=principle`, `relation=loyalty` |
| `자유인` | `priority=personal`, `goal=freedom`, `relation=love`, `risk=medium` |

### SR

| 이름 | 조건 |
| --- | --- |
| `선비` | `priority=family`, `goal=growth`, `morality=principle` |
| `승부사` | `morality=consequence`, `relation=pragmatic`, `risk=high` |
| `안전제일` | `priority=workplace`, `goal=stability`, `risk=low` |
| `유랑자` | `goal=freedom`, `morality=emotion`, `risk=medium` |
| `수평계` | `goal=equality`, `morality=principle`, `relation=fairness` |
| `달빛광대` | `priority=personal`, `goal=joy`, `relation=love` |

### R

| 이름 | 조건 |
| --- | --- |
| `꼰대` | `priority=workplace`, `morality=principle` |
| `이상주의자` | `priority=nation`, `goal=equality` |
| `기회주의자` | `goal=growth`, `relation=pragmatic` |
| `사랑꾼` | `priority=family`, `relation=love` |
| `히피` | `goal=joy`, `morality=emotion` |

### N 티어 fallback 규칙

- 명시된 타이틀 조합이 성립하지 않으면 `tier`는 `N`이 된다.
- 이때 도메인 전체 최고 점수 타입의 `nName`이 최종 이름이 된다.
- 예: `가족우선`, `원칙중심`, `위험선호저`가 그대로 가치관명으로 보일 수 있다.

## 생성·상속·갱신 흐름

- 초기 생성은 `createRandomCoreTraits()` -> `createRandomDomainTrait('val')`로 이뤄진다.
- 출생 상속은 `createInheritedCoreTraits()` -> `createInheritedDomainTrait('val', parentA, parentB)`를 사용한다.
- 점수 해석은 `resolveDomainTrait()`가 수행한다.
- 각 속성의 대표 타입을 정한 뒤, `priority`, `goal`, `morality`, `relation`, `risk` 조합이 타이틀 조건과 맞으면 해당 이름이 부여된다.
- 동점이면 최근 사용자 선택 순서(`lastUserChangeSeqByType`)와 이번 액션에서 바뀐 타입이 우선한다.
- 가치관 갱신은 `applyDomainTraitDelta()`를 통해 점수에 반영되고 즉시 재해석된다.

## UI 표시 방식

- 상태창 기본 표기는 `[가치관] {이름}`이다.
- 일부 UI에서는 같은 도메인을 `[가치]`로 축약해서 보여준다.
- 출생 팝업과 결혼 후보 카드에서는 `valueLabel` 옵션 때문에 `가치` 또는 `가치관`으로 표기 차이가 난다.
- 대표 타입 표시가 켜지면 `이름 (대표타입 요약)` 형식으로 노출된다.

## 운영 메모

- 가치관명은 `priority`, `goal`, `morality`, `relation`, `risk` 조합으로 정해지므로, 한두 개의 이벤트 선택만으로도 이름이 크게 바뀔 수 있다.
- 현재 이벤트 문서의 일부 선택지는 결과 설명에서 “가치”로 축약돼 보이지만, 내부 도메인은 모두 `val` 하나다.
- 따라서 운영 문서나 기획 논의에서는 “가치”와 “가치관”을 같은 시스템으로 이해하면 된다.
- 현재 이벤트 데이터의 `trait_delta`는 `val` 도메인에도 `domain`, `attribute`, `traitType`, `delta` 세분화 payload를 사용한다.
- 가치관 이벤트를 조정할 때는 단순 수치 변동보다 어떤 속성 축이 강화되는지 보는 편이 실제 결과 예측에 유리하다.
