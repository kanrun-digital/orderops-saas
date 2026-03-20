"use client";
export function TablesSection({ siteId, ...props }: any) {
  return (
    <div className="border rounded-lg p-4" {...props}>
      <h4 className="font-semibold mb-2">Tables</h4>
      <p className="text-muted-foreground">Tables management placeholder for site {siteId}</p>
    </div>
  );
}
export default TablesSection;
