# ⚡ QUICKSTART — 10분 안에 HiaiLab 띄우기

비개발자도 따라할 수 있게 단계별로 적혀 있습니다.
회색 박스의 명령어를 그대로 복사해서 터미널에 붙여넣기만 하면 됩니다.

> README의 "[🚀 따라서 세팅해보기](./README.md#-따라서-세팅해보기-진짜-핵심-5단계)" 가 핵심 5단계 요약본이고, 이 문서는 **준비물부터 차근차근 풀어쓴 버전** 입니다.

---

## 0. 준비물

1. **컴퓨터** (macOS / Windows / Linux 어느 것이든 OK)
2. **Node.js 20 이상**
   - 다운로드: <https://nodejs.org/> → "LTS" 버튼
   - 설치 후 터미널에서 `node -v` 입력하면 `v20.x.x` 같은 글자가 나와야 정상
3. **터미널 / 명령 프롬프트**
   - macOS: `Cmd + Space` → "터미널" 입력
   - Windows: `시작 메뉴` → "PowerShell" 입력
4. **(선택) OpenAI API 키** — 없으면 mock 결과로 동작, 나중에 추가 가능

---

## 1. 코드 받기

### 방법 A — Git이 있는 경우

```bash
git clone https://github.com/sungpyo9053/hiailab.git
cd hiailab
```

### 방법 B — Git을 모르는 경우 (ZIP)

1. GitHub 저장소 페이지에서 우측 상단의 녹색 **`<> Code`** 버튼을 누릅니다.
2. **Download ZIP** 클릭 → 다운로드한 파일을 더블클릭해서 압축 해제.
3. 압축 푼 폴더를 원하는 위치(예: 바탕화면)로 옮깁니다.
4. 터미널에서 그 폴더로 이동:

```bash
cd ~/Desktop/hiailab-main         # macOS/Linux 예시
cd C:\Users\내이름\Desktop\hiailab-main   # Windows 예시
```

> 폴더 이름이 `hiailab-main` 처럼 `-main`이 붙어 있을 수 있습니다. 그대로 두셔도 됩니다.

---

## 2. 환경변수 파일 만들기

이 폴더 안의 **`.env.local.example`** 파일을 복사해서 **`.env.local`** 이라는 이름으로 저장합니다.

### macOS / Linux
```bash
cp .env.local.example .env.local
```

### Windows (PowerShell)
```powershell
copy .env.local.example .env.local
```

> `.env.local`은 점(`.`)으로 시작해서 macOS Finder에서는 기본 숨김입니다. `Cmd + Shift + .` 단축키로 숨김 파일을 보이게 할 수 있습니다.

### 최소 1줄만 채우면 됩니다 — `APP_ENCRYPTION_KEY`

`/setup` 페이지에서 저장한 값을 안전하게 암호화하는 자물쇠 키입니다.
**32자 이상의 아무 랜덤 문자열**이면 됩니다.

**자동 생성** (macOS / Linux):
```bash
openssl rand -base64 32
```

**Windows PowerShell**:
```powershell
[Convert]::ToBase64String((1..32 | %{[byte](Get-Random -Max 256)}))
```

위 명령을 실행하면 `Kj9HsLp...=` 같은 문자열이 나옵니다. 그것을 복사해서 `.env.local`을 열고 다음 줄을 찾아 등호 뒤에 붙여넣으세요.

```env
APP_ENCRYPTION_KEY=
```
→
```env
APP_ENCRYPTION_KEY=Kj9HsLp.....=
```

> OpenAI / Gmail / 카카오는 일단 비워둬도 됩니다. 나중에 브라우저의 `/setup` 페이지에서 채우면 됩니다.

---

## 3. 패키지 설치

```bash
npm install
```

(1~3분 걸립니다.)

---

## 4. 실행

```bash
npm run dev
```

다음과 같은 줄이 보이면 성공입니다.
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
✓ Ready in 2.1s
```

---

## 5. 브라우저 접속

<http://localhost:3000>

처음에는 상단 배지가 모두 노란색(**AI MOCK · 이메일 MOCK · 카카오 MOCK**)입니다.
이 상태에서도 답장 에이전트는 **MOCK 결과**로 끝까지 동작합니다. 한번 눌러서 분위기 보세요.

---

## 6. `/setup` 페이지에서 실제 키 연결

상단 우측의 **🛠️ 설정** 버튼을 누르거나 직접 <http://localhost:3000/setup> 으로 가세요.

### 6-1. OpenAI 키 저장
1. `OPENAI_API_KEY` 칸에 `sk-...` 로 시작하는 키 붙여넣기
2. **저장** 클릭 → 위쪽 배지가 `AI REAL` 로 바뀜
3. **연결 테스트** 클릭 → `✓ OpenAI 연결 OK`

키 발급법 → [docs/SETUP_OPENAI.md](./docs/SETUP_OPENAI.md)

### 6-2. Gmail SMTP 저장
1. [docs/SETUP_GMAIL.md](./docs/SETUP_GMAIL.md) 의 "앱 비밀번호 발급" 5분 가이드 보기
2. 5개 칸을 모두 채우고 **저장**
3. **연결 테스트** → 본인 메일함에 테스트 메일 도착하면 성공

### 6-3. (선택) 카카오톡 토큰 저장
정확한 클릭 순서: [docs/SETUP_KAKAO.md](./docs/SETUP_KAKAO.md)

---

## 7. 첫 번째 답장 만들어보기

1. 메인으로 돌아가서 **`✉️ 답장 만들러 가기`** 클릭
2. textarea에 받은 메일 본문 붙여넣기 (placeholder의 예시를 살짝 고쳐 써도 OK)
3. **`✉️ AI에게 부탁하기`** 클릭
4. 결과 확인 (5종 답장이 한 번에 나옵니다)
5. **`✉️ 내 이메일로 보내기`** → 받을 메일 주소 입력 → **보내기**
6. 메일함 확인 → 결과 도착!

---

## 끝났습니다 🎉

이제 본인 메일에 맞게 HiaiLab을 사용하시거나, **[개인 서버에 올리기](./docs/DEPLOY_SERVER.md)** 가이드로 넘어가세요.

문제가 생기면 → [docs/FAQ.md](./docs/FAQ.md)
