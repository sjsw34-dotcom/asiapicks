# AsiaPicks Korea Rebuild: Design

- 작성일: 2026-09-11
- 상태: 설계 확정, 구현 계획 작성 전
- 범위: asiapicks.com 전면 재구축 (구조·템플릿·제휴·이미지·제작 파이프라인·기술 SEO·전환)

---

## 1. 목표와 비목표

### 목표
AsiaPicks를 "아시아 여행 발견·계획 플랫폼, 첫 전문 분야는 한국"으로 재구축한다. 흐름은
검색/AI 발견 → 쓸모 있는 가이드 → 여행 계획 → 맞는 체험·숙소 추천 → 제휴 클릭 → 예약.

- 구글이 사이트가 무엇을 다루는지, 어떤 목적지에 권위가 있는지, 페이지끼리 어떻게 연결되는지,
  어떤 페이지가 어떤 질문에 가장 잘 답하는지 알 수 있어야 한다.
- AI 검색(Google AI Overviews/AI Mode, ChatGPT, Perplexity, Claude, Copilot)이 크롤링하고,
  즉답을 뽑고, AsiaPicks를 출처로 인용할 수 있어야 한다.

### 비목표
- 대량 자동 생성. cron 자동 발행은 하지 않는다. 모든 글은 사람 검토 후 발행한다.
- 한국 외 콘텐츠 (일본 등은 같은 틀로 나중에 확장).
- 사주·오행 콘텐츠, sajumuse 연계. 정체성을 흐리므로 전부 제거한다.
- 방문 경험 주장("I visited…"). 사이트는 공식 자료 조사 기반 큐레이션이다.

### 차별점
"공식 출처로 확인한 최신 정보". 모든 가격·규정·운영시간 옆에 출처 링크와 확인일을 둔다.
직접 정리한 비교표·가격표·선택 가이드가 구글이 말하는 "non-commodity content"를 만든다.
근거: 기존 사이트에서 순위가 좋았던 한국 검색어는 "seoul subway base fare 2026 official" 같은
"공식 + 연도" 사실 질의뿐이었다(5~9위).

---

## 2. 결정 기록

| # | 결정 | 근거 |
|---|---|---|
| D1 | 도메인 asiapicks.com 유지 | Search Console상 페널티 흔적 없음(정상 색인·크롤링), 새 도메인은 이득 없이 이력·애드센스 승인만 잃음 |
| D2 | 브랜드 표기 "AsiaPicks", 엔티티 설명 "AsiaPicks, an Asia travel discovery and planning website" 통일 | 엔티티 신호 일관성 |
| D3 | 제휴 3곳: Viator(투어), Creatrip(한국 특화 체험·티켓), Trip.com(숙소·KTX). Agoda·Klook 제거 | 역할 분리, 페이지당 대표 제휴 1곳 |
| D4 | 기존 글 155개 전면 교체. 대응 글이 있으면 301, 없으면 410 | 무관 페이지 301은 soft 404 |
| D5 | `/saju-travel`, 사주 글 전부 제거 | 정체성 불일치(사장님 동의) |
| D6 | 애드센스 제거 | 수익 사실상 0, 속도·광고 인상 비용 |
| D7 | 캐릭터 가이드 1차 보류 | "구조화된 플랫폼" 인상 우선, 추후 추가 쉬움 |
| D8 | Neon DB·관리자 제거, git의 MDX가 유일한 원본 | 승인 발행이면 커밋이 곧 검토 기록 |
| D9 | 제작은 Claude Code 세션 + 사장님 승인 발행 | 품질 관문을 사람이 통과 |
| D10 | 글쓰기 = Anthropic(Claude Code 세션), 이미지 생성 = OpenAI API(gpt-image-2), Higgsfield GPT Image 예비 | 사장님 결정 |
| D11 | 실제 장소 사진은 한국관광공사 포토코리아(공공누리 1유형) 우선, 위키미디어 차선. 다른 사이트 이미지를 입력으로 넣는 재생성 금지 | 저작권(의거성+실질적 유사성), 명소 AI 이미지의 부정확성 |
| D12 | 대표 호스트 non-www, 끝 슬래시 없음 | 현재 canonical·robots가 non-www, 트레일링 슬래시는 이미 308 정리 중 |
| D13 | 쿠키 없는 분석(Vercel Web Analytics) + 제휴 링크 출처 태그 | 현재 분석 도구 없음(GA4 미설치 확인), 전환 측정 필요 |
| D14 | Google Indexing API 사용 중단, 사이트맵 lastmod + IndexNow(Bing) | Indexing API는 JobPosting·BroadcastEvent 전용 |
| D15 | 첫 공개 = 허브 5개 + 글 12개, 나머지는 공개 후 주 2~3편 → 2026-09-14부터 하루 1편(사장님 결정) | 승인은 주 1회 묶음, 공개는 발행일별 자동 |

