# 🛠️ 커스터마이즈 가이드 (셀프호스팅)

본인 서버에 깐 HI AI LAB을 입맛에 맞게 고치고 싶을 때 보는 문서입니다.

> 일반 사용자라면 → [QUICKSTART.md](../QUICKSTART.md) 만 따라하시면 됩니다.
> 이 문서는 **개발자/커스터마이즈 원하는 사용자** 용입니다.

---

## 📦 구조 한눈에

```
hiailab/
├── app/                          # Next.js App Router (UI + API)
│   ├── page.tsx                  # 메인 = 에이전트 카탈로그
│   ├── CatalogClient.tsx         # 카탈로그 UI (카드 그리드)
│   ├── agent/                    # 메일 답장 에이전트 상세
│   ├── setup/                    # 키/연결 설정
│   └── api/
│       ├── agents/               # 카탈로그 + 활성화 토글
│       ├── agent/                # 에이전트 실행/상태/로그
│       ├── gmail/                # Gmail OAuth + 연결 관리
│       ├── setup/                # 키 저장/테스트
│       └── send-email, send-kakao-me, generate, config
├── lib/                          # 서버 전용 로직
│   ├── agents.ts                 # 카탈로그 메타데이터 ⭐
│   ├── agents-store.ts           # 활성화 상태 저장
│   ├── agent.ts                  # 메일 답장 에이전트 본체
│   ├── agent-loop.ts             # 5분 폴링 워커
│   ├── classifier.ts             # AI 분류기 (LLM 호출)
│   ├── gmail.ts                  # Gmail OAuth + API 래퍼
│   ├── llm.ts                    # LLM 추상화 (Groq > Gemini > OpenAI)
│   ├── server-config.ts          # env + 저장 config 통합 reader
│   ├── config-store.ts           # 암호화 키 저장소 (.hiailab/config.enc.json)
│   ├── crypto.ts                 # AES-256-GCM 헬퍼
│   ├── prompts.ts                # 자판기별 system prompt (server-only)
│   └── mocks.ts                  # AI 키 없을 때 mock 결과
├── docs/                         # 가이드
└── .hiailab/                     # 런타임 데이터 (Git 제외)
    ├── config.enc.json           # 키들 (AES-256-GCM)
    ├── processed.json            # 처리한 메일 ID
    ├── agent-state.json          # 자동 폴링 ON/OFF
    └── agents.json               # 에이전트 활성화 상태
```

---

## 🔌 새 에이전트 추가하는 법

### 1. 카탈로그에 메타 추가

`lib/agents.ts` 의 `AGENTS` 배열에:

```ts
{
  id: "my-agent",
  name: "내가 만든 에이전트",
  emoji: "🚀",
  tagline: "한 줄 요약",
  description: "상세 설명",
  status: "available",           // 또는 "coming_soon"
  category: "email",             // email | meeting | schedule | writing
  requirements: [
    { label: "Gmail 연결", key: "gmail_oauth", required: true },
    { label: "AI 키", key: "ai_key", required: true },
  ],
}
```

### 2. 에이전트 로직 작성

`lib/my-agent.ts` 같은 새 파일에 핵심 로직:

```ts
import "server-only";
import { callLLM } from "./llm";

export async function runMyAgent(): Promise<{ ok: boolean }> {
  const result = await callLLM({
    systemInstruction: "당신은 ...",
    userPrompt: "처리할 내용",
    maxTokens: 500,
    temperature: 0.3,
  });
  // 처리 로직
  return { ok: true };
}
```

### 3. API 라우트 추가

`app/api/my-agent/run/route.ts` 같은 파일:

```ts
import { NextResponse } from "next/server";
import { runMyAgent } from "@/lib/my-agent";

export async function POST() {
  const r = await runMyAgent();
  return NextResponse.json(r);
}
```

### 4. (선택) 카탈로그 카드 클릭 시 상세 페이지

`app/agents/my-agent/page.tsx` 만들고 카탈로그 카드에서 링크 연결.

### 5. 활성화 시 동작 연동

`app/api/agents/[id]/activate/route.ts` 의 분기에 추가:

```ts
if (id === "my-agent") {
  // 활성화 시 해야 할 일 (예: cron 등록, 워커 시작)
}
```

### 6. (선택) `agent-loop.ts` 폴링에 포함

주기적으로 실행되어야 하면 `lib/agent-loop.ts` 의 setInterval 안에서 `runMyAgent()` 호출.

---

## 🎨 UI 색상/스타일 바꾸기

### 메인 강조색 (현재 노란색)
`app/globals.css`:
```css
:root {
  --background: #0b0d10;
  --foreground: #f5f6f8;
  --accent: #ffd84d;    /* ← 이거 바꿈 */
}
```

### 다크 → 라이트 모드 변경
`globals.css` 의 `--background`, `--foreground` 색상 반전 + Tailwind 클래스의 `white/10` 같은 거 `black/10` 으로 치환 (전체 검토 필요).

