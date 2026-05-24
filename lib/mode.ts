import "server-only";

// HI AI LAB은 두 가지 운영 모드를 지원한다.
//
// - self  (기본) : 단일 사용자. .hiailab/ 폴더에 OWNER 본인 데이터만.
//                 셀프호스팅, 개인 서버 등.
// - saas        : 다중 사용자. Gmail OAuth 로 가입한 모든 사용자가 본인 계정으로 사용.
//                 .hiailab/users/<email>/ 에 사용자별 데이터.
//                 OWNER_EMAIL 은 관리자(admin) 가 됨.
//
// 환경변수: HIAILAB_MODE=saas|self  (없으면 self)

export type AppMode = "self" | "saas";

export function getAppMode(): AppMode {
  const v = (process.env.HIAILAB_MODE || "").trim().toLowerCase();
  return v === "saas" ? "saas" : "self";
}

export function isSaaS(): boolean {
  return getAppMode() === "saas";
}

export function isSelfHost(): boolean {
  return getAppMode() === "self";
}

// 어드민 이메일 (env OWNER_EMAIL)
export function getOwnerEmail(): string | null {
  const v = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
  return v || null;
}

export function isAdmin(email: string | null | undefined): boolean {
  const owner = getOwnerEmail();
  if (!owner || !email) return false;
  return email.toLowerCase() === owner;
}
