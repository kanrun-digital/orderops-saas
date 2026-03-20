"use client";
export function SiteFormDialog({ site, open, onOpenChange, onSave, ...props }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange?.(false)}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e: any) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{site ? "Edit Site" : "New Site"}</h3>
        <p className="text-muted-foreground">Site form placeholder</p>
        <div className="flex gap-2 mt-4">
          <button className="px-4 py-2 bg-primary text-white rounded" onClick={() => onSave?.({})}>Save</button>
          <button className="px-4 py-2 border rounded" onClick={() => onOpenChange?.(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
export default SiteFormDialog;
