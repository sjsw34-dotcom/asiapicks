# CLAUDE.md — Asia Travel Affiliate Site

## Project Overview

영어권 사용자를 대상으로 동남아·동아시아 여행 가이드를 제공하는 어필리에이트 웹사이트.
아고다(숙소) + 클룩(액티비티) 제휴 링크를 통한 수익화 + sajumuse.com(사주 리딩) 트래픽 퍼널 역할.

- **Site Name**: Asiapicks
- **Language**: English (메인)
- **Target**: 영어권 사용자 (미국, 유럽, 호주 등) 중 아시아 여행 계획자
- **Revenue**: ① Agoda 숙소 수수료 4~5% ② Klook 액티비티 수수료 2~5% ③ sajumuse.com 사주 리딩 연계

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Blog**: MDX (next-mdx-remote 또는 contentlayer)
- **Deploy**: Vercel
- **Automation**: GitHub Actions + Claude API (자동 포스팅)
- **Analytics**: GA4 + Google Search Console
- **Images**: next/image + WebP 최적화
- **Font**: Inter (body) + Plus Jakarta Sans (heading)

---

## Design System

### Color Palette

```
Primary (Teal):     #0D9488  — 메인 CTA, 아고다 관련
Secondary (Coral):  #F97316  — 포인트, 클룩 관련
Accent (Purple):    #8B5CF6  — 사주/sajumuse.com 관련
Background:         #FFFFFF
Surface:            #F8FAFC
Text Primary:       #1E293B
Text Secondary:     #64748B
```

### Design Principles

1. Photo-first: 고품질 아시아 여행 사진이 주인공
2. Card-based UI: 숙소·액티비티·블로그 모두 일관된 카드 컴포넌트
3. Subtle CTAs: 광고 느낌 없이 콘텐츠 흐름에 녹아드는 제휴 링크
4. Mobile-first: 여행 중 모바일 검색 비율 70%+ 고려
5. East-meets-West: 모던 웹 디자인 + 사주 섹션에 동양적 터치

