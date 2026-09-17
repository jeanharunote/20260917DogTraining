# 한 달 러닝 습관 챌린지 — 참가자 모집 랜딩페이지

> "혼자서는 작심삼일이지만, 함께하면 습관이 됩니다."

러닝 초보자가 한 달 만에 러닝 습관을 만들도록 돕는 챌린지의 **참가 신청 전환**에 집중한
모바일 우선 랜딩페이지입니다.

- **프레임워크**: Next.js (App Router) + TypeScript
- **스타일**: Tailwind CSS v4 — 차분한 보라(아이리스) 테마, 다크모드 자동 대응
- **글꼴**: IBM Plex Sans KR(제목·버튼, 단정한 느낌) + Noto Sans KR(본문) — `next/font` 로 자체 호스팅
- **애니메이션**: framer-motion (스크롤 등장, 아코디언, Sticky CTA)
- **폼**: react-hook-form + zod
- **신청 데이터 저장**: Formspree (엔드포인트는 환경변수로 분리)
- **배포**: Vercel

---

## 1. 폴더 구조

```
.
├── app/
│   ├── api/coach/route.ts   # AI 코치 요청을 Gemini 로 중계
│   ├── api/coach/validate/route.ts  # API 키 유효성 확인
│   ├── globals.css          # 색상 토큰, 다크모드, 폰트, 접근성 기본 스타일
│   ├── layout.tsx           # 공통 레이아웃 · 메타 정보(SEO)
│   └── page.tsx             # 섹션 조립 순서
├── components/
│   ├── Hero.tsx             # 1) 첫 화면 (헤드라인 · 카운트다운 · CTA 1/3)
│   ├── EmpathySection.tsx   # 2) 공감 섹션
│   ├── WhyHabit.tsx         # 3) 습관 원리 & 해결책
│   ├── Roadmap.tsx          # 4) 4주 로드맵 (인터랙티브 타임라인)
│   ├── HabitSystem.tsx      # 5) 습관 지원 장치 & 신뢰 통계
│   ├── Testimonials.tsx     # 6) 후기 카드
│   ├── FAQ.tsx              # 7) 아코디언 FAQ
│   ├── AiCoach.tsx          # 7-1) AI 러닝 코치 (Gemini)
│   ├── SignupForm.tsx       # 8) 신청 폼 (CTA 3/3)
│   ├── Footer.tsx           # 9) 문의처 · SNS · 저작권
│   ├── SiteHeader.tsx       # 상단 고정 헤더 + 앵커 네비게이션
│   ├── StickyCTA.tsx        # 하단 고정 CTA
│   ├── Countdown.tsx        # 모집 마감 카운트다운
│   ├── CtaButton.tsx        # 공통 CTA 버튼
│   ├── SectionHeading.tsx   # 공통 섹션 제목
│   ├── Reveal.tsx           # 스크롤 등장 애니메이션 래퍼
│   └── __tests__/
│       └── SignupForm.test.tsx   # 폼 에러 노출 렌더링 테스트
├── data/
│   └── challenge.ts         # ⭐ 모든 문구와 수치 (비개발자 수정 지점)
├── lib/
│   ├── coach-schema.ts      # AI 코치 입력 검증 + 응답 형태
│   ├── rate-limit.ts        # 운영자 키 사용 시 호출 횟수 제한
│   ├── schema.ts            # zod 검증 스키마 + 에러 메시지
│   ├── utils.ts             # 카운트다운 계산, 클래스 병합 유틸
│   └── __tests__/
│       ├── coach-schema.test.ts  # AI 코치 입력 검증 테스트
│       └── schema.test.ts   # 폼 검증 로직 단위 테스트
├── .env.example             # 환경변수 템플릿
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.mts
└── vitest.setup.ts
```

---

