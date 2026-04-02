# 이벤트 개요 문서

## 개요

이벤트 문서는 이제 단일 상세 문서가 아니라 `docs/events/` 아래의 문서 집합으로 운영한다.  
상세 이벤트 정본은 시기별 디렉토리 아래에 두고, 체인 문서는 흐름 설명과 링크 허브 역할만 맡는다.

## 문서 구조

- [이벤트 허브](./events/README.md)
- [시기별 정본 문서](./events/by-period/README.md)
- [체인 허브 문서](./events/chains/README.md)

## 핵심 규칙 요약

- 이벤트 정본 문서는 모두 `docs/events/by-period/` 아래에만 둔다.
- 체인 문서는 `docs/events/chains/` 아래에 두며, 개별 이벤트 본문을 중복하지 않는다.
- 개별 이벤트 문서 파일명은 `한국어-제목_{eventCode}.md` 규칙을 따른다.
- 개별 이벤트 문서는 한국어 본문으로 쓰고, 상단에 이벤트 코드와 원본 정의 파일을 명시한다.
- 문서 간 이동은 모두 상대 경로 Markdown 링크로 연결한다.

## 이벤트 시스템 요약

### 이벤트 정의 스키마

```js
{
  code: '고유 코드',
  text: '팝업 본문',
  probability: 0.0 ~ 1.0,
  condition: { ... },
  choices: [
    {
      id: '선택지 코드',
      text: '버튼 문구',
      resultText: '선택 후 출력 문구',
      result: { type: 'none' | 'disease' | 'trait_delta' | 'set_job' | 'asset_delta' | 'multi', ... }
    }
  ]
}
```

### 조건 연산

- 그룹 연산: `and`, `or`
- 리프 연산: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`

### 결과 타입

- `none`
- `disease`
- `trait_delta`
- `set_job`
- `asset_delta`
- `multi`

### trait_delta payload 규칙

- `per`, `val`, `hlt` 도메인의 `trait_delta`는 아래 세분화 형태만 사용한다.

```js
{ type: 'trait_delta', domain: 'per|val|hlt', attribute: '...', traitType: '...', delta: number }
```

- 기존 축약형 `trait='per|val|hlt', delta=...`는 더 이상 사용하지 않는다.
- `app`(외모)만 레거시 호환을 위해 `trait='app', delta=...` 형식을 유지한다.
- 이벤트별 실제 세분화 payload는 `docs/events/by-period/`의 개별 이벤트 문서에 직접 기록한다.

### 발화 규칙

- 평가 대상은 `isAlive && isMain` 캐릭터뿐이다.
- 이벤트는 `normalizeEventDefinitions()`를 거쳐 검증/정규화된다.
- 후보 수집 시점에 조건과 `probability`를 함께 판정한다.
- 발화한 이벤트 코드는 `eventState.firedCodes`에 기록되어 재발화하지 않는다.
- 선택 결과는 `eventState.choiceByCode[eventCode]`에 저장돼 후속 이벤트가 참조한다.

## 운영 포인트

- 확정 진로 이벤트는 `career_initial_choice`, `career_post_student_choice` 두 개다.
- 위 두 진로 이벤트는 `events.js`의 고정 `choices`를 그대로 노출하지 않고, `JOB_DEFINITIONS[*].appearanceCondition` 기반으로 런타임 동적 선택지를 사용한다.
- 경제 변동성이 큰 이벤트는 `viral_sns_post`, `buy_lottery_ticket`, `buy_land`다.
- 대표 체인 문서는 `첫사랑`, `가출`, `장기자랑` 세 축이다.
- 현재 이벤트 데이터의 `trait_delta`는 `per/val/hlt` 기준 세분화 payload를 사용한다.
- 시기별 개별 문서가 서사/흐름과 실제 payload를 함께 담는 정본이다.