---

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (메타태그, 폰트, 공통 UI)
│   │   ├── page.tsx                      # Homepage
│   │   ├── destinations/
│   │   │   ├── page.tsx                  # 여행지 목록 (필터: 지역, 테마, 예산)
│   │   │   └── [country]/
│   │   │       ├── page.tsx              # 국가별 개요
│   │   │       └── [city]/
│   │   │           └── page.tsx          # ⭐ 도시 상세 (핵심 전환 페이지)
│   │   ├── blog/
│   │   │   ├── page.tsx                  # 블로그 목록
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx             # 개별 블로그 포스트
│   │   │   └── category/
│   │   │       └── [category]/
│   │   │           └── page.tsx         # 카테고리별 목록
│   │   ├── deals/
│   │   │   └── page.tsx                 # 시즌 프로모션/특가
│   │   ├── saju-travel/
│   │   │   └── page.tsx                 # ★ 사주x여행 허브 → sajumuse.com 퍼널
│   │   ├── about/
│   │   │   └── page.tsx                 # 사이트 소개
│   │   ├── search/
│   │   │   └── page.tsx                 # 통합 검색
│   │   └── sitemap.ts                   # 자동 sitemap.xml 생성
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx               # 네비게이션 (Destinations, Blog, Deals, Saju Travel)
│   │   │   ├── Footer.tsx               # 푸터 (링크, Affiliate Disclosure, SNS)
│   │   │   └── MobileNav.tsx            # 모바일 메뉴
│   │   │
│   │   ├── cards/
│   │   │   ├── HotelCard.tsx            # 아고다 숙소 카드
│   │   │   ├── ActivityCard.tsx         # 클룩 액티비티 카드
│   │   │   ├── DestinationCard.tsx      # 여행지 목록 카드
│   │   │   └── BlogPostCard.tsx         # 블로그 포스트 카드
│   │   │
│   │   ├── affiliate/
│   │   │   ├── StickyBookingBar.tsx     # 도시 페이지 상단 고정 (Find Hotels + Book Activities)
│   │   │   ├── AffiliateCTA.tsx         # 블로그 본문 중간 CTA 박스
│   │   │   │                             # variant: "hotel" | "activity" | "saju"
│   │   │   ├── HotelSection.tsx         # 숙소 추천 섹션 (Budget/Mid/Luxury 탭)
│   │   │   └── ActivitySection.tsx      # 액티비티 추천 섹션 (카테고리별)
│   │   │
│   │   ├── saju/
│   │   │   ├── SajuInsightBox.tsx       # 사주 인사이트 박스 (블로그/도시 페이지 삽입)
│   │   │   ├── SajuTravelBanner.tsx     # 홈페이지용 사주 여행 배너
│   │   │   └── ElementDestinations.tsx  # 오행별 추천 여행지 (saju-travel 페이지)
│   │   │
│   │   ├── destination/
│   │   │   ├── CityHero.tsx             # 도시 히어로 섹션
│   │   │   ├── QuickInfo.tsx            # 빠른 정보 뱃지 (시즌, 예산, 시차 등)
│   │   │   ├── ItineraryTimeline.tsx    # Day-by-Day 추천 일정
│   │   │   └── PracticalInfo.tsx        # 실용 정보 (교통, 날씨, 환율 등)
│   │   │
│   │   ├── blog/
│   │   │   ├── TableOfContents.tsx      # 자동 TOC 생성
│   │   │   ├── MDXComponents.tsx        # MDX 커스텀 컴포넌트 매핑
│   │   │   └── RelatedPosts.tsx         # 관련 포스트 추천
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSlider.tsx           # 홈 히어로 슬라이더
│   │   │   ├── PopularDestinations.tsx  # 인기 여행지 그리드
│   │   │   ├── ThemeCarousel.tsx        # 테마별 여행 캐러셀
│   │   │   └── LatestPosts.tsx          # 최신 블로그 포스트
│   │   │
│   │   └── ui/
│   │       ├── SearchBar.tsx            # 검색바 (자동완성)
│   │       ├── FilterBar.tsx            # 필터 (지역, 테마, 예산)
│   │       ├── StarRating.tsx           # 별점 표시
│   │       ├── Badge.tsx                # 뱃지 (Budget, Luxury 등)
│   │       └── ShareButtons.tsx         # SNS 공유 버튼
│   │
│   ├── data/
│   │   ├── destinations/
│   │   │   ├── japan/
│   │   │   │   ├── tokyo.json           # 도시별 데이터
│   │   │   │   ├── osaka.json
│   │   │   │   └── kyoto.json
│   │   │   ├── thailand/
│   │   │   │   ├── bangkok.json
│   │   │   │   └── chiang-mai.json
│   │   │   ├── korea/
│   │   │   │   ├── seoul.json
│   │   │   │   └── busan.json
│   │   │   └── vietnam/
│   │   │       ├── ho-chi-minh.json
│   │   │       └── hanoi.json
│   │   │
│   │   ├── affiliates.json              # 아고다 CID, 클룩 AID, 도시별 ID 매핑
│   │   ├── countries.json               # 국가 목록 + 메타 정보
│   │   └── themes.json                  # 테마 목록 (Beach, Culture, Food 등)
│   │
│   ├── content/
│   │   └── blog/                        # MDX 블로그 포스트
│   │       ├── 3-days-in-osaka.mdx
│   │       ├── best-budget-hotels-bangkok.mdx
│   │       ├── saju-travel-guide-element.mdx    # ★ 사주x여행
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── mdx.ts                       # MDX 처리 유틸
│   │   ├── destinations.ts              # 도시 데이터 로드/필터 함수
│   │   ├── affiliates.ts               # 제휴 링크 생성 유틸
│   │   │   - getAgodaLink(cityId)       # 아고다 URL 생성
│   │   │   - getKlookLink(activityId)   # 클룩 URL 생성
│   │   │   - getSajumuseLink(ref)       # sajumuse.com URL 생성
│   │   ├── seo.ts                       # 메타태그/OG태그/Schema.org 생성
│   │   └── blog.ts                      # 블로그 포스트 목록/필터/관련글
│   │
│   └── styles/
│       └── globals.css                  # Tailwind + 글로벌 스타일
│
├── public/
│   ├── images/
│   │   ├── destinations/                # 도시별 대표 이미지
│   │   ├── hotels/                      # 숙소 이미지 (선택)
│   │   └── og/                          # OG 이미지
│   ├── robots.txt
│   └── favicon.ico
│
├── scripts/
│   ├── generate-post.ts                 # Claude API 블로그 자동 생성 스크립트
│   ├── generate-destination.ts          # 도시 데이터 자동 생성 스크립트
│   └── submit-sitemap.ts               # Google Search Console 인덱싱 요청
│
├── .github/
│   └── workflows/
│       ├── auto-blog.yml                # 자동 블로그 포스팅 워크플로우
│       └── auto-destination.yml         # 도시 페이지 자동 생성 워크플로우
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                            # ← 이 파일
```

---

## Data Schema

### City Data (예: /data/destinations/japan/osaka.json)

```json
{
  "id": "osaka",
  "name": "Osaka",
  "country": "Japan",
  "countryCode": "JP",
  "flag": "🇯🇵",
  "description": "Japan's kitchen and entertainment capital...",
  "heroImage": "/images/destinations/osaka-hero.jpg",
  "quickInfo": {
    "bestSeason": "March-May, Sep-Nov",
    "avgBudget": "$80-150/day",
    "timezone": "UTC+9",
    "language": "Japanese",
    "currency": "JPY",
    "visa": "Visa-free for most Western countries (90 days)"
  },
  "agodaCityId": "17067",
  "klookDestinationId": "osaka",
  "hotels": [
    {
      "name": "Cross Hotel Osaka",
      "area": "Shinsaibashi",
      "priceRange": "$89-120",
      "rating": 4.5,
      "tier": "mid-range",
      "agodaHotelId": "236154",
      "description": "Stylish hotel in the heart of shopping district",
      "image": "/images/hotels/cross-hotel-osaka.jpg"
    }
  ],
  "activities": [
    {
      "name": "Osaka Amazing Pass (1-Day)",
      "duration": "Full Day",
      "price": "$25",
      "category": "transport-pass",
      "klookActivityId": "1234",
      "description": "Unlimited subway rides + free entry to 40+ attractions",
      "image": "/images/activities/osaka-amazing-pass.jpg"
    }
  ],
  "itinerary": {
    "3days": [
      {
        "day": 1,
        "title": "Osaka Castle & Dotonbori",
        "items": [
          { "time": "09:00", "activity": "Osaka Castle", "type": "attraction", "klookId": "5678" },
          { "time": "12:00", "activity": "Kuromon Market lunch", "type": "food" },
          { "time": "18:00", "activity": "Dotonbori night walk", "type": "attraction" }
        ]
      }
    ]
  },
  "practicalInfo": {
    "gettingThere": "Kansai International Airport (KIX), 50min by train to city center",
    "localTransport": "Osaka Metro + JR lines. Get Osaka Amazing Pass for unlimited rides.",
    "weather": [
      { "month": "Jan", "high": 9, "low": 3, "rain": 45 },
      { "month": "Feb", "high": 10, "low": 3, "rain": 60 }
    ]
  },
  "themes": ["food", "culture", "nightlife", "family"],
  "relatedCities": ["kyoto", "tokyo", "nara"]
}
```

### Affiliates Config (/data/affiliates.json)

```json
{
  "agoda": {
    "cid": "YOUR_AGODA_CID",
    "baseUrl": "https://www.agoda.com/partners/partnersearch.aspx",
    "params": "pcs=1&cid={cid}&city={cityId}"
  },
  "klook": {
    "aid": "YOUR_KLOOK_AID",
    "baseUrl": "https://www.klook.com/activity/",
    "params": "{activityId}?aid={aid}"
  },
  "sajumuse": {
    "baseUrl": "https://sajumuse.com",
    "ref": "tripmuse-asia"
  }
}
```

---

## Blog MDX Frontmatter Schema

```yaml
---
title: "3 Days in Osaka: The Perfect Itinerary for First-Timers"
slug: "3-days-in-osaka"
description: "Discover the best things to do in Osaka in 3 days..."
date: "2026-03-15"
updated: "2026-03-15"
category: "travel-guides"          # travel-guides | hotels-stays | activities-tours | travel-tips | saju-travel
city: "osaka"                      # ← 이 값으로 도시 데이터 자동 매핑
country: "japan"
tags: ["osaka", "japan", "itinerary", "food"]
image: "/images/blog/osaka-3days.jpg"
readTime: 8
showHotels: true                   # true면 해당 도시 숙소 카드 자동 삽입
showActivities: true               # true면 해당 도시 액티비티 카드 자동 삽입
showSajuInsight: false             # true면 사주 인사이트 박스 삽입
sajuInsightText: ""                # 커스텀 사주 메시지 (선택)
---
```

블로그 본문에서 `showHotels: true`이면 해당 city의 hotels 데이터가
`<HotelSection />` 컴포넌트로 자동 렌더링됨. 마찬가지로 Activities도 동일.

---

## Blog Content Strategy — 4-Track Keyword System

핵심 전략: "saju travel"은 단독으로 검색량이 없다. 대신 "astrology travel" / "zodiac travel" 시장이 폭발적 성장 중이다(Skyscanner 보고서: 18-34세 40%+ 관심). 이 거대한 검색 풀에 "Korean Saju = Eastern alternative to Western zodiac"로 진입한 뒤, Saju 앵글로 차별화한다.

### Track A: Astrology × Travel (최우선 — 성장 시장 진입 + Saju 전환)
"astrology travel", "zodiac travel" 등 고볼륨 키워드로 진입하되, 글 안에서 "But Korea has its own ancient system called Saju..."로 자연스럽게 전환. 경쟁사들은 모두 Western zodiac만 다룸 → Saju 앵글이 차별화.

타겟 키워드 예시:
- best travel destination by zodiac sign 2026
- astrology travel guide / astrology based travel
- where to travel based on birthday
- astrocartography Asia destinations
- zodiac travel 2026 / zodiac sign travel destinations
- travel horoscope 2026 / best travel month astrology
- zodiac compatibility travel / best couple trip by zodiac
- astrology travel quiz
- birth chart travel destinations
- spiritual travel destinations Asia

포스트 구조 (Track A 전용):
- 도입부: 서양 zodiac 기반 여행 트렌드 언급 (검색 의도 충족)
- 중반: "But there's an older, more precise system from Korea..." → Saju/Five Elements 소개
- 본문: 5원소별 또는 zodiac별 아시아 도시 매칭 (구체적 추천)
- 하단 CTA: "Discover your birth element → sajumuse.com Free Reading" + 도시별 Agoda/Klook 링크

Track A 필수 포스트 (우선 발행):
1. "Best Travel Destination by Zodiac Sign — Plus a Korean Secret Most Travelers Miss"
2. "Astrocartography Asia: Which City Matches Your Energy?"
3. "Where to Travel Based on Your Birthday: Western Zodiac vs Korean Saju"
4. "Your 2026 Travel Horoscope: The Best Months & Destinations (Zodiac + Saju)"
5. "Astrology Travel Quiz: Which Asian City Is Your Destiny?"
6. "5 Elements Travel Guide: Wood to Kyoto, Fire to Bangkok, Water to Bali"
7. "Zodiac Compatibility Travel: Best Couple Trips for Every Sign"
8. "Spiritual Travel Destinations in Asia: From Temples to Birth Charts"

### Track B: 롱테일 여행 키워드 (트래픽, 낮은 경쟁)
일반 키워드("Tokyo guide") 대신 매우 구체적인 롱테일.
"도시 + 구체적 주제 + 2026" 형태.

타겟 키워드 예시:
- tokyo ramen guide by area / best ramen tokyo 2026
- bangkok night market best / bangkok night market ranking
- seoul cafe guide aesthetic / seoul cafe hopping
- osaka street food dotonbori prices
- kyoto rainy day things to do
- chiang mai digital nomad guide
- hanoi old quarter walking guide
- vietnam coffee guide / egg coffee hanoi
- japan rail pass worth it 2026
- thailand visa 2026 / thailand visa free countries
- seoul subway guide / seoul metro tips
- first time asia travel mistakes
- best sim card asia travel / esim asia 2026
- japan daily budget / how much japan trip cost
- busan day trip from seoul / ktx busan worth it

CTA: Agoda (숙소) + Klook (액티비티/교통)

### Track C: "Best Hotel" 키워드 (Agoda 전환)
"best hotels in [city]" + 니치 조건으로 경쟁 낮춤.

타겟 키워드 예시:
- best hotels near shinjuku station
- best ryokan kyoto under 200
- best hotels chiang mai old city
- best capsule hotels tokyo
- where to stay busan / busan best area
- best hostels bangkok solo travelers
- best hotels hanoi old quarter 2026
- best onsen hotel near tokyo

CTA: 각 호텔 Agoda 직접 링크

### Track D: Saju × Travel 니치 (독점, 크로스 트래픽)
Track A에서 Saju에 관심 갖게 된 사람들이 더 깊이 파고드는 콘텐츠.
sajumuse.com 전환의 핵심 퍼널.

타겟 키워드 예시:
- five elements travel guide / birth element travel
- wood element travel destinations
- fire element travel destinations
- earth element travel destinations
- metal element travel destinations
- water element travel destinations
- korean astrology travel / saju travel guide
- day master vacation style
- saju compatibility travel partner
- best travel year by birth chart

CTA: sajumuse.com Free Reading + 도시별 Agoda/Klook

### 발행 비율
Track A(Astrology Travel) : Track B(롱테일) : Track C(호텔) : Track D(Saju 니치) = 3 : 4 : 1.5 : 1.5

### 발행 우선순위
1순위: Track A "astrology travel" 진입 포스트 5개 (시장 선점)
2순위: Track D 오행 5개 포스트 (Saju 심화)
3순위: Track C 호텔 포스트 3개 (Agoda 수익)
4순위: Track B 롱테일 5개 (트래픽 기반)
이후 위 비율대로 지속

### 포스트 구조
- H1: 타겟 키워드 포함 제목
- 도입부: 여행자 공감 + 트렌드 언급 (2~3문단)
- 본문 H2 섹션 4~8개
- 실제 가격 정보(원/달러) 필수 포함
- 교통 정보 구체적으로
- Track A 포스트: Western zodiac 도입 → Saju 전환 구조
- Track B/C 포스트: 하단에 "Your birth element might explain why you love this city → Find out" 1줄 + sajumuse 링크 (선택)
- Track D 포스트: 사주/오행 앵글 전체에 녹임
- 비용 요약 테이블 포함 (Travel Guide)

### 톤 & 스타일
- 타겟: 영어권 아시아 여행자 (25~40세), 특히 astrology/spirituality에 관심 있는 밀레니얼/Gen Z
- 톤: 실제 가본 사람처럼 구체적이고 솔직, 약간의 mystical 느낌 허용 (Track A/D)
- Track A: "Cosmopolitan meets spiritual travel blog" 느낌
- Track B/C: 실용적 여행 가이드 (현재 busan-weekend-trip 스타일 유지)
- Track D: sajumuse 블로그와 비슷하되 여행 앵글

### CTA 규칙
- Agoda 호텔 링크: 숙소 언급 시 자연스럽게 삽입
- Klook 액티비티 링크: 투어/교통 언급 시 삽입
- sajumuse.com 링크: Track A/D는 적극적, Track B/C는 하단에 가볍게
- affiliate disclosure 포스트 상단에 포함 (현재와 동일)

### SEO 규칙
- Title tag: 50~60자, 타겟 키워드 + 도시명 앞쪽
- Meta description: 150~160자
- URL: /blog/[키워드-slug]
- 콘텐츠 길이: 2,000~4,000 단어
- 내부 링크: 관련 포스트 2~3개 + destination 페이지 + saju-travel 페이지
- 이미지 alt text에 키워드 + 도시명

---

## Affiliate Link Generation

```typescript
// lib/affiliates.ts

