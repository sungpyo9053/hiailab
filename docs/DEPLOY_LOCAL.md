# 🏠 내 컴퓨터에서 실행하기 (로컬)

HI AI LAB을 본인 컴퓨터에서 돌리는 가장 간단한 방법입니다.

> 처음이라면 → [QUICKSTART.md](../QUICKSTART.md) 먼저 보세요.

---

## 방법 1 — npm (개발 모드, 변경 자동 반영)

매일 코드를 만지면서 쓸 분에게 추천.

```bash
# 1. 패키지 설치 (최초 1회)
npm install

# 2. 실행
npm run dev
```

- 주소: <http://localhost:3000>
- 코드를 수정하면 브라우저가 자동 새로고침됩니다.

### 종료
터미널에서 `Ctrl + C`.

---

## 방법 2 — npm (운영 모드, 빠름)

자판기를 그냥 쓰기만 할 분에게 추천. 최적화된 빌드라 더 빠릅니다.

```bash
# 1. 패키지 설치 (최초 1회)
npm install

# 2. 빌드 (최초 1회 또는 코드 변경 시)
npm run build

# 3. 실행
npm start
```

- 주소: <http://localhost:3000>
- 코드 변경이 자동 반영되지 않으므로, 수정하면 `npm run build` 다시.

---

## 방법 3 — Docker Compose (가장 깔끔)

Node.js를 직접 설치하지 않고 컨테이너로 격리해서 돌리는 방법입니다.
**Docker Desktop**(<https://www.docker.com/products/docker-desktop>)이 미리 설치되어 있어야 합니다.

```bash
# 1. .env.local 준비 (QUICKSTART 의 2번 단계 참고)
cp .env.local.example .env.local
# .env.local 열어서 APP_ENCRYPTION_KEY 채우기

# 2. 빌드 + 실행 (백그라운드)
docker compose up -d --build
```

- 주소: <http://localhost:3000>
- 로그 보기: `docker compose logs -f`
- 중지: `docker compose down`

`/setup` 에서 저장한 값은 호스트의 **`./.hiailab/` 폴더**에 영구 보관됩니다.
(컨테이너를 지워도 설정은 남습니다.)

---

## `.env.local` 을 수정했어요. 재시작이 필요한가요?

| 실행 방법 | 재시작 필요? | 명령 |
| --- | --- | --- |
| `npm run dev` | ✅ 필요 | `Ctrl + C` → `npm run dev` 다시 |
| `npm start` | ✅ 필요 | `Ctrl + C` → `npm start` 다시 |
| `docker compose` | ✅ 필요 | `docker compose restart` |

> `/setup` 페이지에서 저장한 값은 재시작 없이 즉시 반영됩니다.
> 환경변수(`.env.local`)는 프로세스 시작 시점에만 읽기 때문에 재시작이 필요합니다.

---

## 포트(3000)가 이미 사용 중이라고 나옵니다

다른 포트로 실행:

```bash
# npm
PORT=4000 npm run dev

# docker compose (docker-compose.yml 의 "3000:3000" 을 "4000:3000" 으로 변경 후)
docker compose up -d
```

---

## 다른 사람도 접속하게 하려면?

같은 와이파이 안에서만 접속하게 하는 경우:

```bash
# 본인 컴퓨터 IP 확인
ipconfig getifaddr en0   # macOS
hostname -I              # Linux
ipconfig                 # Windows
```

확인된 IP가 예를 들어 `192.168.0.10` 이면, 같은 와이파이의 다른 기기에서 <http://192.168.0.10:3000> 으로 접속 가능합니다.

> 인터넷 어디서나 접속하게 하려면 → [DEPLOY_SERVER.md](./DEPLOY_SERVER.md)

---

문제가 있으면 → [docs/FAQ.md](./FAQ.md)