---

## 3. 정보 구조와 URL

### URL 규칙
- 최대 3단계. 카테고리는 URL 대신 breadcrumb와 데이터로 표현해 재분류 시 URL이 바뀌지 않게 한다.
- 소문자·하이픈, 끝 슬래시 없음, non-www.

```
/                              홈
/korea                         국가 허브
/korea/{category}              국가 카테고리: planning, transportation, itineraries, experiences
/korea/{slug}                  국가 단위 글
/korea/{city}                  도시 허브: seoul, busan, jeju, gyeongju (incheon은 하위 글이 생기면)
/korea/{city}/{category}       things-to-do, where-to-stay, day-trips, food, transportation,
                               itineraries, tours, attractions
/korea/{city}/{slug}           도시 단위 글
```

- 동네 층(2026-09-14 추가): 도시 글은 frontmatter `area`로 동네를 표시하고 URL은 바뀌지 않는다.
  `/korea/{city}/{area}`는 `_areas/{area}.mdx` 소개 + 태그된 글 1편 이상일 때만 생성. 도시 허브는 카테고리당
  최신 4편 + 카테고리 페이지 링크만, 카테고리 페이지는 동네별로 묶는다. 글이 쌓여도 허브·카테고리가 목록 벽이
  되지 않게 하려는 것.
- `{city}`, `{category}`, `{area}`는 예약어다. 글 slug와 겹치면 빌드 실패(`links:check`).
- 향후 `/japan/...`도 같은 틀.

### 여행 단계(journeyStage)
`discovery | planning | comparison | booking | on-trip`. 글마다 하나를 지정하고, 글 끝 "Next step"
모듈이 다음 단계 글을 우선 추천한다(예: planning → booking).

### 내부 링크 규칙
- 모든 글: 자기 허브(도시 또는 국가)로 1, 같은 클러스터 형제 글 2~3, 핵심 실용 글(결제·교통카드 중 1)로 1,
  관련 숙소 글로 1.
- 본문 링크는 세션에서 문맥에 맞게 넣는다. 스크립트는 후보만 제안하고 자동 삽입하지 않는다.
- 앵커는 설명형("where to stay in Seoul for first-timers"), "click here/read more" 금지.
- 빌드 검사: 고아 글(유입 링크 0), 허브 링크 누락, 깨진 내부 링크, 예약어 충돌 시 실패.

---

## 4. 페이지 템플릿

### 홈
정체성 한 줄 H1 → 도시 허브 카드 → "Before you go" 핵심 실용 글 5개 → 최근 업데이트 가이드.
슬라이더 없음(클라이언트 JS·LCP 부담 제거).

### 국가 허브 `/korea`
핵심 정보 표(입국·통화·통신·전압·시차, 행마다 출처+확인일) → 언제 → 며칠 → 도시 비교 →
국내 이동 → 결제 → 출발 전 예약 체크리스트 → 일정 → FAQ.

### 도시 허브 `/korea/{city}`
목록이 아닌 가이드. 개요 → 왜 가나 → 시기 → 체류 기간 → 동네 → 명소 → 교통 기초 → 대표 체험 →
일정 → 근교 → 팁 → FAQ. 각 섹션이 하위 글로 연결된다. 카테고리 칩 내비게이션.

### 카테고리 `/korea/{city}/{category}`
고유 소개 문단 + 핵심 즉답 + 글 목록. 목록만 있는 빈 페이지 금지(하위 글 0개면 페이지 미생성).

### 글 템플릿 (frontmatter `template`)
| template | 구성 |
|---|---|
| `guide` | 즉답 → 핵심 정보 → 단계/본문 → 비용 표 → 팁 → (예약) → FAQ → 출처 |
| `comparison` | 결론 박스(누가 무엇을) → 비교표 → 기준별 → 여행자 유형별 추천 → FAQ |
| `best-of` | 선정 기준 → 항목별(무엇·왜·소요·비용·예약) → 비교표 → FAQ |
| `itinerary` | 일자별 요약표 → 일별 상세 → 숙소 → 교통 → 예산 → 예약 체크리스트 |
| `where-to-stay` | 지역 비교표 → 지역별 장단점·추천 대상 → 숙소 추천 → FAQ |

