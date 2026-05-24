import "server-only";
import { getAppMode, getOwnerEmail, isAdmin } from "./mode";
import { readSession } from "./session";

// "현재 요청 사용자" 결정.
// - self 모드: 무조건 _self 라는 가상 사용자 (단일 사용자 호환).
// - saas 모드: cookie 세션의 email. 없으면 null (로그인 안 됨).

export type CurrentUser = {
  id: string;       // storage key (saas: email, self: "_self")
  email: string | null; // 표시용 이메일 (self 에서 OWNER_EMAIL 있으면 그 값)
  role: "admin" | "user";
  mode: "self" | "saas";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const mode = getAppMode();

  if (mode === "self") {
    // self 모드는 항상 단일 사용자. OWNER_EMAIL 이 있으면 admin, 없어도 admin 처럼 동작.
    const owner = getOwnerEmail();
    return {
      id: "_self",
      email: owner,
      role: "admin",
      mode: "self",
    };
  }

  // saas 모드 — cookie 세션 필수
  const session = await readSession();
  if (!session) return null;

  return {
    id: session.email,
    email: session.email,
    role: isAdmin(session.email) ? "admin" : "user",
    mode: "saas",
  };
}

// API 라우트 보호: 로그인 안 된 saas 사용자는 401.
// self 모드는 항상 통과.
export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) {
    throw new HttpError(401, "로그인이 필요합니다.");
  }
  return u;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const u = await requireUser();
  if (u.role !== "admin") {
    throw new HttpError(403, "관리자 권한이 필요합니다.");
  }
  return u;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
