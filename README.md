# 같이 달리기 4주 챌린지 1기 — 모집·운영 웹서비스

> "마라톤 나가보고 싶은데, 같이 나갈 사람이 없다면"

4주 러닝 습관 챌린지를 **모집하고 운영하는** 웹서비스입니다.
방문자가 신청·입금하면 참가자가 되고, 자기 페이스로 러닝을 인증하며 서로 응원합니다.

| 역할 | 페이지 | 하는 일 |
| --- | --- | --- |
| 🟢 방문자 | `/` 랜딩페이지 | 챌린지 소개 + 신청 유도 |
| 🟢 방문자 | `/apply` 신청 | 구글 로그인 → 신청서 작성 → 입금 안내 |
| 🔵 참가자 | `/me` 마이페이지 | 신청 상태, 진행률, 러닝 인증하기, 내 기록 |
| 🔵 참가자 | `/feed` 함께 달리기 | 같은 기수 동료들의 인증 구경 (동료 효과) |
| 🔴 운영자 | `/admin` 관리자 | 신청자 명단, 입금 확인·환불 처리, 인증 현황, CSV 내려받기 |
| ⚖️ 공통 | `/legal/*` | 이용약관 · 개인정보처리방침 · 환불규정 |

**기술**: Next.js (App Router) · TypeScript · Tailwind CSS v4 · Firebase (Auth + Firestore) · Netlify

---

## 💰 무료 요금제(Firebase Spark)로 운영합니다

모든 기능이 **Firebase Spark(무료) + Netlify 무료** 안에서 동작합니다. 서버 비용이 들지 않습니다.

| Firebase 기능 | 사용 | 이유 |
| --- | --- | --- |
| Authentication (구글 로그인) | ✅ 사용 | Spark 무료 |
| Firestore (신청·인증·피드) | ✅ 사용 | Spark 무료 (하루 읽기 5만·쓰기 2만 회) |
| Storage (인증샷 업로드) | ❌ 제외 | 2026년 2월부터 Spark 에서 사용 불가 |
| Cloud Functions | ❌ 제외 | Blaze(종량제) 요금제 필요 |

### 결제는 "입금 확인" 방식입니다

카드·카카오페이·네이버페이 결제는 **PG사 계약**과 **결제 검증 서버**(Cloud Functions → Blaze 필요)가
있어야 해서 무료 요금제로는 만들 수 없습니다. 그래서 1기는 이렇게 운영합니다.

```
신청자: 구글 로그인 → 신청서 작성 → 계좌로 입금
운영자: /admin 에서 입금 확인 → [입금 확인 → 참가 확정] 클릭
신청자: 참가 확정 → 마이페이지에서 러닝 인증 시작
```

