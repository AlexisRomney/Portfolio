import dynamic from "next/dynamic";
import { Contact } from "@/components/sections/Contact";
import { Expertise } from "@/components/sections/Expertise";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";

const FeaturedAI = dynamic(() =>
  import("@/components/sections/FeaturedAI").then((mod) => ({ default: mod.FeaturedAI })),
);

const WindowsOptimizer = dynamic(() =>
  import("@/components/sections/WindowsOptimizer").then((mod) => ({
    default: mod.WindowsOptimizer,
  })),
);

const ProjectManagement = dynamic(() =>
  import("@/components/sections/ProjectManagement").then((mod) => ({
    default: mod.ProjectManagement,
  })),
);

const Journey = dynamic(() =>
  import("@/components/sections/Journey").then((mod) => ({ default: mod.Journey })),
);

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
