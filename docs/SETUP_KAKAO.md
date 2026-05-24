# 💬 카카오톡 "나에게 보내기" 설정하기

자판기 결과를 본인 카카오톡 "나와의 채팅"으로 받는 기능입니다.

> ⚠️ 현재는 **본인의 카톡으로만** 보낼 수 있습니다.
> 친구/고객 발송은 카카오 검수가 별도로 필요해 이번 POC 범위에 포함되지 않았습니다.

---

## 카카오톡 채널 발송과의 차이

| 구분 | 본 가이드 (나에게 보내기) | 카카오 채널 고객 발송 |
| --- | --- | --- |
| 수신자 | **본인만** | 채널 친구한 사용자 |
| 검수 | 불필요 | 카카오 비즈메시지 검수 필수 |
| 비용 | 무료 | 건당 과금 |
| 이번 POC | ✅ 지원 | ❌ 지원 안 함 |

---

## 1. 카카오 개발자 콘솔 준비 (10분)

1. <https://developers.kakao.com/> 접속 → 카카오 계정으로 로그인
2. 상단 **내 애플리케이션** → **애플리케이션 추가하기**
   - 앱 이름: `오토벤딩` (자유)
   - 회사명: 본인 이름 또는 아무거나
3. 생성된 앱 클릭 → 좌측 **앱 설정 → 일반** 에서 `REST API 키` 메모해두기
   - 예: `abc123def456...`
4. 좌측 **앱 설정 → 플랫폼** → **Web 플랫폼 등록**
   - 사이트 도메인: `http://localhost:3000`
5. 좌측 **제품 설정 → 카카오 로그인** 활성화 (ON)
6. **카카오 로그인 → Redirect URI 등록**
   - `http://localhost:3000/oauth/kakao/callback` 입력 (실제로 호출은 하지 않지만 등록은 필요)
7. **카카오 로그인 → 동의항목** → **카카오톡 메시지 전송 (`talk_message`)** 을 "선택 동의" 또는 "필수 동의" 로 활성화

---

## 2. Access Token 발급 (방법 A: 콘솔의 테스트 도구)

가장 쉬운 방법입니다.

1. 카카오 개발자 콘솔 → 좌측 하단 **도구 → REST API 테스트**
2. 우측 상단 **권한 가져오기** → `talk_message` 체크 → **카카오 계정으로 로그인 후 권한 동의**
3. 화면에 표시되는 `Authorization: Bearer xxxxxxxx` 의 `xxxxxxxx` 부분이 **access token** 입니다. 복사.

---

## 2. Access Token 발급 (방법 B: 직접 OAuth URL)

콘솔 테스트 도구가 안 보이거나, 직접 발급을 원할 때.

### 2-1. 인가 코드 받기

브라우저 주소창에 아래 URL을 입력합니다. `{REST_API_KEY}` 자리에는 1번에서 메모한 값을 넣습니다.

```
https://kauth.kakao.com/oauth/authorize?client_id={REST_API_KEY}&redirect_uri=http://localhost:3000/oauth/kakao/callback&response_type=code&scope=talk_message
```

카카오 로그인 + 동의 → 주소창이 `http://localhost:3000/oauth/kakao/callback?code=ABCDEFG...` 로 바뀝니다. (페이지는 "찾을 수 없음"이 떠도 정상)
주소창의 `code=` 뒤 값을 복사합니다.

### 2-2. 토큰 교환

터미널에서 (`{REST_API_KEY}`, `{code}` 자리만 본인 값으로):

```bash
curl -X POST "https://kauth.kakao.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "client_id={REST_API_KEY}" \
  -d "redirect_uri=http://localhost:3000/oauth/kakao/callback" \
  -d "code={code}"
```

응답 JSON 의 `"access_token": "xxxxxxxx"` 값이 우리가 쓸 토큰입니다.

---

## 3. 오토벤딩에 토큰 저장

### `/setup` 페이지에서

<http://localhost:3000/setup> → "3) 카카오톡 나에게 보내기 설정"
→ 칸에 토큰 붙여넣고 **저장** → 배지가 `카카오 REAL` (초록) 로 바뀜
→ **연결 테스트 (메시지 1건 발송)** 클릭

본인 카톡 "나와의 채팅" 에 **`[오토벤딩] 카카오 연결 테스트`** 메시지가 도착하면 성공입니다.

### `.env.local` 에 직접

```env
KAKAO_ACCESS_TOKEN=여기에_복사한_토큰
```

저장 후 dev 서버 재시작.

---

## ⚠️ 토큰 유효기간

카카오 user access token은 **보통 수 시간(약 6~12시간)** 후 만료됩니다.
만료되면 자판기에서 카카오 보내기를 시도할 때:

```
카카오 전송 실패 (status 401): expired access token — 액세스 토큰이 만료되었을 수 있습니다. 다시 발급 후 저장하세요.
```

이런 메시지가 나옵니다. 위 2번 과정을 반복해서 새 토큰을 받아 저장하면 됩니다.

> 자동 갱신(refresh token 처리)은 다음 마일스톤에서 구현 예정입니다.

---

## 보안 체크

- 토큰은 본인 카카오 계정에 접근할 수 있는 비밀값입니다. **GitHub/카톡/메일에 절대 노출 금지.**
- `/setup` 으로 저장하면 `.autovending/config.enc.json` 에 AES-256-GCM 암호화로 저장됩니다.
- 유출이 의심되면 카카오 콘솔 → 본인 앱 → **사용자 관리 → 연결 끊기** 로 즉시 무효화 후 재발급.

---

문제가 있으면 → [docs/FAQ.md](./FAQ.md)