## 2. 설치 및 실행

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 → http://localhost:3000
```

그 밖의 명령어:

```bash
npm run build        # 프로덕션 빌드
npm start            # 빌드 결과 실행
npm test             # 폼 검증 테스트 실행
npm run typecheck    # 타입 검사
npm run lint         # 린트 검사
```

---

## 3. 내용(문구) 수정 방법 — 개발을 몰라도 됩니다

**`data/challenge.ts` 파일 하나만 열면 페이지의 모든 글자를 바꿀 수 있습니다.**
따옴표 `" "` 안의 글자만 바꾸고, 쉼표 `,` 와 중괄호 `{ }` 는 그대로 두세요.

꼭 교체해야 하는 placeholder 값은 파일 위쪽 `challengeInfo` 에 모여 있습니다.

| 항목 | 변수명 | 현재 값(예시) |
| --- | --- | --- |
| 챌린지명 | `name` | 한 달 러닝 습관 챌린지 |
| 챌린지 기간 | `periodText` | 2026-10-01 ~ 2026-10-31 |
| 모집 마감일(카운트다운) | `deadline` | 2026-09-27T23:59:59+09:00 |
| 모집 인원 | `capacityText` | 10명 |
| 참가비 | `feeText` | 29,000원 |
| 완주 리워드 | `rewardText` | 완주 인증 시 러닝 양말 증정 |
| 인증 방식 | `verificationText` | 매일 오픈채팅에 러닝 인증 사진 1장 |
| 커뮤니티 채널 | `communityText` | 카카오톡 오픈채팅 |
| 완주율 등 통계 | `habitSystem.stats` | 87% 등 (placeholder) |

> 📌 `deadline` 날짜가 지나면 카운트다운 자리에 자동으로 "모집이 마감되었어요" 문구가 나옵니다.
> 기수를 새로 열 때는 `periodText`, `deadline`, `deadlineText`, `hero.badge` 를 함께 바꿔주세요.

### 색상과 글꼴 바꾸기

- **색상**: `app/globals.css` 의 `--color-brand-*`(메인 보라)와 `--color-accent-*`(포인트 노을빛 살구)
  값만 바꾸면 버튼·링크·강조 텍스트·그라데이션이 한 번에 바뀝니다.
  버튼 그라데이션의 각도나 색 배치는 `--gradient-brand` 에서 조정할 수 있습니다.
- **글꼴**: `app/layout.tsx` 상단의 `IBM_Plex_Sans_KR`, `Noto_Sans_KR` 를 다른 Google Fonts 한글 글꼴
  이름으로 바꾸면 됩니다. (세련된 계열: `Gowun_Dodum`, `Hahmlet` / 부드러운 계열: `Jua`, `Do_Hyeon`)

### 히어로 배경 이미지 넣기

1. 이미지 파일을 `public/` 폴더에 넣습니다. (예: `public/running-hero.jpg`)
2. `data/challenge.ts` 의 `hero.backgroundImage` 에 `"/running-hero.jpg"` 를 적습니다.
3. `hero.backgroundImageAlt` 에 이미지 설명을 적어주세요. (시각장애인 접근성용)

비워두면 러닝 분위기의 그래디언트 배경이 그대로 사용됩니다.

---

## 4. 신청 폼(Formspree) 연동 설정

### 설정 순서

1. [formspree.io](https://formspree.io) 에 가입하고 새 폼을 만듭니다.
2. 발급된 엔드포인트(`https://formspree.io/f/xxxxxxxx`)를 복사합니다.
3. 프로젝트 루트에서 `.env.example` 을 복사해 `.env.local` 을 만듭니다.

   ```bash
   cp .env.example .env.local
   ```

4. `.env.local` 의 값을 복사한 주소로 바꿉니다.

   ```env
   NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
   ```

5. 개발 서버를 재시작하면 신청 내용이 Formspree 로 전송되고, 등록한 메일로 알림이 옵니다.

> 엔드포인트를 설정하지 않은 상태에서는 개발 모드일 때만 전송을 건너뛰고
> 입력값을 브라우저 콘솔에 출력합니다. (배포 환경에서는 오류 메시지를 보여줍니다.)

### 전송되는 항목

이름, 이메일, 연락처, 러닝 경력, 참가 동기와 함께 어떤 기수의 신청인지
(`_challenge`, `_period`, `_submittedAt`) 가 같이 전송됩니다.

### 다른 방식으로 바꾸려면

저장 방식은 `components/SignupForm.tsx` 의 `sendSignup` 함수 한 곳만 고치면 됩니다.

