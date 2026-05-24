import CatalogClient from "./CatalogClient";
import MainHeader from "./MainHeader";

// 메인 = 인증 분기 + 에이전트 카탈로그 (CatalogClient 내부에서 자동 처리)
export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <MainHeader />
      <CatalogClient />
      <footer className="mt-10 border-t border-white/10 pt-5 text-xs text-white/40">
        ※ 입력한 키와 메일 내용은 만든 사람 서버를 거치지 않고 본인 계정 안에서만 처리됩니다.
        답장은 자동 발송되지 않고 임시보관함까지만 들어갑니다.
      </footer>
    </main>
  );
}
