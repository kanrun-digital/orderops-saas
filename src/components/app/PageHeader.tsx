"use client";
export function PageHeader({ title, description, subtitle, children, ...props }: any) {
  return (
    <div className="flex items-center justify-between mb-6" {...props}>
      <div>
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        {(description || subtitle) && <p className="text-muted-foreground">{description || subtitle}</p>}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
export default PageHeader;
