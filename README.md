# 같이 달리기 4주 챌린지 1기 — 참가자 모집 랜딩페이지

> "마라톤 나가보고 싶은데, 같이 나갈 사람이 없다면"

4주 동안 같이 뛰고 같이 대회를 신청하는 러닝 챌린지의 **참가 신청 전환**에 집중한
모바일 우선 랜딩페이지입니다.

- **프레임워크**: Next.js (App Router) + TypeScript
- **스타일**: Tailwind CSS v4 — 차분한 보라(아이리스) 테마, 다크모드 자동 대응
- **글꼴**: IBM Plex Sans KR(제목·버튼) + Noto Sans KR(본문) — `next/font` 로 자체 호스팅
- **애니메이션**: framer-motion (스크롤 등장, 아코디언, Sticky CTA)
- **신청 접수**: 구글폼 링크 (기본) 또는 페이지 내 폼 + Formspree
- **배포**: Netlify

---

## ⚠️ 콘텐츠 작성 원칙 (꼭 읽어주세요)

참가비를 받는 모집이므로 **확인되지 않은 숫자나 지어낸 후기는 절대 쓰지 마세요.**
허위·과장 광고 문제가 될 수 있고, 들키면 신뢰가 한 번에 무너집니다.

- ❌ "완주율 87%", "누적 참가자 1,200명", "김OO 32세 후기" → 1기에는 존재할 수 없는 데이터
- ✅ "1기 10명 한정", "주 4회", "4주" → 확인 가능한 **프로그램 정보**
- ✅ 운영자 본인의 실제 경험과 비포·애프터 → `data/challenge.ts` 의 `myStory`

---

## 1. 폴더 구조

```
.
├── app/
│   ├── globals.css          # 색상 토큰, 다크모드, 글꼴, 접근성 기본 스타일
│   ├── layout.tsx           # 공통 레이아웃 · 메타 정보(SEO)
│   └── page.tsx             # 섹션 조립 순서
├── components/
│   ├── Hero.tsx             # 1) 첫 화면 (헤드라인 · 카운트다운 · CTA)
│   ├── EmpathySection.tsx   # 2) 공감 섹션
│   ├── MyStory.tsx          # 3) 제 이야기 (비포·애프터)
│   ├── WhyHabit.tsx         # 4) 습관 원리 & 해결책
│   ├── Roadmap.tsx          # 5) 레벨별 4주 코스 (입문/10K/하프)
│   ├── HabitSystem.tsx      # 6) 지원 장치 + 프로그램 정보
│   ├── FAQ.tsx              # 7) 아코디언 FAQ
│   ├── SignupForm.tsx       # 8) 신청 (구글폼 링크 또는 직접 입력 폼)
│   ├── Footer.tsx           # 9) 문의처 · SNS · 저작권
│   ├── SiteHeader.tsx       # 상단 고정 헤더 + 앵커 네비게이션
│   ├── StickyCTA.tsx        # 하단 고정 CTA
│   ├── Countdown.tsx        # 모집 마감 카운트다운
│   ├── CtaButton.tsx        # 공통 CTA 버튼
│   ├── SectionHeading.tsx   # 공통 섹션 제목
│   ├── Reveal.tsx           # 스크롤 등장 애니메이션 래퍼
│   └── __tests__/           # 신청 섹션 렌더링 테스트 (두 가지 모드)
├── data/
│   └── challenge.ts         # ⭐ 모든 문구와 수치 (비개발자 수정 지점)
├── lib/
│   ├── schema.ts            # zod 검증 스키마 + 에러 메시지
│   ├── utils.ts             # 카운트다운 계산, 클래스 병합 유틸
│   └── __tests__/           # 폼 검증 단위 테스트
├── .env.example
├── netlify.toml
└── (설정 파일들)
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
npm test             # 검증 테스트 실행
npm run typecheck    # 타입 검사
npm run lint         # 린트 검사
```

---

## 3. 내용(문구) 수정 방법 — 개발을 몰라도 됩니다

**`data/challenge.ts` 파일 하나만 열면 페이지의 모든 글자를 바꿀 수 있습니다.**
따옴표 `" "` 안의 글자만 바꾸고, 쉼표 `,` 와 중괄호 `{ }` 는 그대로 두세요.

### 지금 꼭 채워야 하는 자리 (`[○]` 로 표시된 곳)

| 위치 | 내용 |
| --- | --- |
| `myStory.paragraphs` | 몇 개월 동안 몇 kg 빠졌는지 |
| `myStory.beforeAfter.caption` | 같은 내용 (사진 설명) |
| `myStory.changes` | 달린 기간 · 체중 변화 |
| `myStory.beforeAfter.beforeImage` / `afterImage` | 비포·애프터 사진 경로 |
| `challengeInfo.raceNote` | 대회명과 일정 |
| `signup.googleFormUrl` | 구글폼 주소 |
| `footer.contact` | 실제 문의 이메일 · 카카오톡 |

### 주요 설정값

| 항목 | 변수명 | 현재 값 |
| --- | --- | --- |
| 챌린지명 | `name` | 같이 달리기 4주 챌린지 |
| 기간 | `periodText` | 2026년 10월 5일(월) ~ 11월 1일(일) · 4주 |
| 모집 마감(카운트다운) | `deadline` | 2026-10-02T23:59:59+09:00 |
| 모집 인원 | `capacityText` | 10명 |
| 참가비 | `feeText` / `feeNote` | 50,000원 / 대회 참가비 별도 |
| 인증 방식 | `verificationText` | 주 4회 러닝 인증 사진 |
| 완주 리워드 | `rewardText` | 완주 인증 시 러닝 양말 증정 |