### 폰트
`app/layout.tsx` 의 `<html lang="ko">` 에 next/font import 적용.

---

## 🤖 LLM 모델 / 프롬프트 수정

### 모델 변경
`lib/llm.ts` 의 `callGroq()` / `callOpenAI()` 에서 `model` 필드:

```ts
// Groq 기본: llama-3.3-70b-versatile
// 다른 옵션: llama-3.1-70b-versatile, mixtral-8x7b-32768
model: "llama-3.3-70b-versatile",
```

### 답장 시스템 프롬프트
`lib/agent.ts` 의 `REPLY_SYSTEM_PROMPT` 상수.

### 분류 시스템 프롬프트 + 카테고리
`lib/classifier.ts` 의 `SYSTEM_PROMPT` + `MailCategory` 타입.

새 카테고리 추가 시 — agent.ts 의 `runAgentOnce` 안에서 `if (category === "내카테고리") { ... }` 분기 추가.

---

## 🔐 환경변수 / 키 관리

`.env.local` (Git 제외):

| 키 | 용도 | 어디서 발급 |
| --- | --- | --- |
| `APP_ENCRYPTION_KEY` | `.hiailab/config.enc.json` 암호화 | `openssl rand -base64 32` |
| `OWNER_EMAIL` | 소유자 잠금 (이 메일만 OAuth 가능) | 본인 메일 |
| `GROQ_API_KEY` | LLM (무료, 추천) | <https://console.groq.com/keys> |
| `GEMINI_API_KEY` | LLM 대안 (카드 등록 필요) | <https://aistudio.google.com/apikey> |
| `OPENAI_API_KEY` | LLM 대안 (유료) | <https://platform.openai.com/api-keys> |
| `GOOGLE_OAUTH_CLIENT_ID` | Gmail 연결 | Google Cloud Console |
| `GOOGLE_OAUTH_CLIENT_SECRET` | 위와 동일 | 위와 동일 |
| `SMTP_HOST/PORT/USER/PASS` | (선택) 이메일 발송 부가 기능 | Gmail 앱 비밀번호 |
| `KAKAO_ACCESS_TOKEN` | (선택) 카카오톡 나에게 보내기 | 카카오 개발자 콘솔 |
| `NEXT_PUBLIC_APP_URL` | OAuth redirect URI 베이스 | `https://your-domain` |
| `HOST_PORT` | Docker 호스트 포트 (기본 3000) | 자유 |
| `AGENT_POLL_INTERVAL_SEC` | 자동 폴링 주기 (기본 300) | 자유 |

---

## 🔄 자동 폴링 주기 변경

기본 5분 (300초). `.env.local`:
```env
AGENT_POLL_INTERVAL_SEC=180   # 3분으로
```

> 너무 짧으면 Gmail API + LLM quota 빨리 소진. 최소 60초 권장.

---

## 📁 데이터 저장 위치 변경

`.hiailab/` 폴더가 기본. 다른 위치로 바꾸려면 lib/config-store.ts 등의 `STORE_DIR` 수정 (현재는 `process.cwd() + .hiailab`).

---

## 🐳 Docker 커스터마이즈

`Dockerfile` / `docker-compose.yml`:
- 포트 변경: `docker-compose.yml` 의 `${HOST_PORT:-3000}:3000` 부분
- 베이스 이미지 변경: `Dockerfile` 의 `node:20-alpine` → 원하는 버전
- 환경변수 추가: `docker-compose.yml` 의 `env_file` 외 직접 `environment:` 섹션

---

## 🛡️ 보안 추가 사항

### 외부 접근 IP 제한 (간단)
nginx/Caddy 앞단에 IP whitelist:

**Caddy**:
```
hi.example.com {
    @allowed remote_ip 1.2.3.4 5.6.7.8
    handle @allowed {
        reverse_proxy localhost:3100
    }
    respond 403
}
```

### Basic Auth 추가
```
hi.example.com {
    basic_auth {
        admin $2a$14$bcrypt해시
    }
    reverse_proxy localhost:3100
}
```

---

## 🐛 디버깅

### 서버 로그 실시간
```bash
sudo journalctl -u hiailab -f
```

### 분류기/AI 호출 결과 보기
`lib/classifier.ts` 또는 `lib/llm.ts` 에 `console.log` 추가 (단 비밀값 출력 금지 — 메시지만)

### 처리 로그 직접 확인
```bash
cat .hiailab/processed.json | jq .recent[0]
```

---

## 🔁 코드 업데이트 받기

원본 저장소(`sungpyo9053/hiailab`) 갱신 사항을 받고 싶을 때:

```bash
cd ~/hiailab
git remote add upstream https://github.com/sungpyo9053/hiailab.git
git fetch upstream
git merge upstream/main      # 충돌 나면 본인 수정과 머지
npm ci && npm run build && sudo systemctl restart hiailab
```

---

## ❓ 자주 막히는 부분 → [docs/FAQ.md](./FAQ.md)
