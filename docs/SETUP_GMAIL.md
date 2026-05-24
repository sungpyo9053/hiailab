# 📧 Gmail / SMTP 이메일 전송 설정하기

자판기 결과를 **내 이메일로 받기** 위한 설정입니다.

> 이 가이드는 두 가지로 나뉩니다.
> - 🟢 **쉬운 모드 (현재 POC가 지원)**: Gmail "앱 비밀번호" 로 SMTP 발송
> - 🟡 **고급 모드 (다음 단계 예정)**: Gmail OAuth 로 받은편지함 읽기 + 임시보관함 초안 생성

지금은 쉬운 모드만 따라 하시면 됩니다.

---

## ⚠️ 절대 하지 마세요

Gmail **계정 비밀번호**(평소 로그인할 때 쓰는 그 비밀번호)는 SMTP에 사용할 수 없습니다.
구글이 막아둔 지 오래되었습니다.

대신 **"앱 비밀번호"** 라는 별도의 16자리 비밀번호를 발급받아야 합니다.

---

## 🟢 쉬운 모드 — Gmail 앱 비밀번호로 SMTP 발송

### 1. 2단계 인증 켜기 (앱 비밀번호 발급 조건)

1. <https://myaccount.google.com/security> 접속
2. **2단계 인증** → **사용** 으로 켜기
3. 휴대전화로 인증 (1분)

> 회사 계정(Google Workspace)은 관리자 정책에 따라 앱 비밀번호 발급이 막혀 있을 수 있습니다. 그 경우 개인 Gmail로 우회하거나, 회사 IT에 SMTP 릴레이를 요청하세요.

### 2. 앱 비밀번호 발급

1. <https://myaccount.google.com/apppasswords> 접속
2. 이름 칸에 `autovending` 입력 → **만들기**
3. 16자리 비밀번호가 노란색 박스에 표시됩니다 (예: `abcd efgh ijkl mnop`)
4. **그 자리에서 복사** 하세요. 창을 닫으면 다시 볼 수 없습니다.

> 공백은 무시해도 됩니다. `abcdefghijklmnop` 처럼 붙여 쓰셔도 동작합니다.

### 3. 오토벤딩에 입력

#### 방법 A — `/setup` 페이지에서

<http://localhost:3000/setup> → "2) SMTP 이메일 설정"

| 칸 | 값 |
| --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | 본인의 Gmail 주소 (예: `myname@gmail.com`) |
| `SMTP_PASS` | 위에서 받은 16자리 앱 비밀번호 |
| `DEFAULT_TO_EMAIL` | 본인 메일 주소 (테스트용으로 동일하게 둬도 됨) |

**저장** → 위쪽 배지가 `이메일 REAL` 로 바뀜 → **연결 테스트 (메일 1통 발송)** 클릭.

본인 메일함에 **`[오토벤딩] SMTP 연결 테스트`** 라는 제목의 메일이 도착하면 성공입니다.

#### 방법 B — `.env.local` 에 직접

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myname@gmail.com
SMTP_PASS=abcdefghijklmnop
DEFAULT_TO_EMAIL=myname@gmail.com
```

저장 후 dev 서버 재시작.

---

## 다른 메일 서비스 (네이버, Daum, Outlook 등)

기본 원리는 같습니다. 각 서비스의 SMTP 호스트만 다르게 적으면 됩니다.

| 서비스 | SMTP_HOST | SMTP_PORT | 비고 |
| --- | --- | --- | --- |
| Gmail | `smtp.gmail.com` | `587` | 앱 비밀번호 필수 |
| 네이버 | `smtp.naver.com` | `587` | "POP3/SMTP 사용" 메뉴에서 활성화 + 발급 비밀번호 사용 |
| Daum | `smtp.daum.net` | `465` | secure=true (port 465) |
| Outlook/Hotmail | `smtp-mail.outlook.com` | `587` | 앱 비밀번호 권장 |

---

## 자주 나오는 에러

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `Invalid login: 535-5.7.8 Username and Password not accepted` | 계정 비밀번호를 그대로 넣음 | 앱 비밀번호로 교체 |
| `Connection timeout` | 회사 네트워크가 SMTP 차단 | 핫스팟/집 네트워크에서 시도 |
| `Greeting never received` | 포트가 막힘 | 587 ↔ 465 바꿔서 시도 |

---

## 🟡 고급 모드 — Gmail 자동 읽기 / 초안 생성 (다음 단계 예정)

현재 POC 범위에 **포함되지 않았습니다**. 다음 마일스톤에서 구현될 예정입니다.

추가될 기능:
- Gmail OAuth 로 본인 계정 안전하게 연결
- **받은편지함을 읽음 처리하지 않고** 새 메일을 분석
- 답장 초안을 **임시보관함(Drafts)** 에 자동 작성
- 최종 발송은 본인이 직접 (자동 발송 금지)

> 이 기능이 들어와도 메일 원문은 DB에 저장되지 않고, 분석 후 즉시 폐기되도록 설계됩니다.

---

## 보안 체크

- 앱 비밀번호는 **이 컴퓨터의 `.autovending/config.enc.json`** 에 AES-256-GCM 암호화되어 저장됩니다.
- `.env.local` 도 `.gitignore` 에 등록되어 있어 GitHub로 새지 않습니다.
- 앱 비밀번호가 유출됐다고 판단되면, <https://myaccount.google.com/apppasswords> 에서 해당 항목을 **제거** 후 새로 발급하세요.

---

문제가 있으면 → [docs/FAQ.md](./FAQ.md)
