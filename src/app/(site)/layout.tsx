import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain flex min-h-full flex-1 flex-col">
      <MotionProvider>
        <SmoothScroll>
          <a
            href="#contenu"
            className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-full focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--ink)] focus:[clip:auto]"
          >
            Aller au contenu
          </a>
          <Header />
          <div id="contenu" className="flex flex-1 flex-col">
            {children}
          </div>
          <Footer />
        </SmoothScroll>
      </MotionProvider>
    </div>
  );
}
