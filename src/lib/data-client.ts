export interface UpdateByFiltersOptions {
  table: string;
  filters: Record<string, string | number | boolean>;
  data: Record<string, unknown>;
}

function encodeFilterValue(value: string | number | boolean): string {
  return `eq.${String(value)}`;
}

export async function updateByFilters({ table, filters, data }: UpdateByFiltersOptions) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    searchParams.set(key, encodeFilterValue(value));
  }

  const res = await fetch(`/api/data/${table}?${searchParams.toString()}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Failed to update ${table}`);
  }

  return res.json();
}
