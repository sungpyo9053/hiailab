# ✉️ HiaiLab

> **받은 메일을 정중한 답장으로 바꿔주는 셀프호스팅 AI 에이전트.**
> GitHub에서 코드 받아 본인 컴퓨터/서버에 올리고, 본인 OpenAI · Gmail 키만 넣으면 그 자리에서 동작합니다.
> 입력한 메일은 **만든 사람의 서버를 거치지 않습니다.** 본인 계정 안에서만 처리됩니다.

> 🎬 **유튜브 가이드 영상**: _(영상 업로드 후 링크 교체)_

---

## ✅ 필요 준비물 (시작 전 체크)

| | 항목 | 어디서 | 없으면? |
| --- | --- | --- | --- |
| 1 | **컴퓨터** (macOS / Windows / Linux) | — | 필수 |
| 2 | **Node.js 20 이상** | <https://nodejs.org/> → LTS | 필수 |
| 3 | **터미널** (macOS 터미널 / Windows PowerShell) | OS 기본 제공 | 필수 |
| 4 | **OpenAI API 키** | <https://platform.openai.com/api-keys> | 없어도 OK (MOCK 답장으로 동작) |
| 5 | **Gmail 앱 비밀번호** (메일 전송용) | <https://myaccount.google.com/apppasswords> | 없어도 OK (MOCK 전송으로 동작) |
| 6 | **(선택) 카카오 access token** | 카카오 개발자 콘솔 | 없어도 OK |

> 4 · 5 · 6은 지금 없어도 됩니다. 일단 띄워보고 나중에 `/setup` 화면에서 채우면 됩니다.
> 받는 법은 → [docs/KEYS.md](./docs/KEYS.md) 한 페이지에 정리되어 있습니다.

---

## 🚀 따라서 세팅해보기 (진짜 핵심 5단계)

영상에서 보면서 그대로 복사해 붙여넣기만 하면 됩니다.

### 1️⃣ 코드 받기
```bash
git clone https://github.com/sungpyo9053/hiailab.git
cd hiailab
```

### 2️⃣ 환경변수 파일 만들기 + 자물쇠 키 1줄 채우기
```bash
cp .env.local.example .env.local
```
그 다음 터미널에서:
```bash
openssl rand -base64 32
```
→ 나오는 글자(예: `Kj9HsLp.....=`)를 복사해서, 텍스트 에디터로 `.env.local`을 열고:
```env
APP_ENCRYPTION_KEY=Kj9HsLp.....=
```
> Windows는 PowerShell에서 `[Convert]::ToBase64String((1..32 | %{[byte](Get-Random -Max 256)}))`

### 3️⃣ 설치 + 실행
```bash
npm install
npm run dev
```
→ `Ready in ...` 메시지가 보이면 성공.

### 4️⃣ 브라우저에서 키 연결
<http://localhost:3000/setup> 접속 → OpenAI 키 / Gmail SMTP / (선택) 카카오 토큰 입력 → **저장** + **연결 테스트** 클릭

### 5️⃣ 받은 메일에 답장 만들기
<http://localhost:3000> 으로 가서 → 받은 메일 본문 붙여넣기 → **`✉️ AI에게 부탁하기`** → 결과 확인 → **`✉️ 내 이메일로 보내기`** 로 본인 메일함에 전송

끝 🎉

---

## 📖 더 자세히

| 막히는 부분 | 가이드 |
| --- | --- |
| 키가 뭐고 왜 필요한가요? | [docs/KEYS.md](./docs/KEYS.md) |
| OpenAI 키 발급 | [docs/SETUP_OPENAI.md](./docs/SETUP_OPENAI.md) |
| Gmail 앱 비밀번호 발급 | [docs/SETUP_GMAIL.md](./docs/SETUP_GMAIL.md) |
| 카카오 토큰 발급 | [docs/SETUP_KAKAO.md](./docs/SETUP_KAKAO.md) |
| 내 컴퓨터에서 실행 (npm/Docker) | [docs/DEPLOY_LOCAL.md](./docs/DEPLOY_LOCAL.md) |
| 개인 서버(VPS)에 올리기 | [docs/DEPLOY_SERVER.md](./docs/DEPLOY_SERVER.md) |
| 자주 묻는 질문 | [docs/FAQ.md](./docs/FAQ.md) |
| 10분 셋업 풀버전 | [QUICKSTART.md](./QUICKSTART.md) |

---

## 🤖 어떤 서비스인가요?

HiaiLab의 메인 기능은 **메일 답장 에이전트**입니다.

1. 받은 메일을 textarea에 붙여넣고
2. **`AI에게 부탁하기`** 한 번 누르면
3. AI가 다음 5종 답장을 한 번에 만들어줍니다:
   - 상황 요약
   - 답장 초안
   - 더 정중한 버전
   - 짧은 버전
   - 피해야 할 표현
4. 결과를 그대로 **본인 이메일** 또는 **본인 카카오톡 '나와의 채팅'** 으로 받을 수 있습니다.

### 그외 보너스 기능
- 📝 **회의록 정리** — 회의 메모 붙여넣으면 요약·결정사항·담당자별 할 일로 분해
- 🛍️ **상품 카피** — 상품 정보로 광고/상세페이지/긴 설득 카피 3종

메인은 답장이고, 위 둘은 같은 엔진을 다르게 쓴 보너스입니다.

---

## 🔐 보안 / 개인정보

이 서비스는 **셀프호스팅** 입니다. 즉:

- 입력한 모든 글은 **본인 컴퓨터/서버 안에서만** 처리됩니다.
- 만든 사람(저)의 서버를 거치지 않습니다. 만든 사람은 본인이 무엇을 입력했는지 볼 수 없습니다.
- AI 호출은 본인의 OpenAI 계정으로 직접 가고, 메일 발송은 본인의 Gmail 계정으로 직접 갑니다.
- `/setup`에서 저장한 키는 **이 컴퓨터의 `.hiailab/config.enc.json`** 에 AES-256-GCM으로 암호화 저장됩니다.

### ⚠️ 절대 하지 말 것
- 실제 API 키를 **GitHub에 push** 하지 마세요. (`.env.local`이 실수로 함께 커밋되지 않게 — 이미 `.gitignore`로 막혀 있긴 합니다)
- 키를 카톡/슬랙/이메일로 공유하지 마세요.
- 스크린샷에 키가 보이게 캡처하지 마세요.

유출되면 즉시 OpenAI/Gmail/카카오에서 해당 키를 **폐기 후 재발급**하세요.

---

현재 한계와 자주 묻는 질문은 → [docs/FAQ.md](./docs/FAQ.md)