모든 템플릿을 억지로 채우지 않는다. 섹션은 검색 의도에 맞는 것만.

### 공통 부품
AnswerBox(2~4문장, 첫 문단 단독 이해 가능), QuickFacts, UpdatedBadge("Updated Sep 2026 · Fact-checked"),
Byline(편집자 → ProfilePage), SourceList(확인일), Breadcrumbs, FAQ(보이는 섹션), NextStep, RelatedGuides,
Callout(라벨: Tip / Our pick / Affiliate).

### 글쓰기 규칙 (CLAUDE.md·write-guide 스킬에 박는다)
- 질문형 H2 아래 첫 1~3문장이 바로 답한다. 자기완결 문장, 대명사 대신 구체 명사.
- 사실 / 추천(Our pick) / 편집 판단 / 제휴 추천을 구분해 표기.
- 가격·규정·시간은 출처 링크 + 확인일. 확인 못 한 사실은 쓰지 않는다.
- 방문 경험 주장 금지. 필러 문장 금지("There are several ways…").
- 단어 수 목표 없음(구글 공식 입장). 기존 2,000~4,000단어 규칙 폐기.

---

## 5. 콘텐츠 모델

### 파일 배치
```
src/content/korea/_hub.mdx                 국가 허브
src/content/korea/{slug}.mdx               국가 단위 글
src/content/korea/{city}/_hub.mdx          도시 허브
src/content/korea/{city}/{slug}.mdx        도시 단위 글
src/content/categories.yaml                카테고리 소개 문단·즉답
src/data/taxonomy.ts                       국가·도시·카테고리(예약어)
src/data/offers/*.json                     제휴 상품 (제휴 ID는 env)
src/data/images/*.json + public/images/    이미지 자산
src/data/legacy-urls.json                  301/410 지도
content/briefs/{slug}.md                   키워드 브리프(비공개, 빌드 제외)
```

### frontmatter 스키마 (zod로 빌드 시 검증)
```
title, seoTitle?, description, slug, country, city?, category, template,
journeyStage, searchIntent (informational|commercial|transactional),
primaryKeyword, secondaryKeywords[],
summary                  # AnswerBox 문장
faqs[{q, a}]
relatedArticles[]?       # 수동 지정 시 우선
attractions[]?           # TouristAttraction 엔티티 참조
offers[]?                # offer id
featuredImage, gallery[]?  # image id
sources[{title, url, publisher, checkedAt}]
publishedAt, updatedAt, factCheckedAt
status (draft|review|published)
author                   # editor id
canonical?, noindex?
```
구조화 데이터는 이 필드에서 계산해 만든다. 손으로 쓴 JSON-LD는 두지 않는다.
`status: published`만 빌드에 포함된다.

---

## 6. 제휴

### 역할 분리 (페이지 목적 → 대표 제휴 1곳)
| 페이지 목적 | 제휴 |
|---|---|
| 숙소 지역·숙소 추천, KTX | Trip.com (숙소 5~7%, 기차 2%, 쿠키 30일) |
| 가이드 투어·당일치기 | Viator (8%, 쿠키 30일, last click) |
| 한복·미용실·뷰티·K-pop 티켓·입장권·패스 | Creatrip (8% 또는 예약금 40%, 쿠키 30일 동일 기기) |
| 항공 | 없음 (0.5~0.8%) |

### 데이터 구조
- `data/offers/{id}.json`: `id, provider (viator|creatrip|tripcom), kind (tour|experience|hotel|ticket|transfer|rail),
  title, summary (우리 문장), priceText ("typically $45–80"), priceCheckedAt, image (우리 자산 id), targetUrl,
  destination, tags`.
- 제휴 ID는 env에서 빌드 시 읽는다(이름은 `.env.example`): `VIATOR_PID`, `VIATOR_MCID`, `CREATRIP_AFF_CODE`,
  `TRIPCOM_ALLIANCE_ID`, `TRIPCOM_SID`. 공개 추적 ID라 비밀은 아니지만 저장소에 박지 않고 환경별로 바꿀 수 있게 한다.
  `src/lib/affiliates/providers.ts`가 env를 읽어 제휴사 설정을 만든다.