10명 규모에서는 이 방식이 가장 단순하고 수수료도 없습니다.
나중에 카드 결제를 붙이려면 사업자등록 → PG 계약 → Blaze 전환 순서로 진행해야 합니다.

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
│   ├── page.tsx                  # 랜딩페이지 (섹션 조립)
│   ├── (app)/                    # 로그인 후 쓰는 페이지들 (주소에 괄호는 안 나타남)
│   │   ├── layout.tsx            # 공통 헤더 + 로그인 상태 공유
│   │   ├── apply/page.tsx        # /apply  신청 · 입금 안내
│   │   ├── me/page.tsx           # /me     마이페이지 · 인증하기
│   │   ├── feed/page.tsx         # /feed   함께 달리기 (공동 피드)
│   │   └── admin/page.tsx        # /admin  관리자
│   └── legal/[slug]/page.tsx     # /legal/terms · privacy · refund
├── components/
│   ├── (랜딩페이지 섹션들)        # Hero, EmpathySection, MyStory, Roadmap ...
│   └── app/                      # 로그인 후 페이지용 (ApplyForm, CheckinForm, ...)
├── data/
│   ├── challenge.ts              # ⭐ 모든 문구·기간·계좌 정보 (비개발자 수정 지점)
│   └── legal.ts                  # ⭐ 약관·방침·환불규정·사업자 정보
├── lib/
│   ├── firebase.ts               # Firebase 연결
│   ├── auth.tsx                  # 로그인 상태 공유
│   ├── data.ts                   # 데이터 읽기·쓰기
│   └── schema.ts                 # 입력값 검증
├── tests/                        # 보안 규칙 · 전체 흐름 테스트 (에뮬레이터)
├── firestore.rules               # ⚠️ Firestore 보안 규칙 (콘솔에 적용 필수)
├── firebase.json                 # 에뮬레이터 설정
└── netlify.toml
```

---

## 🔥 Firebase 최초 설정 (운영자가 1회만, 약 10분)

코드는 준비되어 있고, **Firebase 콘솔에서 아래 5단계만** 해주시면 됩니다.
[Firebase 콘솔](https://console.firebase.google.com) → `runninghabitchallenge` 프로젝트에서 진행하세요.

### ① 구글 로그인 켜기

**Authentication → 시작하기 → Sign-in method → Google → 사용 설정**
→ 프로젝트 지원 이메일 선택 → **저장**

### ② 배포 주소에서 로그인 허용하기

**Authentication → 설정 → 승인된 도메인 → 도메인 추가**

```
vermillion-entremet-bec89b.netlify.app
```

> 이걸 빠뜨리면 로그인할 때 "이 주소에서는 로그인이 허용되지 않았어요" 오류가 납니다.
> 나중에 도메인을 바꾸면 새 도메인도 여기에 추가해야 합니다.

### ③ 데이터베이스 만들기

**Firestore Database → 데이터베이스 만들기**
- 위치: **`asia-northeast3 (서울)`** ← 한국 사용자에게 가장 빠릅니다. **나중에 바꿀 수 없으니** 꼭 서울로 고르세요.
- 모드: **프로덕션 모드**로 시작

### ④ 보안 규칙 적용하기 ⚠️ 가장 중요

**Firestore Database → 규칙 탭** → 기존 내용을 전부 지우고
이 저장소의 [`firestore.rules`](./firestore.rules) 내용을 **통째로 붙여넣기** → **게시**

> 이 규칙이 신청자 개인정보(이름·연락처)와 결제 상태를 지키는 **유일한 장치**입니다.
> Firebase 설정값은 브라우저에 공개되므로, 규칙이 없으면 누구나 전체 명단을 가져갈 수 있습니다.
>
> 규칙이 막아주는 것 (46개 자동 테스트로 검증됨):
> - 참가자가 스스로 "결제 완료"로 바꾸는 것
> - 다른 사람의 신청서·연락처를 보는 것
> - 스스로 관리자가 되는 것
> - 입금 전에 인증을 올리거나 피드를 보는 것
> - 올린 인증의 거리를 나중에 부풀리는 것

### ⑤ 나를 관리자로 등록하기

1. 배포된 사이트의 **`/admin`** 에 구글로 로그인합니다.
2. "관리자 권한이 없어요" 화면에 나오는 **UID 를 복사**합니다.
3. **Firestore Database → 데이터 → 컬렉션 시작**
   - 컬렉션 ID: `admins`
   - 문서 ID: 복사한 UID 붙여넣기
   - 필드 추가: 이름 `note`, 값 `운영자` → **저장**
4. `/admin` 을 새로고침하면 관리자 화면이 열립니다.

> 관리자 지정은 보안상 **Firebase 콘솔에서만** 할 수 있습니다. 웹사이트에서는 누구도 관리자를 추가할 수 없습니다.

### 마지막: 입금 계좌 입력

`data/challenge.ts` 의 `payment` 에 실제 **은행명 · 계좌번호 · 예금주**를 채워주세요.

---

## 🔴 운영 가이드

### 입금 확인하기
1. `/admin` → **입금 대기** 필터
2. 통장 입금 내역과 신청자 이름을 대조
3. **[입금 확인 → 참가 확정]** 클릭 → 그 즉시 참가자 마이페이지에서 인증이 열립니다

### 환불하기
1. 실제 송금을 먼저 합니다. (웹에서는 돈이 움직이지 않습니다)
2. `/admin` 에서 해당 참가자 **[환불 처리]** → 인증·피드 접근이 자동으로 닫힙니다

### 명단 내려받기
`/admin` → **[명단 내려받기 (CSV)]** → 엑셀에서 바로 열립니다. (인증 횟수·누적 거리 포함)

### 다음 기수 열기
`data/challenge.ts` 에서 아래 값만 바꾸면 신청·인증·피드가 새 기수로 따로 쌓입니다.
이전 기수 데이터는 그대로 보존됩니다.

```ts
cohortText: "2기",
cohortId: "cohort-2",
deadline / startDate / endDate / periodText ...
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
| `payment` | 입금 계좌 (은행 · 계좌번호 · 예금주) |
| `data/legal.ts` → `businessInfo` | 상호 · 대표자 · 사업자등록번호 · 통신판매업 신고번호 · 주소 |

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

