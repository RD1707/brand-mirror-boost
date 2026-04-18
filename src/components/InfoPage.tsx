import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import Layout from "@/components/Layout";
import { infoPages, type InfoPageContent } from "@/data/infoPages";

interface InfoPageProps {
  slug?: string;
  content?: InfoPageContent;
}

const InfoPage = ({ slug, content }: InfoPageProps) => {
  const data =
    content ??
    (slug ? infoPages[slug] : undefined) ?? {
      title: "Conteúdo em breve",
      subtitle: "Esta página ainda está em construção.",
      sections: [],
    };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
        <nav className="flex items-center gap-1.5 text-xs text-foreground/60 mb-6">
          <Link to="/" className="flex items-center gap-1 hover:text-primary">
            <Home className="h-3 w-3" /> Início
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{data.title}</span>
        </nav>

        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
            {data.title}
          </h1>
          {data.subtitle && (
            <p className="text-sm md:text-base text-foreground/70 max-w-2xl">
              {data.subtitle}
            </p>
          )}
        </header>

        <div className="space-y-6 md:space-y-8">
          {data.sections.length > 0 ? (
            data.sections.map((section, idx) => (
              <section
                key={idx}
                className="bg-card border border-border rounded-lg p-5 md:p-6"
              >
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">
                  {section.heading}
                </h2>
                <p className="text-sm md:text-base text-foreground/70 leading-relaxed">
                  {section.body}
                </p>
              </section>
            ))
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-sm text-foreground/60">
                Em breve, mais informações por aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InfoPage;
