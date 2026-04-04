'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Icon, IconName } from "@/components/ui/icon";
import { PageHeader } from "@/components/layout/page-header";
import { getFestivalConfig } from '@/config/festival';
import { Loader2 } from 'lucide-react';

interface GuideItem {
  title: string;
  content: string;
}

interface GuideSection {
  title: string;
  icon: string;
  items: GuideItem[];
}

interface GuideData {
  title: string;
  description: string;
  sections: GuideSection[];
}

export default function GuidePage() {
  const { festivalId } = useParams() as { festivalId: string };
  const config = getFestivalConfig(festivalId);
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGuide() {
      try {
        const response = await fetch(`/data/${festivalId}/guide.json`);
        if (!response.ok) throw new Error('Failed to load guide');
        const data = await response.json();
        setGuideData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGuide();
  }, [festivalId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!guideData) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold italic uppercase tracking-tighter">Guide Not Found</h2>
      </div>
    );
  }

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
                        <span className="text-primary">
                          {section.icon.length <= 2 ? (
                            <span className="text-2xl">{section.icon}</span>
                          ) : (
                            <Icon name={section.icon as IconName} className="h-5 w-5" />
                          )}
                        </span>
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
