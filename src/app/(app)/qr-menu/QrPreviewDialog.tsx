"use client";
export function QrPreviewDialog({ site, open, onOpenChange, ...props }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange?.(false)}>
      <div className="bg-white rounded-lg p-6 max-w-md" onClick={(e: any) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">QR Preview: {site?.name}</h3>
        <p className="text-muted-foreground">QR preview placeholder</p>
        <button className="mt-4 px-4 py-2 bg-primary text-white rounded" onClick={() => onOpenChange?.(false)}>Close</button>
      </div>
    </div>
  );
}
export default QrPreviewDialog;
