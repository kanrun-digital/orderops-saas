"use client";
export function PageHeader({ title, description, children }: { title?: string; description?: string; children?: any }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
export default PageHeader;