import affiliateConfig from '@/data/affiliates.json';

export function getAgodaSearchLink(cityId: string): string {
  const { cid, baseUrl } = affiliateConfig.agoda;
  return `${baseUrl}?pcs=1&cid=${cid}&city=${cityId}`;
}

export function getAgodaHotelLink(hotelId: string): string {
  const { cid } = affiliateConfig.agoda;
  return `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=${cid}&hid=${hotelId}`;
}

export function getKlookActivityLink(activityId: string): string {
  const { aid, baseUrl } = affiliateConfig.klook;
  return `${baseUrl}${activityId}?aid=${aid}`;
}

export function getSajumuseLink(campaign?: string): string {
  const { baseUrl, ref } = affiliateConfig.sajumuse;
  return `${baseUrl}?ref=${ref}${campaign ? `&utm_campaign=${campaign}` : ''}`;
}
```

---

## Auto Blog Pipeline (GitHub Actions)

### Workflow: .github/workflows/auto-blog.yml

```yaml
name: Auto Blog Post
on:
  schedule:
    - cron: '0 2 * * 1,3,5'  # 월/수/금 오전 11시 (KST)
  workflow_dispatch:           # 수동 실행도 가능

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      
      - name: Generate Blog Post
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: npx tsx scripts/generate-post.ts
      
      - name: Commit & Push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add content/blog/ data/destinations/
          git diff --staged --quiet || git commit -m "auto: new blog post $(date +%Y-%m-%d)"
          git push
