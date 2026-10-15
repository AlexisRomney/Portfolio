import { getPortfolioStructuredData } from "@/lib/structured-data";

export function StructuredData() {
  const data = getPortfolioStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
