interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="text-center mb-10">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
    </header>
  );
}
