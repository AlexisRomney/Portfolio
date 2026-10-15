export type ProjectStatus = "live" | "coming-soon" | "private-demo";

export type ProjectVisual = {
  src: string;
  alt: string;
  width: number;
  height: number;
  frame?: "browser" | "window" | "plain";
};

export type Project = {
  id: string;
  name: string;
  eyebrow: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  role: string;
  technologies: string[];
  demoUrl: string | null;
  demoLabel?: string;
  repoUrl?: string | null;
  status: ProjectStatus;
  published: boolean;
  featured?: boolean;
  highlight?: boolean;
  visualTone: "ai" | "product" | "system" | "commerce" | "community";
  visuals: ProjectVisual[];
};