- **Google Sheets**: Apps Script 에 `doPost(e)` 를 만들어 "웹 앱"으로 배포한 뒤,
  발급된 `/exec` 주소를 같은 환경변수에 넣습니다. (`mode: "no-cors"` 옵션이 필요할 수 있습니다.)
- **Supabase**: `npm install @supabase/supabase-js` 후 `signups` 테이블을 만들고
  `sendSignup` 내부를 `supabase.from("signups").insert(...)` 로 교체합니다.
  키 노출을 피하려면 `app/api/signup/route.ts` 라우트 핸들러를 거치세요.

자세한 안내는 `components/SignupForm.tsx` 상단 주석에 있습니다.

---

## 5. AI 러닝 코치 (Gemini)

방문자가 **자신의 Gemini API 키를 직접 입력**하면, 키·체중·러닝 경험·가능 일수·선호 시간대를
바탕으로 4주 계획과 부상 예방 조언을 받아볼 수 있습니다.

### 두 가지 운영 방식

이 기능은 **누구의 API 키를 쓰느냐**에 따라 화면이 자동으로 달라집니다.

| | 운영자 키 방식 (권장) | 방문자 키 방식 |
| --- | --- | --- |
| 조건 | `GEMINI_API_KEY` 환경변수 등록 | 환경변수 없음 |
| 방문자가 할 일 | 키·체중만 입력하고 버튼 클릭 | API 키를 직접 발급받아 입력 |
| 비용 부담 | 운영자 | 방문자 |
| 진입 장벽 | 없음 | 높음 (대부분 이탈) |
| 호출 제한 | 같은 방문자 10분당 5회 | 없음 |

모집 페이지라면 **운영자 키 방식**을 쓰세요. 방문자에게 구글 계정 로그인과 키 발급을
요구하면 대부분 그냥 나갑니다.

### 운영자 키 등록 방법 (권장)

