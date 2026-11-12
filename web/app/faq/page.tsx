import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InfoPage } from "@/components/marketing/info-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicPages");
  return { title: t("faqTitle"), description: t("faqIntro") };
}

export default async function FaqPage() {
  const t = await getTranslations("PublicPages");
  const questions = [
    [t("faqOneQ"), t("faqOneA")],
    [t("faqTwoQ"), t("faqTwoA")],
    [t("faqThreeQ"), t("faqThreeA")],
    [t("faqFourQ"), t("faqFourA")],
    [t("faqFiveQ"), t("faqFiveA")],
  ];
  return (
    <InfoPage eyebrow={t("faqEyebrow")} title={t("faqTitle")} intro={t("faqIntro")}>
      <div className="border-t border-[#dce3d6]">
        {questions.map(([question, answer]) => (
          <details key={question} className="group border-b border-[#dce3d6]">
            <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
              {question}<PlusIcon className="size-5 shrink-0 text-[#66836a] transition-transform group-open:rotate-45" aria-hidden="true" />
            </summary>
            <p className="max-w-2xl pb-7 pr-9 leading-7 text-[#5b6b5e]">{answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap items-center gap-5 rounded-2xl bg-[#e8efdf] p-7">
        <p className="marketing-display flex-1 text-2xl">{t("faqMore")}</p>
        <Link href="/kontakt" className="marketing-button">{t("contactTitle")}<ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
      </div>
    </InfoPage>
  );
}
