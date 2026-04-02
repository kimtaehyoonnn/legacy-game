# 운영 문서 인덱스

이 디렉토리는 현 프로젝트의 `직업`과 `이벤트` 구조를 운영자 관점에서 빠르게 파악하기 위한 문서를 담는다.  
목표는 밸런스 조정, 진행 흐름 확인, 후속 분기 점검, 경제/상태 변화 포인트 추적을 쉽게 만드는 것이다.

## 문서 목록

- [직업 문서](./jobs.md): 직업 정의, 배정 경로, 수입/지출 반영 구조, 운영 메모
- [이벤트 개요 문서](./events.md): 이벤트 문서 허브 소개와 핵심 규칙 요약
- [이벤트 허브](./events/README.md): 시기별 정본 문서와 체인 허브의 메인 인덱스
- [성격 문서](./personality.md): 성격 도메인 구조, 속성/타입, 타이틀 규칙, UI 표시 메모
- [가치관 문서](./values.md): 가치관 도메인 구조, 속성/타입, 타이틀 규칙, 이벤트 연동 메모
- [건강 문서](./health.md): 건강 도메인 구조, 속성/타입, 타이틀 규칙, 질병 시스템 관계 메모

## 운영 문서 작성 원칙

- 문서는 항상 현재 코드 기준으로 작성한다. 기획 의도보다 구현된 동작을 우선 기록한다.
- 수치, 조건, 분기, 상태값은 가능한 한 원문 코드와 같은 이름으로 적어 추적 가능성을 유지한다.
- 운영자가 빠르게 훑을 수 있도록 `사실 정리 -> 운영 메모` 순서로 정리한다.
- 이벤트는 기본적으로 생애 단계 흐름을 기준으로 묶되, 후속 분기와 예외 동작은 별도로 드러낸다.
- 이벤트 문서는 `docs/events/README.md`를 중심으로 시기별 정본 문서와 체인 허브 문서로 나눈다.
- 이벤트 개별 문서는 한국어 제목과 이벤트 코드를 함께 쓰는 파일명 규칙을 유지한다.
- 직업과 이벤트가 경제, 질병, 성향, 후속 이벤트에 미치는 영향은 문서에 명시한다.
- UI 표시 문구와 내부 코드명이 다를 때는 둘 다 남겨서 운영/개발 간 해석 차이를 줄인다.
- 공통 엔진을 공유하는 시스템은 `README`에서 공통 구조를 먼저 설명하고, 세부 데이터는 개별 문서에서 분리해 다룬다.
- 새로운 문서를 추가할 때는 이 `README`에 링크와 소스 오브 트루스를 함께 갱신한다.

## 소스 오브 트루스

아래 파일들이 문서 내용의 기준이 된다.

- `jobDefinitions.js`: 직업 코드, 이름, 기본 월수입, 랜덤 수입 범위
- `events.js`: 일반 이벤트 30개 정의
- `eventEngine.js`: 이벤트 검증, 정규화, 조건 평가, 결과 적용, 이벤트 상태 기록
- `traitsData.js`: 성격/가치관/건강 도메인 특성 스키마, 타이틀 규칙, 해석 로직
- `game.js`: 직업 배정/은퇴, 연간 이벤트 큐 적재, 팝업 노출, 창업자 시작 예외 처리
- `financeSystem.js`: 월수입/연령별 고정지출 합산 및 가문 자산 정산
- `Person.js`: 캐릭터가 보유하는 직업 상태, 이벤트 상태, UI 표시 값

## 시스템 연결 구조

### 직업 흐름

`jobDefinitions.js` 정의  
-> `game.js`의 `setPersonJob()` / `retirePersonJob()` / `assignRandomCareerForLateJoiner()`  
-> `Person.js`의 `jobCode`, `jobName`, `jobMonthlyIncomeKrw`, `careerStage` 반영  
-> `financeSystem.js`의 월 자산 정산에 수입으로 반영

### 이벤트 흐름

`events.js` 정의  
-> `eventEngine.js`의 `normalizeEventDefinitions()`로 검증/정규화  
-> `game.js`의 `enqueueYearlyEvents()`에서 연간 후보 수집 및 큐 등록  
-> `game.js`의 이벤트 팝업에서 선택지 처리  
-> `eventEngine.js`의 `applyEventChoice()`로 결과 적용 및 `eventState` 기록

### 도메인 특성 흐름

`traitsData.js`의 `DOMAIN_TRAIT_SCHEMAS` 정의  
-> `createRandomCoreTraits()` / `createInheritedCoreTraits()`로 생성·상속  
-> 점수(`scores`)에서 대표 타입(`representatives`) 선정  
-> 대표 타입 조합으로 티어/이름(`tier`, `name`) 해석  
-> `applyDomainTraitDelta()`로 점수 갱신 후 재해석  
-> `game.js`의 `getDomainTraitDisplayText()` / `buildTraitsBlockHtml()`와 `Person.js` / `showStatus()` UI에 표시

## 도메인 특성 시스템 공통 메모

- 운영 문서 기준 도메인 특성은 `성격(per)`, `가치관(val)`, `건강(hlt)` 세 가지다.
- 각 도메인은 공통적으로 `scores`, `representatives`, `representativeLabels`, `tier`, `name`, `fallbackRepresentative`, `lastUserChangeSeqByType`를 가진다.
- 동점 상황에서는 최근 사용자 선택 순서(`lastUserChangeSeqByType`)와 이번 액션에서 바뀐 타입이 우선권을 가진다.
- 출생 시에는 `createInheritedCoreTraits()`로 부모의 성격/가치관/건강이 상속된다.
- 상태창, 출산 팝업, 결혼 후보 카드 모두 같은 표시 헬퍼를 공유한다.
- 현재 이벤트 데이터의 `trait_delta`는 축약형(`trait`, `delta`) 중심으로 작성돼 있지만, trait 엔진 자체는 `domain`, `attribute`, `traitType` 기반의 세분화된 payload를 처리하도록 설계돼 있다.

## 핵심 운영 포인트

- 직업은 캐릭터별 월수입을 결정하고, 이 값은 연령별 고정지출과 함께 가문 전체 자산에 합산된다.
- 직업 상태는 `careerStage`로 관리된다. 현재 구현상 상태값은 `none`, `selected`, `retired` 세 가지다.
- 이벤트는 `isAlive && isMain`인 캐릭터만 평가 대상이다.
- 이벤트는 사람별 `firedCodes`에 기록되므로, 같은 코드의 이벤트는 한 번만 발화한다.
- 후속 이벤트는 `eventState.choiceByCode`에 저장된 과거 선택값을 조건으로 참조한다.
- `career_initial_choice`는 일반 정의도 존재하지만, 게임 시작 직후 1대 가주에게는 별도 커스텀 이벤트가 큐에 우선 삽입된다.
- 이벤트 상세 정본은 모두 `docs/events/by-period/` 아래에 두고, `docs/events/chains/`는 체인 설명과 링크 허브로만 사용한다.
- 운영 문서 기준 총량은 `직업 21개`, `이벤트 30개`, 핵심 도메인 특성 문서 `3개`다.
