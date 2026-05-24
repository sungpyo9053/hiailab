# 🆚 셀프호스팅 vs SaaS 모드

HI AI LAB은 두 가지 운영 모드를 지원합니다.

| | self (셀프호스팅) | saas (SaaS 다중 사용자) |
| --- | --- | --- |
| **누가 운영** | 본인 | 운영자(어드민) 1명 |
| **누가 사용** | 본인 1명 | 가입한 다수 사용자 |
| **저장 위치** | `.hiailab/` 단일 | `.hiailab/users/<email>/` 사용자별 |
| **인증** | 없음 (OWNER_EMAIL 잠금) | Gmail OAuth 로그인 + cookie 세션 |
| **AI 비용** | 본인 키, 본인 부담 | 운영자 키, 모든 사용자 공유 |
| **개인정보 책임** | 본인 | 운영자 |
| **OAuth 검수** | 본인만 쓰면 불필요 | 100명 넘으면 Google 검수 필요 |

## 환경변수로 결정

`.env.local`:
```env
HIAILAB_MODE=self    # 또는 saas
```

`HIAILAB_MODE` 없으면 자동으로 `self`.

---

## 🏠 self 모드 (셀프호스팅)

본인 컴퓨터/서버에 깔아서 본인만 쓰는 모드.

### 셋업
```env
HIAILAB_MODE=self
OWNER_EMAIL=mygmail@gmail.com    # 본인 Gmail (잠금)
APP_ENCRYPTION_KEY=...
GROQ_API_KEY=gsk_...             # 또는 GEMINI/OPENAI
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
```

### 동작
- `/` 메인 페이지에 바로 카탈로그가 보임 (로그인 화면 없음)
- 모든 데이터가 `.hiailab/` 루트에 저장 (단일 사용자)
- `OWNER_EMAIL` 외 다른 Gmail로 OAuth 시도 시 `not_owner` 에러

### 추천 대상
- 본인 메일에만 자동화 쓰고 싶은 개인
- 코드 커스터마이즈 하고 싶은 개발자
- 사용자 데이터를 본인이 통제하고 싶은 경우

---

## ☁️ saas 모드 (다중 사용자)

운영자(어드민)가 한 인스턴스를 운영하고, 사용자들이 가입해서 쓰는 모드.

### 셋업
```env
HIAILAB_MODE=saas
OWNER_EMAIL=admin@yourdomain.com  # 어드민 (필수)
APP_ENCRYPTION_KEY=...
GROQ_API_KEY=gsk_...              # 모든 사용자에게 공유될 LLM 키
GOOGLE_OAUTH_CLIENT_ID=...        # 모든 사용자에게 공유될 OAuth 앱
GOOGLE_OAUTH_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 동작
- `/` 메인 페이지에 로그인 안 된 사용자는 **"📨 Gmail로 시작하기"** 버튼만
- Gmail OAuth 로 로그인 → cookie 세션 발급
- 각 사용자는 본인의 `.hiailab/users/<email>/` 디렉토리만 접근
- `OWNER_EMAIL` 로 로그인하면 어드민 — `/admin` 대시보드 접근 가능

### 어드민 권한
- `/admin` 페이지: 전체 사용자/에이전트 활성화/처리량
- `/setup` 의 전역 키(LLM, Google OAuth 앱) 변경 가능
- 일반 사용자는 본인의 SMTP/Kakao 만 변경 가능

### 추천 대상
- 친구/팀에게 자동화 서비스 제공하고 싶은 운영자
- 영상 시청자가 본인 인스턴스 안 깔고 쉽게 체험하길 원하는 경우

### ⚠️ 운영 책임
1. **모든 사용자 메일이 운영자 서버 통과** — 개인정보보호법 적용 가능
2. **LLM quota 공유** — Groq 일 14,400회 = 사용자 100명 일 144회분
3. **Google OAuth 검수** — "테스트 사용자 100명" 초과 시 Google 검수 (1~6주)
4. **서버 메모리/CPU** — Lightsail Ubuntu 2GB는 ~50명 무난

---

## 🔄 모드 전환

self → saas:
1. `.env.local` 에 `HIAILAB_MODE=saas` 추가
2. `OWNER_EMAIL` 가 본인 메일인지 확인 (어드민)
3. dev 서버 재시작
4. 기존 `.hiailab/config.enc.json` 등은 자동으로 어드민 사용자에게 매핑되지 않음 — 어드민으로 Gmail OAuth 재로그인 권장

saas → self:
1. `HIAILAB_MODE=self` 로 변경
2. `OWNER_EMAIL` 그대로 두면 잠금 동작
3. 기존 사용자 데이터(`.hiailab/users/*`)는 계속 디스크에 남음 — 필요하면 수동 삭제

---

## 🤖 에이전트 동작 차이

|  | self | saas |
| --- | --- | --- |
| **agent-loop 폴링** | `_self` 1명 | 모든 사용자 순회 |
| **활성화 상태** | `.hiailab/agents.json` | `.hiailab/users/<email>/agents.json` |
| **처리 메일 로그** | `.hiailab/processed.json` | `.hiailab/users/<email>/processed.json` |
| **Gmail OAuth 토큰** | `.hiailab/config.enc.json` (단일) | `.hiailab/users/<email>/config.enc.json` |

---

## 🛡️ 보안

두 모드 모두:
- 비밀값은 `APP_ENCRYPTION_KEY` 로 AES-256-GCM 암호화
- cookie 세션은 `APP_ENCRYPTION_KEY` 에서 파생된 별도 키로 HMAC 서명
- 메일 본문은 DB/디스크에 저장 안 됨 (분류 카테고리 + 메일 ID만 기록)
- 답장 자동 발송 X (임시보관함까지만)

추가 가이드: [docs/CUSTOMIZE.md](./CUSTOMIZE.md)
