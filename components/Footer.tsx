/**
 * Footer — 문의처, SNS 링크, 저작권 표시.
 * 연락처/링크 수정은 data/challenge.ts 의 `footer` 를 편집하세요.
 */
import Link from "next/link";

import { challengeInfo, footer } from "@/data/challenge";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface pb-28 pt-16 sm:pb-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex max-w-sm flex-col gap-3">
            <p className="text-lg font-bold text-ink">{challengeInfo.brandName}</p>
            <p className="text-pretty text-sm leading-relaxed text-ink-muted">{footer.tagline}</p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-ink">문의</h2>
            <p className="text-sm text-ink-muted">
              {footer.contact.emailLabel}{" "}
              <a
                href={`mailto:${footer.contact.email}`}
                className="font-medium text-brand-600 underline-offset-4 hover:underline dark:text-brand-400"
              >
                {footer.contact.email}
              </a>
            </p>
            <p className="text-sm text-ink-muted">
              {footer.contact.kakaoLabel} {footer.contact.kakaoText}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-ink">채널</h2>
            <ul className="flex flex-col gap-2">
              {footer.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-brand-600 hover:underline dark:hover:text-brand-400"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted">{footer.copyright}</p>
          <ul className="flex gap-5">
            {footer.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-xs text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
