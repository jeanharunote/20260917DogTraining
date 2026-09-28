/** /legal/terms · /legal/privacy · /legal/refund — 법적 고지 문서 페이지입니다. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocument } from "@/components/LegalDocument";
import { challengeInfo } from "@/data/challenge";
import { legalDocs } from "@/data/legal";

type Params = { slug: string };

/** 세 문서 모두 미리 만들어 둡니다. (정적 페이지) */
export function generateStaticParams(): Params[] {
  return legalDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = legalDocs.find((item) => item.slug === slug);

  return { title: doc ? `${doc.title} | ${challengeInfo.brandName}` : challengeInfo.brandName };
}

export default async function LegalPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = legalDocs.find((item) => item.slug === slug);

  if (!doc) notFound();

  return <LegalDocument doc={doc} />;
}
