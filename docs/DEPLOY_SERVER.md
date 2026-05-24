# 🖥️ 개인 서버에 올리기 (Docker)

오토벤딩을 본인의 VPS / 라즈베리파이 / 회사 안 서버 등에 올려서, 인터넷 어디서나 본인이 사용하는 방법입니다.

> 비전공자도 따라할 수 있도록 단계별로 풀어 적었습니다. 막히면 [FAQ](./FAQ.md) 참고.

---

## 0. 준비물

1. **서버 1대** — 다음 중 어느 것이든 OK
   - AWS Lightsail, Vultr, Linode, Hetzner 등 VPS (월 ~₩7,000)
   - 집에 있는 라즈베리파이 / 미니 PC
   - 회사 내 리눅스 서버
2. 서버에 **SSH 접속할 수 있어야 합니다**
   - 보통 호스팅 업체가 메일로 IP + 비밀번호 또는 SSH 키를 줍니다
3. 서버 OS는 **Ubuntu 22.04 LTS** 권장 (이 가이드의 명령어 기준)

---

## 1. 서버에 접속

본인 컴퓨터의 터미널에서:

```bash
ssh ubuntu@123.45.67.89
```

(`ubuntu` 는 계정명, `123.45.67.89` 는 서버 IP. 호스팅 업체에서 받은 값으로 교체)

---

## 2. Docker 설치 (한 번만)

서버 안에서 (즉, ssh 로 들어간 상태에서):

```bash
# Docker 공식 설치 스크립트
curl -fsSL https://get.docker.com | sudo sh

# 본인 계정에 docker 그룹 추가 → 매번 sudo 안 써도 됨
sudo usermod -aG docker $USER

# 변경사항 적용을 위해 일단 ssh 끊고 다시 접속
exit
ssh ubuntu@123.45.67.89

# 확인
docker --version
docker compose version
```

---

## 3. 오토벤딩 코드 받기

서버 안에서:

```bash
# Git 설치 (보통 이미 있음)
sudo apt update && sudo apt install -y git

# 코드 받기
git clone https://github.com/sungpyo9053/autovending.git
cd autovending
```

---

## 4. `.env.local` 만들기

서버 안에서:

```bash
cp .env.local.example .env.local
nano .env.local       # 또는 vim
```

최소 1줄 — `APP_ENCRYPTION_KEY` 만 채우면 됩니다.

```env
APP_ENCRYPTION_KEY=<32바이트 이상 랜덤 문자열>
```

자동 생성 (다른 터미널에서):

```bash
openssl rand -base64 32
```

> 나머지 키(OpenAI / SMTP / Kakao)는 일단 비워두고, 나중에 브라우저의 `/setup` 페이지에서 채우면 됩니다.

`nano` 에서 저장하는 법: `Ctrl + O` → `Enter` → `Ctrl + X`

---

## 5. 빌드 + 실행

```bash
docker compose up -d --build
```

- `-d` 는 백그라운드 실행
- 처음에는 빌드에 3~5분 걸립니다

확인:

```bash
docker compose ps             # 컨테이너 떠 있는지
docker compose logs -f        # 로그 보기 (Ctrl+C로 빠져나옴)
```

`▲ Next.js 15.x.x` 와 `Ready in ...` 가 보이면 성공입니다.

---

## 6. 브라우저에서 접속

서버 IP + 3000 포트:

```
http://123.45.67.89:3000
```

→ 메인 페이지가 보이면 성공.

> **포트 3000이 안 열린다면**: VPS 보안 그룹/방화벽에서 3000 TCP 인바운드를 허용해야 합니다. 호스팅 업체 콘솔에서 설정하세요. (AWS Lightsail의 경우 인스턴스 → Networking → IPv4 Firewall)

---

## 7. `/setup` 에서 키 채우기

<http://123.45.67.89:3000/setup>

QUICKSTART 의 6번 단계와 동일합니다.

---

## (선택) 8. 도메인 + HTTPS 붙이기

오토벤딩을 본인의 도메인 (예: `vending.mysite.com`) 으로 띄우고 싶다면 nginx + Caddy + Traefik 같은 리버스 프록시를 앞단에 두는 것이 일반적입니다.

**가장 쉬운 방법은 Caddy** 입니다 (자동 HTTPS).

```bash
# Caddy 설치
sudo apt install -y caddy

# /etc/caddy/Caddyfile 편집
sudo nano /etc/caddy/Caddyfile
```

내용:

```
vending.mysite.com {
    reverse_proxy localhost:3000
}
```

저장 후 재시작:

```bash
sudo systemctl restart caddy
```

도메인의 DNS A 레코드를 서버 IP로 미리 설정해 두면, Caddy가 자동으로 Let's Encrypt 인증서를 받아 HTTPS로 띄워줍니다.

---

## (선택) 9. 자동 재시작 / 자동 업데이트

### 서버 재부팅 시 자동 시작

`docker-compose.yml` 의 `restart: unless-stopped` 가 이미 설정되어 있어, 서버를 재부팅해도 자동으로 다시 뜹니다.

### 코드 업데이트하기

서버 안에서:

```bash
cd ~/autovending
git pull
docker compose up -d --build
```

---

## 안전 점검 체크리스트

- [ ] `.env.local` 이 GitHub 에 올라가지 않았는지 확인 (있으면 즉시 키 폐기/재발급)
- [ ] `.autovending/` 폴더가 GitHub 에 올라가지 않았는지 확인
- [ ] 서버 SSH 비밀번호 대신 SSH 키 인증 사용 권장
- [ ] 본인만 사용한다면 인증 없이 띄워도 되지만, 다른 사람과 공유한다면 Caddy basic auth 등 추가 권장
- [ ] OpenAI 사용량 알림(monthly cap)을 OpenAI 대시보드에서 설정

---

## 자주 묻는 질문

→ [docs/FAQ.md](./FAQ.md)
