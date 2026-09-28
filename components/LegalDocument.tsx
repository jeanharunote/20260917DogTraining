/** LegalDocument — 이용약관·개인정보처리방침·환불규정을 같은 모양으로 보여줍니다. */
import Link from "next/link";

import { EFFECTIVE_DATE, legalDocs, type LegalDoc } from "@/data/legal";
import { cn } from "@/lib/utils";

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <main id="main" className="min-h-screen bg-surface py-16 sm:py-24">
      <article className="mx-auto max-w-2xl px-5">
        <Link
          href="/"
          className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          ← 처음으로
        </Link>

        {/* 문서 사이 이동 */}
        <nav aria-label="약관 문서" className="mt-8 flex flex-wrap gap-2">
          {legalDocs.map((item) => (
            <Link
              key={item.slug}
              href={`/legal/${item.slug}`}
              aria-current={item.slug === doc.slug ? "page" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                item.slug === doc.slug
                  ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                  : "border-line text-ink-muted hover:text-ink",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <h1 className="font-display mt-8 text-3xl font-bold text-ink">{doc.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{doc.summary}</p>
        <p className="mt-2 text-xs text-ink-muted">시행일: {EFFECTIVE_DATE}</p>

        <div className="mt-10 flex flex-col gap-9">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-base text-ink">{section.heading}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {section.body.map((line) => (
                  <li key={line} className="text-pretty text-sm leading-[1.85] text-ink-muted">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