```

### 스크립트: scripts/generate-post.ts 핵심 로직

```
1. content-queue.json에서 다음 생성할 주제 선택
2. Claude API 호출:
   - System: "You are an Asia travel expert editor..."
   - 도시 데이터 (JSON) 컨텍스트로 전달
   - frontmatter + MDX 본문 생성 요청
3. 생성된 MDX 파일을 content/blog/ 에 저장
4. frontmatter의 city 값으로 도시 데이터 자동 연결 확인
5. Git commit & push → Vercel 자동 빌드
```

---

## SEO Requirements

### 모든 페이지 필수

- `<title>` + `<meta name="description">` (155자 이내)
- Open Graph 태그: og:title, og:description, og:image, og:url
- Twitter Card: twitter:card, twitter:title, twitter:description, twitter:image
- Canonical URL
- Language: `<html lang="en">`

### Schema.org 구조화 데이터

- **Homepage**: WebSite + SearchAction
- **City Page**: TouristDestination + LodgingBusiness (hotels) + TouristAttraction (activities)
- **Blog Post**: Article + BreadcrumbList
- **FAQ sections**: FAQPage

### sitemap.xml

- `src/app/sitemap.ts`에서 자동 생성
- 모든 도시 페이지 + 블로그 포스트 포함
- 빌드 시마다 자동 업데이트

### robots.txt

```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