- 링크 빌더가 추적 파라미터 + 출처 태그(글 slug)를 붙인다. 형식은 사장님 계정에서 실제로 발급된 링크 기준(2026-09-11):
  - Creatrip: `?utm_source=AFF-{code}&aff_id=AFF-{code}` (두 파라미터 모두 유지). 출처 태그는 별도 `utm_campaign={slug}`.
    Creatrip이 utm_campaign을 추적에 쓰는지는 미확인. 쓰지 않아도 기본 추적(utm_source/aff_id)에는 영향 없음.
  - Trip.com: `?Allianceid={id}&SID={sid}&trip_sub1={slug}`. 발급 링크의 `trip_sub3=D19780287`은 링크 생성 도구가 붙인
    값으로 의미 미확인. 귀속 키는 Allianceid+SID이므로 필수로 두지 않는다.
  - Viator: `?pid={pid}&mcid={mcid}&medium=link&campaign={slug}`. 값은 viator.com에 파트너로 로그인한 상태에서
    상단 바의 "Get Affiliate Link" 버튼으로 받은 링크에서 추출(발급 링크는 `medium_version=selector`도 붙음).
    파트너 숍 링크(`/partner-shop/asiapicks/`)는 pid·mcid가 없어 사이트에서 쓰지 않는다.
  **ID가 비어 있으면 일반 링크**를 낸다(승인 전에도 사이트 정상).
- Vercel Production에만 ID를 넣고 Preview에는 넣지 않는다. 사장님이 미리보기에서 누르는 클릭이 제휴 통계를 오염시키지 않는다.
- `npm run check`는 Production 빌드에서 ID가 빈 제휴사를 경고로 출력한다(실패 아님). 승인 전 공개를 막지 않되,
  입력을 잊어 수수료를 조용히 잃는 일을 막는다.
- 본문은 `<Offer id="..." />`, `<OfferList ids=[...] />`로만 참조. 제휴사 이름·URL을 본문에 하드코딩하지 않는다.

### 컴포넌트
`OfferCard`(kind별 변형: tour/experience/hotel/ticket/transfer/rail), `ComparisonTable`, `BookingCTA`.

### 배치·표기 규칙
- 예약 영역은 정보 섹션 뒤. 글당 BookingCTA 박스 1개.
- 스티키 바·팝업·외부 위젯 스크립트 없음(정적 HTML 링크만).
- offers가 있는 글은 상단에 고지 1줄 자동: "We may earn a commission if you book through links on this page." + 정책 링크.
- `rel="sponsored nofollow noopener"`, `target="_blank"`.
- 평점·제휴사 상품 설명·제휴사 사진 사용 금지(Viator 약관 §3.2 비색인 의무, Creatrip 사진 복제 금지,
  구글 리뷰 스니펫 규정). Product/Offer/AggregateRating 스키마 사용 안 함.

---

## 7. 이미지

### 출처 정책
| 용도 | 출처 |
|---|---|
| 명소·음식·거리·도시 풍경 | 1) 한국관광공사 포토코리아(공공누리 1유형, 관광사진 API) 2) 위키미디어 커먼즈(CC BY/BY-SA) 3) TourAPI 이미지(1유형 또는 3유형, 3유형은 무변경) |
| 지역 비교 지도, 인포그래픽 일러스트, 허브·카테고리 헤더 아트 | OpenAI API gpt-image-2 (텍스트 프롬프트만) |
| OG 공유 카드 | `/api/og` 동적 생성 |

- AI 이미지는 캡션에 "Illustration (AI-generated)" 표기 + IPTC `DigitalSourceType=trainedAlgorithmicMedia` 메타데이터 삽입.
  실제 장소를 사진처럼 보이게 만들지 않는다(일러스트 스타일).
- 다른 사이트 이미지를 참조 입력으로 넣는 image-to-image 생성 금지. 특정 사진작가·특정 사진 스타일 지명 금지.
- 비용 참고: gpt-image-2 약 $0.005~0.21/장. 글당 2~3장이면 첫 공개분 $15 미만.