1. [Google AI Studio](https://aistudio.google.com/apikey) 에서 API 키를 발급받습니다.
2. 호스팅 환경변수에 등록합니다.

   | Key | Value |
   | --- | --- |
   | `GEMINI_API_KEY` | `AIza...` |

   - Netlify: **Site configuration → Environment variables → Add a variable**
   - Vercel: **Settings → Environment Variables**
   - 로컬: `.env.local` 파일에 작성

3. **재배포**합니다. (Netlify 는 `Deploys → Trigger deploy → Clear cache and deploy site`)
4. 배포 후 AI 코치 섹션에서 **API 키 입력칸이 사라지고** "바로 사용하실 수 있어요" 안내가
   보이면 정상입니다.

> ⚠️ `GEMINI_API_KEY` 에는 **절대 `NEXT_PUBLIC_` 을 붙이지 마세요.**
> 붙이면 키가 브라우저에 그대로 노출되어 누구나 가져다 쓸 수 있습니다.
> 이 이름 그대로 등록해야 서버에서만 사용됩니다.

### 사용량 보호

운영자 키를 쓰면 공개 페이지가 곧 공개 API 가 되므로, 같은 방문자(IP)가 **10분에 5회**까지만
요청할 수 있도록 제한했습니다. 제한 값은 `lib/rate-limit.ts` 상단에서 바꿀 수 있습니다.

> 서버 메모리에 기록하는 방식이라 서버가 여러 대로 늘어나면 완벽하지는 않습니다.
> 정확한 제한이 필요하면 Upstash Redis 같은 외부 저장소를 붙이세요.
> 추가로 Google AI Studio 에서 키 자체에 사용량 상한을 걸어두는 것을 권장합니다.

### 방문자 키 방식 (환경변수를 등록하지 않았을 때)

`GEMINI_API_KEY` 가 없으면 방문자가 각자 키를 입력하는 화면이 나옵니다.

- **키 확인하기** 버튼으로 그 키가 쓸 수 있는 키인지 즉시 확인할 수 있습니다.
  (글 생성 없이 확인만 하므로 사용량이 들지 않습니다.)
- **키 보기** 토글로 붙여넣은 값을 눈으로 확인할 수 있습니다.
- "기억하기" 선택 시 해당 방문자의 브라우저(`localStorage`)에만 저장됩니다.

### 배포 환경 주의사항

AI 코치는 서버 라우트(`/api/coach`)를 사용합니다. 정적 호스팅(GitHub Pages 등)에는 올릴 수 없고,
Netlify 에서는 `netlify.toml` 의 `@netlify/plugin-nextjs` 가 있어야 동작합니다.

### 모델 변경

`data/challenge.ts` 의 `aiCoach.model` 값만 바꾸면 됩니다. (기본값: `gemini-3.5-flash-lite`)

### 안전 장치

- 응답은 Gemini 의 구조화 출력(`responseSchema`)으로 형태를 고정하고, 화면에 그리기 전에
  zod 로 한 번 더 확인합니다.
- 시스템 프롬프트에서 **체형 평가·감량 권유를 금지**하고, 사용자가 말한 가능 일수를 넘기지
  않도록 제한했습니다.
- 건강 관련 내용이므로 **의학적 조언이 아니라는 안내 문구**를 폼과 결과 양쪽에 노출합니다.
  (`data/challenge.ts` 의 `aiCoach.disclaimer`)

---

## 6. 배포 방법

### Netlify (현재 사용 중)

1. [netlify.com](https://netlify.com) 로그인 → **Add new site → Import an existing project**
2. GitHub 저장소 `20260917DogTraining` 선택
3. 빌드 설정은 저장소의 `netlify.toml` 이 알아서 잡아줍니다. (손댈 것 없음)
   - 이 파일에 `@netlify/plugin-nextjs` 가 선언되어 있어야 **AI 코치(`/api/coach`)가 동작**합니다.
     플러그인이 없으면 페이지는 보이지만 AI 코치 버튼에서 404 가 납니다.
4. **Site configuration → Environment variables → Add a variable** 에서 아래를 등록합니다.

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | `https://formspree.io/f/xxxxxxxx` |

5. **Deploys → Trigger deploy → Clear cache and deploy site** 로 다시 배포합니다.
   `NEXT_PUBLIC_` 값은 빌드 시점에 코드에 심어지므로 **등록만 하고 재배포하지 않으면 적용되지 않습니다.**

> 배포 주소가 바뀌면 `data/challenge.ts` 의 `siteMeta.url` 도 함께 바꿔주세요.
> (링크를 공유할 때 뜨는 미리보기 카드에 사용됩니다.)

### Vercel (대안)

1. [vercel.com](https://vercel.com) 에서 **Add New → Project** 로 저장소를 가져옵니다.
   (Next.js 프로젝트는 빌드 설정이 자동으로 잡힙니다.)
3. **Settings → Environment Variables** 에 아래 값을 추가합니다.

   | Name | Value | Environment |
   | --- | --- | --- |
   | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | `https://formspree.io/f/xxxxxxxx` | Production, Preview, Development |

4. **Deploy** 를 누르면 배포가 끝납니다. 이후 기본 브랜치에 push 할 때마다 자동 배포됩니다.

CLI 로 배포하려면:

```bash
npm i -g vercel
vercel          # 미리보기 배포
vercel --prod   # 운영 배포
```

---

## 7. 테스트

```bash
npm test
```

- `lib/__tests__/schema.test.ts` — 필수 항목 미입력, 이메일/연락처 형식, 동의 체크 검증
- `lib/__tests__/coach-schema.test.ts` — AI 코치 입력 범위 검증, 문자열→숫자 변환, AI 응답 형태 검증
- `components/__tests__/SignupForm.test.tsx` — 빈 폼 제출 시 **화면에 에러 메시지가 실제로 노출되는지**,
  `aria-invalid` 가 붙는지, 정상 입력 시 성공 메시지가 보이는지 확인

---

## 8. 접근성 · 반응형 메모

- 모바일 우선으로 설계했고, 모든 섹션이 375px 폭부터 자연스럽게 동작합니다.
- 시맨틱 태그(`section`, `fieldset`, `blockquote`, `dl`)와 `label`, `aria-*` 속성을 적용했습니다.
- 로드맵 탭은 좌우 방향키·Home·End 키로 이동할 수 있습니다.
- 다크모드는 사용자의 OS 설정(`prefers-color-scheme`)을 따릅니다.
- `prefers-reduced-motion` 설정 시 애니메이션이 최소화됩니다.
- 상단에 "본문으로 건너뛰기" 링크가 있어 키보드 사용자가 바로 본문에 접근할 수 있습니다.