---

## Key Component Behaviors

### HotelCard
- props: hotel data object (name, area, price, rating, tier, agodaHotelId)
- tier별 뱃지 컬러: Budget(green) / Mid-Range(blue) / Luxury(purple)
- CTA 버튼: "Check Price on Agoda" → getAgodaHotelLink(agodaHotelId)
- 버튼 컬러: Teal gradient (#0D9488 계열)

### ActivityCard
- props: activity data object (name, duration, price, category, klookActivityId)
- category별 아이콘 자동 매핑
- CTA 버튼: "Book on Klook" → getKlookActivityLink(klookActivityId)
- 버튼 컬러: Coral gradient (#F97316 계열)

### StickyBookingBar
- 도시 상세 페이지 전용, 스크롤 시 상단 고정
- 좌: "🏨 Find Hotels" (Teal) → Agoda city search link
- 우: "🎫 Book Activities" (Coral) → Klook destination link
- 스크롤 100px 이상일 때만 표시 (투명→불투명 transition)

### AffiliateCTA
- variant="hotel": Teal 테마, "Find the best hotel deals on Agoda"
- variant="activity": Coral 테마, "Book skip-the-line tickets on Klook"
- variant="saju": Purple 테마, "Discover your travel destiny" → sajumuse.com

### SajuInsightBox
- 블로그/도시 페이지에 간헐적 삽입 (10% 비율)
- Purple gradient 배경
- 텍스트: 도시별 커스텀 가능 (frontmatter sajuInsightText)
- CTA → sajumuse.com with UTM 파라미터

---

## Image Strategy

### 이미지 소스 (우선순위)

1. **Unsplash API** (메인)
   - 도시 히어로 이미지, 블로그 썸네일, 여행지 카드 이미지
   - 빌드 타임에 Unsplash API로 도시명 검색 → 이미지 URL 캐싱
   - 무료 티어: 시간당 50요청 (SSG 빌드 시 충분)
   - 반드시 photographer attribution 포함 (Unsplash 이용약관)

2. **아고다/클룩 상품 이미지** (트래픽 성장 후)
   - API 승인 후 호텔/액티비티 공식 이미지 사용
   - MVP에서는 Unsplash 대체 이미지 사용

3. **@vercel/og** (OG 이미지 자동 생성)
   - SNS 공유용 동적 OG 이미지
   - 도시명 + 배경 이미지 조합

### Unsplash 연동

```typescript
// lib/unsplash.ts
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function getCityImage(cityName: string, country: string) {
  const query = encodeURIComponent(`${cityName} ${country} travel`);
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=3&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
  );
  const data = await res.json();
  return data.results.map((photo: any) => ({
    url: photo.urls.regular,       // 1080px width
    thumb: photo.urls.small,       // 400px width
    blur: photo.blur_hash,
    alt: photo.alt_description || `${cityName} travel photo`,
    credit: {
      name: photo.user.name,
      link: photo.user.links.html,
    },
  }));
}
```

### next.config.js 이미지 도메인 설정

```javascript
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: '*.agoda.net' },        // 아고다 이미지 (향후)
      { hostname: 'res.klook.com' },       // 클룩 이미지 (향후)
    ],
  },
};
```

### 자동 포스팅 시 이미지 처리

```
1. Claude API로 블로그 초안 생성
2. frontmatter의 city 값으로 Unsplash API 검색
3. 상위 3개 이미지 URL을 frontmatter에 자동 삽입:
   - heroImage: 히어로 이미지
   - ogImage: OG 공유 이미지
   - credit: 포토그래퍼 이름 + 링크
4. MDX 파일 저장 → 빌드 시 next/image로 최적화
```

### 이미지 컴포넌트

모든 이미지는 next/image 사용 필수:
- `sizes` 속성 명시 (반응형)
- `placeholder="blur"` + blurDataURL (Unsplash blur_hash 활용)
- `loading="lazy"` (fold 아래 이미지)
- 포토그래퍼 크레딧 표시 (Unsplash 약관)

---

## Development Guidelines

1. **컴포넌트**: 모든 컴포넌트는 TypeScript + Props interface 정의
2. **스타일**: Tailwind 유틸리티 클래스만 사용 (커스텀 CSS 최소화)
3. **이미지**: next/image 컴포넌트 필수, WebP 포맷, sizes 속성 명시
4. **링크**: 제휴 링크는 반드시 `target="_blank" rel="noopener noreferrer nofollow"` 포함
5. **접근성**: alt 텍스트, aria-label, 키보드 네비게이션 지원
6. **성능**: Core Web Vitals 기준 충족 (LCP < 2.5s, FID < 100ms, CLS < 0.1)
7. **커밋**: conventional commits (feat:, fix:, content:, auto:)