### 자산 모델
`data/images/{id}.json`: `src, width, height, alt, caption?, credit, license, sourceUrl, aiGenerated`.
본문은 `<Figure id="..." />`. `next/image`, `sizes` 명시, AVIF/WebP, 히어로만 priority, 나머지 lazy.
빌드 검사: alt·license·credit 누락 시 실패. 장식 이미지는 `alt=""`.
Unsplash 연동 제거.

---

## 8. 제작 파이프라인

### 흐름 (한 편 단위)
```
keyword-brief → write-guide → fact-checker(에이전트) → images → seo-geo-auditor(에이전트)
→ content-critic(에이전트) → npm run check → 사장님 확인 → status: published 커밋
```

### CLAUDE.md (전면 재작성)
정체성·엔티티 문구, URL 규칙, 콘텐츠 스키마, 글쓰기 규칙(4장), 제휴 규칙(6장), 이미지 규칙(7장),
SEO/GEO 체크리스트, 명령어, 검증 절차. 기존 4트랙 전략·사주·Agoda·Klook·자동 포스팅 내용 삭제.

### 스킬 `.claude/skills/`
| 스킬 | 입력 → 출력 |
|---|---|
| `keyword-brief` | 키워드 → `content/briefs/{slug}.md`: 의도, journeyStage, template, 실제 질문(자동완성·PAA), 상위 경쟁 페이지와 빈틈, 대상 URL, 내부 링크 대상, 맞는 offer |
| `write-guide` | 브리프 + 공식 출처 → MDX 초안(status: review), sources·checkedAt 기록 |
| `images` | 글 → 포토코리아/위키미디어 검색·등록 또는 gpt-image-2 일러스트 생성·표기 |
| `publish` | 발행 관문 실행, 허브·카테고리 갱신, updatedAt 반영, IndexNow 알림 목록 |
| `refresh` | `facts:stale` 목록(확인일 90일 경과) → 재확인·수정 |

### 에이전트 `.claude/agents/` (작성자와 채점자 분리)
| 에이전트 | 역할 |
|---|---|
| `fact-checker` | 모든 가격·규정·운영시간·주소를 공식 출처로 독립 검증, 불일치 인용+수정안 |
| `seo-geo-auditor` | 제목·메타·H1·계층·canonical·구조화 데이터·즉답·자기완결 문장·내부 링크 점검 (sajumuse seo-specialist 형식) |
| `content-critic` | AI 상투어·필러·모호한 대명사·방문 경험 주장·제휴 과다 탐지 |

### 자동 검사 `npm run check` (prebuild에 연결, 실패 시 Vercel 배포 중단)
`content:validate`(스키마), `links:check`(고아·허브 누락·깨진 링크·예약어 충돌), `images:check`,
`seo:check`(title 50~60자·description 150~160자 권장 경고, H1 1개), `redirects:check`(legacy-urls 전부 301/410),
`facts:stale`(경고만).

---

## 9. 기술 SEO

- 렌더링: 전 페이지 SSG(`generateStaticParams`). 클라이언트 컴포넌트는 모바일 메뉴 수준만.
- 메타: 페이지별 title·description·canonical·OG·Twitter, `<html lang="en">`, 파비콘, site name.
- 구조화 데이터: WebSite, Organization(엔티티 문구 통일), BreadcrumbList, Article/BlogPosting
  (author Person+URL, datePublished, dateModified), ProfilePage(편집자). TouristDestination·TouristAttraction은
  `about`/`mentions`로만. FAQ는 보이는 섹션 유지, FAQPage 마크업은 선택(구글 리치 결과 2026-05 종료, 무해).
  ItemList는 best-of에 선택.
- 사이트맵: `lastModified` = frontmatter `updatedAt`(빌드 시각 금지). 이미지 사이트맵은 선택.
- robots.txt: Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Claude-User 허용.
  학습용(GPTBot, ClaudeBot, Google-Extended, Applebot-Extended)도 기본 허용.
- IndexNow 키 파일 + 배포 후 변경 URL 알림. Google Indexing API 스크립트·워크플로 삭제.
- 404 페이지, 410 페이지(한국 허브 링크 포함).
- Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. 폰트 `next/font`, 외부 스크립트 0개(분석 제외).
- 신뢰 페이지: About, Contact, Editorial Policy, How We Choose Recommendations, Affiliate Disclosure,
  Privacy, Terms. Editorial Policy에 "공식 출처 조사 + AI 보조 작성 + 사람 검토, 방문 경험 주장 없음" 명시.
- 분석: Vercel Web Analytics(쿠키 없음) + 제휴 아웃바운드 클릭 이벤트.

