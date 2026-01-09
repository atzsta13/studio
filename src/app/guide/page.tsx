import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Icon, IconName } from "@/components/ui/icon";
import { PageHeader } from "@/components/layout/page-header";
import guideData from "@/data/guide.json";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Survival Guide',
  description: 'Essential tips and information for Sziget Festival.',
};

export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader 
        title={guideData.title} 
        description={guideData.description} 
      />

      <div className="space-y-6">
        {guideData.sections.map((section) => (
          <div key={section.title} className="rounded-lg border bg-card text-card-foreground shadow-sm">
             <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={section.title}>
                <AccordionTrigger className="p-6 text-xl font-semibold hover:no-underline">
                    <div className="flex items-center gap-4">
                        <span className="text-primary"><Icon name={section.icon as IconName} className="h-5 w-5" /></span>
                        {section.title}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                        {section.items.map((item) => (
                            <div key={item.title} className="p-4 rounded-md bg-muted/50">
                                <h4 className="font-bold text-md text-foreground">{item.title}</h4>
                                <p className="mt-1 text-muted-foreground text-sm">{item.content}</p>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
