"use client";

import { techStack } from "@/data/expertise";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function TechStack() {
  return (
    <Section
      id="stack"
      tone="muted"
      eyebrow="Stack"
      title="Technologies que je mobilise"
      description="Un socle moderne pour construire, automatiser et déployer des solutions fiables."
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {techStack.map((group, i) => (
          <Reveal key={group.group} delay={i * 0.06}>
            <div>
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--accent)]">
                {group.group}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-[var(--paper)] sm:text-base">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