---

## 10. 옛 URL 처리

### 원칙
같은 의도에 답하는 새 페이지가 있으면 301, 부모 허브가 그 주제 섹션을 실제로 다루면 허브로 301,
그 외는 410. 홈 일괄 301 금지.

### 확정 매핑 (한국 글·경로)
| 옛 URL | 처리 |
|---|---|
| `/blog/best-hotels-seoul-by-area` | 301 → `/korea/seoul/where-to-stay-in-seoul` |
| `/blog/where-to-stay-busan` | 301 → `/korea/busan/where-to-stay-in-busan` |
| `/blog/seoul-dmz-tour-guide` | 301 → `/korea/seoul/dmz-tours` |
| `/blog/jeju-itinerary-3-days` | 301 → `/korea/jeju/jeju-without-a-car` |
| `/blog/3-days-in-seoul`, `/blog/seoul-on-a-budget`, `/blog/seoul-palace-tour` | 301 → `/korea/seoul` (전용 글 발행 시 직접 대상으로 갱신, 체인 금지) |
| `/blog/seoul-subway-guide` | 301 → `/korea/seoul/transportation` |
| `/blog/busan-weekend-trip`, `/blog/busan-day-trip-from-seoul` | 301 → `/korea/busan` |
| `/blog/best-hotels-jeju-island-by-area` | 301 → `/korea/jeju` |
| `/blog/seoul-cafe-hopping-guide` | 410 |
| `/blog/birth-element-korea-travel-guide`, `/blog/five-elements-korea-travel-destinations` | 410 |
| `/destinations/korea` | 301 → `/korea` |
| `/destinations/korea/{seoul,busan,jeju}` | 301 → `/korea/{city}` |
| `/destinations` | 301 → `/` |
| `/blog` | 301 → `/korea` |

### 일괄 410
한국 외 글 전부(`/blog/*` 약 140개), 한국 외 `/destinations/*`, `/blog/category/*`, `/saju-travel`, `/deals`,
`/search`. `/admin`, `/api/admin/*`은 제거(404).
정확한 목록은 전환 커밋 직전 git의 `src/content/blog` 목록 + 라우트에서 생성해 `legacy-urls.json`에 고정하고,
`redirects:check`가 전부 처리되는지 검증한다. 전환 전 전체 목록을 사장님께 보여주고 확인받는다.

### 호스트
Vercel에서 www → non-www 308. Search Console의 www 사이트맵 2개 삭제, non-www 사이트맵 재제출.

---

## 11. 첫 공개 콘텐츠 (허브 5 + 글 12)

허브: `/korea`, `/korea/seoul`, `/korea/busan`, `/korea/jeju`, `/korea/gyeongju`.
(Incheon 허브는 하위 글이 생기면 추가. 공항 이동 글은 서울 소속.)

| # | URL | template | 대표 제휴 |
|---|---|---|---|
| 1 | `/korea/wowpass-vs-tmoney-vs-climate-card` | comparison | Creatrip |
| 2 | `/korea/how-to-pay-in-korea` | guide | – |
| 3 | `/korea/k-eta-vs-e-arrival-card` | guide | – |
| 4 | `/korea/korea-esim-with-phone-number` | comparison | Trip.com / Creatrip |
| 5 | `/korea/how-to-book-ktx` | guide | Trip.com |
| 6 | `/korea/korea-7-day-itinerary` | itinerary | Trip.com + Viator |
| 7 | `/korea/seoul/incheon-airport-to-seoul` | comparison | Creatrip / Trip.com |
| 8 | `/korea/seoul/where-to-stay-in-seoul` | where-to-stay | Trip.com |
| 9 | `/korea/seoul/dmz-tours` | best-of | Viator |
| 10 | `/korea/seoul/hanbok-rental-near-gyeongbokgung` | guide | Creatrip |
| 11 | `/korea/busan/where-to-stay-in-busan` | where-to-stay | Trip.com |
| 12 | `/korea/jeju/jeju-without-a-car` | itinerary | Trip.com + Viator |

공개 후 백로그(우선순위 순): Nami Island from Seoul, head spa Seoul, K-pop music show tickets,
personal color analysis Seoul, Olive Young for tourists, what to order at Korean BBQ, Naver Map/Kakao T setup,
Hongdae vs Myeongdong, Seoul 3-day itinerary, Gyeongju day trip from Busan, best day trips from Seoul,
Seoul vs Busan, autumn foliage(계절), things to do in Seoul(허브 보강형 필러).

