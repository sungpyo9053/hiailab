import Link from "next/link";
import { notFound } from "next/navigation";
import { findGenerator } from "@/lib/generators";
import GeneratorClient from "./GeneratorClient";

// 서버 컴포넌트 — lib/prompts.ts 는 절대 import 하지 않는다.
// 클라이언트로 내려가는 props 에 system prompt 등 비밀 정보를 절대 포함하지 않는다.
export default async function GeneratorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = findGenerator(slug);
  if (!meta) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-white/50 hover:text-white">
          ← 메뉴로
        </Link>
      </nav>

      <header className="mb-8">
        <div className="text-5xl">{meta.emoji}</div>
        <h1 className="mt-2 text-3xl font-bold">{meta.name}</h1>
        <p className="mt-2 text-sm text-white/60">{meta.description}</p>
      </header>

      {/* 메타데이터(id, label, placeholder) 만 클라이언트로 전달. prompt 원문은 절대 X */}
      <GeneratorClient
        generatorId={meta.id}
        generatorName={meta.name}
        inputLabel={meta.inputLabel}
        placeholder={meta.placeholder}
      />
    </main>
  );
}