### ⚖️ 약관·방침·환불규정 (`data/legal.ts`)

유료 서비스라 **이용약관 · 개인정보처리방침 · 환불규정 · 사업자정보** 표기가 필요해 틀을 만들어 두었습니다.
Footer 에 링크가 걸려 있습니다.

> ⚠️ **초안입니다. 법률 전문가가 작성한 것이 아닙니다.** 실제 운영 전에 반드시 검토해 주세요.
> - 사업자등록 · 통신판매업 신고 여부 확인
> - 환불 비율(현재: 시작 전 100% / 시작 후 7일 내 50% / 이후 불가)이 운영 방침·관련 법과 맞는지
> - 개인정보 국외 이전 고지 (Firebase 는 Google 해외 서버에 저장됨 — 방침에 반영해 둠)

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

### 방법 A: 구글 로그인 + 신청 페이지 (기본값 · 권장)

`signup.mode` 가 `"app"` 이면 랜딩페이지의 신청 버튼이 `/apply` 로 연결됩니다.
신청 → 입금 → 관리자 확인 → 마이페이지·인증·피드까지 한 흐름으로 이어집니다.
위의 **Firebase 최초 설정**을 마쳐야 동작합니다.

### 방법 B: 구글폼

가장 간단하고 안전합니다. 신청 내역이 **구글폼 응답 시트에 그대로 쌓입니다.**

1. 구글폼을 만들고 질문을 넣습니다. (이름 / 이메일 / 연락처 / 희망 코스 / 참가 동기 / 개인정보 동의)
2. **보내기 → 링크** 에서 주소를 복사합니다.
3. `data/challenge.ts` 의 `signup.googleFormUrl` 에 붙여넣습니다.
4. `signup.mode` 를 `"google"` 로 바꿉니다.

신청 내역은 구글폼의 **응답 탭 → 시트로 보기**에서 확인하고, 엑셀로 내려받을 수 있습니다.

### 방법 C: 페이지 안의 폼 (Formspree)

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
npm test              # 단위 테스트 51개 (입력 검증, 계산, 화면)
npm run test:rules    # 보안 규칙 + 전체 흐름 46개 (Java 필요, Firebase 에뮬레이터 자동 실행)
```

**보안 규칙 테스트** (`tests/firestore.rules.test.ts`) — 공격 시나리오 42개
- 스스로 결제 완료 만들기 / 남의 신청서 보기 / 관리자 사칭 / 입금 전 인증 / 거리 부풀리기 등

**전체 흐름 테스트** (`tests/app-flow.rules.test.ts`) — 실제 앱 코드로 한 사람의 여정 재현
- 신청 → 입금 전 인증 차단 → 관리자 입금 확인 → 인증 → 피드 → 환불 후 차단
- 앱이 저장하는 데이터 모양이 보안 규칙과 어긋나지 않는지 확인합니다.

> `firestore.rules` 를 고쳤다면 콘솔에 붙여넣기 전에 반드시 `npm run test:rules` 를 돌려보세요.

---

## 7. 접근성 · 반응형 메모

- 모바일 우선으로 설계했고, 모든 섹션이 375px 폭부터 자연스럽게 동작합니다.
- 시맨틱 태그(`section`, `fieldset`, `figure`, `dl`)와 `label`, `aria-*` 속성을 적용했습니다.
- 코스 탭은 좌우 방향키·Home·End 키로 이동할 수 있습니다.
- 다크모드는 사용자의 OS 설정(`prefers-color-scheme`)을 따릅니다.
- `prefers-reduced-motion` 설정 시 애니메이션이 최소화됩니다.
- 상단에 "본문으로 건너뛰기" 링크가 있어 키보드 사용자가 바로 본문에 접근할 수 있습니다.
