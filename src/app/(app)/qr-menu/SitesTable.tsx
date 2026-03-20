"use client";
export function SitesTable({ sites, onEdit, onDelete, onPreview, ...props }: any) {
  const items = sites || [];
  return (
    <div className="border rounded-lg" {...props}>
      <table className="w-full">
        <thead><tr className="border-b"><th className="p-3 text-left">Name</th><th className="p-3 text-left">Slug</th><th className="p-3 text-left">Status</th><th className="p-3">Actions</th></tr></thead>
        <tbody>
          {items.map((s: any) => (
            <tr key={s.id} className="border-b">
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.slug}</td>
              <td className="p-3">{s.status}</td>
              <td className="p-3 flex gap-2">
                <button onClick={() => onEdit?.(s)}>Edit</button>
                <button onClick={() => onPreview?.(s)}>QR</button>
                <button onClick={() => onDelete?.(s)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default SitesTable;