피하는 키워드: things to do in Seoul·best time to visit Korea(대형 매체 독점, 허브가 담당),
best Korean BBQ in Seoul(직접 경험 필요), 피부과·시술(의료 위험), K-ETA 신청(공식·사칭 사이트).
검색량은 자동완성·SERP 기반 추정이다. Bing Webmaster 키워드 조사로 확인하는 단계를 `keyword-brief`에 넣는다.

---

## 12. 전환 계획

1. `korea-rebuild` 브랜치에서 구현. 현재 사이트는 main에서 계속 서비스.
2. 구현 순서(요청 문서의 13단계): 전역 레이아웃·내비 → 국가·도시 허브 → 글 템플릿 → 제휴 컴포넌트 →
   메타·스키마 → 사이트맵·robots·내부 링크·검사 스크립트 → 성능·접근성·SEO 점검 → 콘텐츠 제작.
3. 허브 5 + 글 12 제작(세션 + 승인).
4. Vercel 미리보기 배포에서 사장님 확인.
5. 전환: 삭제·교체 목록 확인 → main 머지 → 301/410 적용 → www 리다이렉트 → 사이트맵 재제출 →
   Bing Webmaster·IndexNow → 제휴 3곳 신청 → ID 입력.
6. 옛 기록은 git에 남는다(되돌리기 가능).

### 제거 목록
AdSense(`AdScript`, `AdUnit`, `InArticleAd`, `/ads.txt`), Klook 위젯·배너, Agoda 링크, sajumuse 링크,
`/saju-travel`, `/deals`, `/search`, `/admin`, `/api/admin`, Neon DB 블로그 경로(`lib/db.ts`, `init-db.ts`),
Unsplash 연동, `auto-blog.yml`, `index-all.yml`, `generate-post.ts`, `content-queue.json`,
`index-new-post.ts`, `index-all-posts.ts`, `lib/google-indexing.ts`, `fix-post-images.ts`, `check-frontmatter.ts`,
로컬 미커밋 수정 4건.

---

## 13. 성공 판단 시점

- 공개 +3개월: 공개 글 색인률, 노출 추이, 1페이지 진입 글 수.
- 공개 +6개월: 클릭, 첫 제휴 수수료, Bing AI Performance 인용 수 → 계속 여부 판단.
- 구체 기준 숫자는 공개 시점에 정한다.

---

## 14. 위험과 미확인

- AI 검색은 외부 사이트 언급(earned mention)을 강하게 선호한다. 사이트 내 최적화만으로는 천장이 있다.
- Creatrip: 2026-09-11 마이리얼트립 인수 발표, 조건 변경 가능. 현재 기본 수수료 8%(가이드) vs 6%(2025 공지) 불일치, 가입 시 확인.
  수수료는 이용일 확정·동일 기기 쿠키라 누수가 크다.
- Viator: 상품 정보 비색인 의무 → API 상품 페이지 자동 생성 불가(본문 딥링크만).
- Trip.com: 최소 정산 $200, 40~60영업일. 사업자등록 요구 여부 미확인. 소도시 숙소 커버리지 미검증.
- 지방 소도시(안동·여수·통영 등)는 세 제휴사 모두 상품이 얇다. 해당 글은 당일치기·교통 중심.
- 사실 신선도 유지 부담: `refresh` 월 1회.

---

## 15. 사장님 조치가 필요한 항목

| 항목 | 시점 |
|---|---|
| OpenAI API 키를 `.env.local`에 `OPENAI_API_KEY`로 추가 | 이미지 작업 전 |
| 공공데이터포털 서비스키(관광사진 API) 발급 → `KTO_PHOTO_API_KEY` | 이미지 작업 전 |
| 편집자 필명, Contact 이메일 결정 | 신뢰 페이지 작성 전 |
| Vercel: www → non-www 리다이렉트, Web Analytics 켜기 | 전환 시 |
| Bing Webmaster Tools 등록(GSC 가져오기) | 전환 시 |
| Search Console www 사이트맵 삭제·재제출 | 전환 시 |
| Viator·Creatrip·Trip.com 가입(이미 계정이 있으면 지금) → `.env.local`과 Vercel Production env에 ID 입력 | 전환 직후 |