> 📌 `deadline` 이 지나면 카운트다운 자리에 "모집이 마감되었어요" 문구가 자동으로 나옵니다.

### 비포·애프터 사진 넣기

1. 사진을 `public/` 폴더에 넣습니다. (예: `public/before.jpg`, `public/after.jpg`)
2. `myStory.beforeAfter.beforeImage` 에 `"/before.jpg"`, `afterImage` 에 `"/after.jpg"` 를 적습니다.
3. 두 장을 모두 넣어야 화면에 나옵니다. 하나라도 비어 있으면 사진 영역이 숨겨집니다.

### 색상과 글꼴 바꾸기

- **색상**: `app/globals.css` 의 `--color-brand-*`(메인 보라)와 `--color-accent-*`(포인트 살구).
  버튼 그라데이션은 `--gradient-brand` 에서 조정합니다.
- **글꼴**: `app/layout.tsx` 상단의 `IBM_Plex_Sans_KR`, `Noto_Sans_KR` 를 다른 Google Fonts
  한글 글꼴 이름으로 바꾸면 됩니다.

---

## 4. 신청 접수 방법

`data/challenge.ts` 의 `signup.mode` 값으로 고릅니다.

### 방법 A: 구글폼 (기본값 · 권장)

가장 간단하고 안전합니다. 신청 내역이 **구글폼 응답 시트에 그대로 쌓입니다.**

1. 구글폼을 만들고 질문을 넣습니다. (이름 / 이메일 / 연락처 / 희망 코스 / 참가 동기 / 개인정보 동의)
2. **보내기 → 링크** 에서 주소를 복사합니다.
3. `data/challenge.ts` 의 `signup.googleFormUrl` 에 붙여넣습니다.
4. `signup.mode` 는 `"google"` 그대로 둡니다.

신청 내역은 구글폼의 **응답 탭 → 시트로 보기**에서 확인하고, 엑셀로 내려받을 수 있습니다.

### 방법 B: 페이지 안의 폼 (Formspree)

페이지를 떠나지 않고 신청받고 싶을 때 씁니다.

1. `data/challenge.ts` 의 `signup.mode` 를 `"form"` 으로 바꿉니다.
2. [formspree.io](https://formspree.io) 에서 폼을 만들어 엔드포인트를 발급받습니다.
3. 호스팅 환경변수에 등록합니다.

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | `https://formspree.io/f/xxxxxxxx` |

4. **재배포**합니다. `NEXT_PUBLIC_` 값은 빌드 시점에 코드에 심어지므로,
   등록만 하고 재배포하지 않으면 적용되지 않습니다.

> 엔드포인트를 설정하지 않으면 신청 버튼에서 "전송에 실패했어요"가 뜹니다.
> 확실하지 않다면 방법 A(구글폼)를 쓰는 편이 안전합니다.

---

## 5. 배포 방법

### Netlify (현재 사용 중)

1. [netlify.com](https://netlify.com) → **Add new site → Import an existing project**
2. GitHub 저장소를 선택하면 `netlify.toml` 이 빌드 설정을 자동으로 잡아줍니다.
3. 환경변수가 필요하면 **Site configuration → Environment variables** 에 등록합니다.
   (구글폼 방식이면 등록할 환경변수가 없습니다.)
4. 환경변수를 바꿨다면 **Deploys → Trigger deploy → Clear cache and deploy site**

> 배포 주소가 바뀌면 `data/challenge.ts` 의 `siteMeta.url` 도 함께 바꿔주세요.
> (카카오톡·인스타로 링크를 공유할 때 뜨는 미리보기 카드에 사용됩니다.)

### Vercel (대안)

**Add New → Project** 로 저장소를 가져오면 빌드 설정이 자동으로 잡힙니다.
환경변수는 **Settings → Environment Variables** 에 등록합니다.

---

## 6. 테스트

```bash
npm test
```

- `lib/__tests__/schema.test.ts` — 필수 항목 미입력, 이메일/연락처 형식, 동의 체크 검증
- `components/__tests__/SignupForm.test.tsx` — 직접 입력 폼 모드에서 **화면에 에러가 실제로 노출되는지**
- `components/__tests__/SignupFormGoogle.test.tsx` — 구글폼 모드에서 링크만 노출되고 입력칸이 없는지

---

## 7. 접근성 · 반응형 메모

- 모바일 우선으로 설계했고, 모든 섹션이 375px 폭부터 자연스럽게 동작합니다.
- 시맨틱 태그(`section`, `fieldset`, `figure`, `dl`)와 `label`, `aria-*` 속성을 적용했습니다.
- 코스 탭은 좌우 방향키·Home·End 키로 이동할 수 있습니다.
- 다크모드는 사용자의 OS 설정(`prefers-color-scheme`)을 따릅니다.
- `prefers-reduced-motion` 설정 시 애니메이션이 최소화됩니다.
- 상단에 "본문으로 건너뛰기" 링크가 있어 키보드 사용자가 바로 본문에 접근할 수 있습니다.
