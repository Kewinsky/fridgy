import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InfoPage } from "@/components/marketing/info-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <InfoPage
      eyebrow={t("faqEyebrow")}
      title={t("faqTitle")}
      intro={t("faqIntro")}
    >
      <Accordion multiple hiddenUntilFound className="border-y border-border">
        {questions.map(([question, answer]) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger className="min-h-20 py-5 text-lg">
              {question}
            </AccordionTrigger>
            <AccordionContent className="max-w-2xl pb-7 pr-9 text-base">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-12 flex flex-wrap items-center gap-5 rounded-2xl bg-[#e8efdf] p-7">
        <p className="marketing-display flex-1 text-2xl">{t("faqMore")}</p>
        <Link href="/kontakt" className="marketing-button">
          {t("contactTitle")}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </InfoPage>
  );
}
