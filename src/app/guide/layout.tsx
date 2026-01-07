import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <Button asChild variant="ghost">
          <Link href="/guide">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Guide
          </Link>
        </Button>
      </div>
      <article className="prose prose-invert max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground">
        {children}
      </article>
    </div>
  );
}
