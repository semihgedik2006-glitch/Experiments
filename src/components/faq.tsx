"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { faqItems } from "@/lib/faq-data";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24">
      <Container className="max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Häufige Fragen</h2>

        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqItems.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="font-medium">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-muted transition-transform ${open ? "rotate-180 text-lime" : ""}`}
                  />
                </button>
                {open && <p className="pb-5 text-sm text-muted">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
