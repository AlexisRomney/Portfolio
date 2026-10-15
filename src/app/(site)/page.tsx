import { Contact } from "@/components/sections/Contact";
import { Expertise } from "@/components/sections/Expertise";
import { FeaturedAI } from "@/components/sections/FeaturedAI";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { ProjectManagement } from "@/components/sections/ProjectManagement";
import { Projects } from "@/components/sections/Projects";
import { WindowsOptimizer } from "@/components/sections/WindowsOptimizer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Expertise />
      <Projects />
      <FeaturedAI />
      <WindowsOptimizer />
      <ProjectManagement />
      <Journey />
      <Contact />
    </main>
  );
}
