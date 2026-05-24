# 🔑 키가 뭐고 왜 필요한가요?

> 비개발자를 위한 한 페이지 설명입니다.
> 자세한 발급 절차는 각 키 옆의 "자세히" 링크를 따라가세요.

---

## 한눈에 보기

HiaiLab은 **본인이 본인 계정으로** AI에 요청하고, **본인 메일로** 결과를 받는 도구입니다.
다른 회사 서비스(OpenAI · Gmail · 카카오)에게 "이건 나야"라고 증명해야 하니까, 각 회사가 발급해 주는 **신분증 같은 글자**가 필요합니다. 그게 "키" 입니다.

| 키 | 한 줄 설명 | 어디서 받나 | 없으면? | 자세히 |
| --- | --- | --- | --- | --- |
| 🛡️ **APP_ENCRYPTION_KEY** | 다른 키들을 디스크에 저장할 때 잠그는 자물쇠 | 본인이 직접 생성 (`openssl rand -base64 32`) | `/setup` 페이지에서 키 저장이 막힘 | [아래 1번](#1-app_encryption_key) |
| 🤖 **OPENAI_API_KEY** | AI에게 글을 만들어 달라고 요청할 권한 | <https://platform.openai.com/api-keys> | mock 결과(샘플)로 동작 | [SETUP_OPENAI.md](./SETUP_OPENAI.md) |
| 📧 **SMTP_PASS** (Gmail 앱 비밀번호) | 본인 Gmail로 메일을 대신 보낼 수 있는 권한 | <https://myaccount.google.com/apppasswords> | mock 전송 (실제 메일 안 감) | [SETUP_GMAIL.md](./SETUP_GMAIL.md) |
| 💬 **KAKAO_ACCESS_TOKEN** | 본인 카톡 "나와의 채팅"에 메시지 보낼 권한 | 카카오 개발자 콘솔 | mock 전송 (실제 카톡 안 감) | [SETUP_KAKAO.md](./SETUP_KAKAO.md) |

> 4개를 다 채워야 동작하는 게 아닙니다.
> **`APP_ENCRYPTION_KEY` 하나만 채워도** HiaiLab은 켜집니다. 나머지는 나중에 천천히 추가하세요.

---

## 0. 왜 본인이 본인 키를 채워야 하나요?

HiaiLab은 **self-hosted** (셀프 호스팅) 입니다. 즉:

- 코드는 만든 사람(저)이 제공하지만, **실제로 돌리는 컴퓨터는 본인 컴퓨터/서버**입니다.
- 본인이 입력한 글은 만든 사람의 서버를 거치지 않습니다. → 만든 사람은 본인 글을 볼 수 없습니다.
- 그래서 AI(OpenAI), 메일(Gmail), 카톡(Kakao) 서비스와의 **계약/요금도 전부 본인 계정으로** 처리되어야 합니다.
- 본인이 본인 계정 신분증(=키)을 들고 와야, 본인이 직접 사용하는 구조가 됩니다.

이게 자판기 회사가 아니라 **자판기 설계도만 주고, 본인이 가게에 직접 설치하는** 모델이라고 생각하시면 됩니다.

---

## 1. APP_ENCRYPTION_KEY

### 무엇인가요?
HiaiLab의 `/setup` 페이지에서 입력한 OpenAI 키, SMTP 비밀번호, 카카오 토큰을 **이 컴퓨터의 파일에 저장할 때 잠그는 자물쇠**입니다.

저장 파일은 `.hiailab/config.enc.json` 한 개인데, 그 안의 값들이 `APP_ENCRYPTION_KEY`로 잠겨 있어, 이 키가 없으면 파일을 훔쳐가도 못 읽습니다.

### 왜 필요한가요?
키들을 저장하지 않으면 매번 dev 서버 켤 때마다 다시 입력해야 합니다. 그렇다고 평문으로 저장하면 컴퓨터를 잠깐 빌려준 사람이나, 백업이 유출됐을 때 위험합니다. → 그래서 **암호화해서 저장하고, 잠금키만 환경변수로** 둡니다.

### 어떻게 만드나요?
**터미널 한 줄**로 만듭니다. 어디서 받는 게 아니라 본인이 직접 생성합니다.

**macOS / Linux**
```bash
openssl rand -base64 32
```

**Windows (PowerShell)**
```powershell
[Convert]::ToBase64String((1..32 | %{[byte](Get-Random -Max 256)}))
```

위 명령을 실행하면 아래와 같은 글자가 나옵니다:
```
Kj9HsLp2vN/8xQwE3+RtBmZ7fGcYaPdU4iVoWnHkXr0=
```

그 글자를 그대로 복사해서 `.env.local` 파일을 열고:

```env
APP_ENCRYPTION_KEY=Kj9HsLp2vN/8xQwE3+RtBmZ7fGcYaPdU4iVoWnHkXr0=
```

저장 → `npm run dev` 재시작.

### 어디에 쓰이나요?
- `/setup` 페이지에서 키를 저장할 때마다 → 암호화에 사용
- 저장된 키를 다시 읽을 때 → 복호화에 사용

### 주의
- **한 번 정했으면 절대 바꾸지 마세요.** 키가 바뀌면 이전에 저장한 OpenAI/SMTP/카카오 값들을 다 복호화 못 합니다. → `/setup`에서 처음부터 다시 입력해야 합니다.
- 이 키 + `.hiailab/` 폴더를 같이 가져가면 다른 키들이 다 풀립니다. **둘 다 GitHub에 절대 올리지 마세요.** (이미 `.gitignore`로 막혀 있음)

---

## 2. OPENAI_API_KEY

### 무엇인가요?
OpenAI(ChatGPT 만든 회사)에게 "이건 나야, 결제는 내 카드로"라고 알려주는 **API용 비밀번호**입니다.

### 왜 필요한가요?
자판기에서 [₩900으로 뽑기] 버튼을 누르면, HiaiLab이 OpenAI 서버에 "이런 답장 만들어줘" 라고 요청합니다. 그 요청에 본인 키가 붙어 있어야 OpenAI가 결과를 돌려주고, 본인 계정에 요금이 청구됩니다.

### 어디에 쓰이나요?
HiaiLab에서 **AI 결과를 진짜로 만들 때** 사용. 다른 데는 안 씁니다.

### 없으면?
**없어도 HiaiLab은 동작합니다.** 대신 mock(샘플) 결과로 나옵니다. 자판기 UI를 먼저 체험해보고 나중에 키를 발급해도 됩니다.

### 어떻게 받나요?
3분 가이드: [SETUP_OPENAI.md](./SETUP_OPENAI.md)

### 비용은?
- 답장 자판기 1회: 보통 **₩1 미만**
- 회의록 자판기 1회: 보통 **₩5 ~ ₩30**
- 카피 자판기 1회: 보통 **₩2 ~ ₩10**

> OpenAI 대시보드의 **Usage** 탭에서 정확한 사용량을 확인하실 수 있고, 월 한도(monthly cap)도 설정할 수 있습니다.

---

## 3. SMTP_PASS (Gmail 앱 비밀번호)

### 무엇인가요?
Gmail에서 발급해 주는 **"HiaiLab이 본인 Gmail로 메일을 대신 보낼 수 있도록 허용"하는 16자리 비밀번호**입니다.

⚠️ Gmail 로그인할 때 쓰는 평소 비밀번호와는 **다른 별도의 비밀번호** 입니다.
구글이 보안상 평문 비밀번호로 SMTP 접속을 막아둔 지 오래되어, 앱 비밀번호를 따로 발급받아야 합니다.

### 왜 필요한가요?
자판기에서 [✉️ 내 이메일로 보내기]를 누르면, HiaiLab이 Gmail SMTP 서버에 접속해서 "이 사람 메일 보내려고 해" 라고 요청합니다. 이때 본인이 맞다는 증명이 필요하고, 그 증명이 앱 비밀번호입니다.

### 어디에 쓰이나요?
이메일 전송 1건마다 Gmail SMTP에 접속할 때 사용. **OpenAI나 카카오와는 무관**합니다.

### 없으면?
mock 전송으로 동작 (실제 메일은 안 보내짐). UI에 노란색으로 "이메일 전송 완료 MOCK" 표시.

### 어떻게 받나요?
5분 가이드: [SETUP_GMAIL.md](./SETUP_GMAIL.md)

요약:
1. <https://myaccount.google.com/security> → **2단계 인증** 켜기
2. <https://myaccount.google.com/apppasswords> → "hiailab" 입력 → **만들기**
3. 화면에 한 번만 표시되는 16자리(예: `abcd efgh ijkl mnop`)를 복사

### 다른 메일 서비스
네이버 · Daum · Outlook도 됩니다. 호스트 주소만 다르게 적으면 돼요 → [SETUP_GMAIL.md](./SETUP_GMAIL.md) 의 표 참고.

---

## 4. KAKAO_ACCESS_TOKEN

### 무엇인가요?
카카오에게 "이건 나야, 내 카톡 나와의 채팅에 메시지 보내도 돼" 라고 허락받은 **임시 출입증**입니다.

### 왜 필요한가요?
자판기에서 [💬 카카오톡 나에게 보내기]를 누르면, HiaiLab이 카카오 API에 메시지 전송을 요청합니다. 이때 본인 계정에 메시지를 보내려면 본인이 직접 허락한 토큰이 필요합니다.

### 어디에 쓰이나요?
카카오톡 "나와의 채팅"에 메시지 보낼 때만 사용. 다른 사람 카톡, 카카오 채널 발송에는 **사용되지 않습니다(불가).**

### 없으면?
mock 전송으로 동작 (실제 카톡은 안 보내짐).

### 어떻게 받나요?
10분 가이드: [SETUP_KAKAO.md](./SETUP_KAKAO.md)

요약:
1. <https://developers.kakao.com/> 에서 앱 생성 (이름은 자유)
2. **카카오 로그인 → 동의항목**에서 **`talk_message`** 활성화
3. 콘솔의 **REST API 테스트** 도구로 본인 로그인 + 권한 동의 → 토큰 복사

### ⚠️ 토큰 유효기간
카카오 토큰은 **수 시간(보통 6~12시간) 후 만료**됩니다. 만료되면 자판기에서 카톡 보낼 때 에러가 뜨고, 그때 다시 발급받아 `/setup`에서 교체해주면 됩니다.
(자동 갱신은 다음 마일스톤 기능입니다.)

---

## 어디에 넣나요?

두 가지 방법이 있고, **둘 다 같은 결과**입니다.

### 방법 A — `/setup` 페이지 (가장 쉬움)

1. <http://localhost:3000/setup> 접속
2. 해당 칸에 키 붙여넣기 → **저장**
3. **연결 테스트** 버튼으로 잘 들어갔는지 확인

키는 즉시 AES-256-GCM으로 암호화되어 `.hiailab/config.enc.json`에 저장되고, 입력 칸은 자동으로 비워집니다. **다시 화면에 원문이 보이지 않습니다.**

### 방법 B — `.env.local` 파일에 직접

```env
APP_ENCRYPTION_KEY=...
OPENAI_API_KEY=sk-...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youraccount@gmail.com
SMTP_PASS=abcdefghijklmnop
DEFAULT_TO_EMAIL=youraccount@gmail.com
KAKAO_ACCESS_TOKEN=...
```

저장 후 `npm run dev` 재시작.

> 두 방법을 섞어 써도 됩니다. 같은 키가 양쪽에 다 있으면 **환경변수가 우선**합니다.

---

## ⚠️ 키 보안 — 절대 하지 말 것

- ❌ 키를 GitHub에 push (`.env.local`이 실수로 함께 커밋되지 않게 주의)
- ❌ 키를 카톡/슬랙/이메일로 공유
- ❌ 스크린샷에 키가 보이게 캡처해서 올리기
- ❌ 다른 사람에게 본인 키 빌려주기
- ❌ 코드 파일 안에 `const key = "sk-..."` 같은 식으로 하드코딩

### 만약 유출됐다면?
1. **즉시 해당 서비스에서 폐기/재발급**
   - OpenAI: <https://platform.openai.com/api-keys> → 해당 키 옆 **Revoke**
   - Gmail: <https://myaccount.google.com/apppasswords> → 해당 항목 **제거**
   - 카카오: 개발자 콘솔에서 앱 → **사용자 관리 → 연결 끊기**
2. 새 키 발급해서 `/setup`에 다시 저장
3. (Git 커밋된 경우) 커밋을 되돌리는 것만으로는 부족합니다. **반드시 1번 먼저** 하세요.

---

## 다음 단계

키 발급이 끝났다면 → [QUICKSTART.md](../QUICKSTART.md)의 6번 단계로 돌아가서 자판기 사용해보기.
