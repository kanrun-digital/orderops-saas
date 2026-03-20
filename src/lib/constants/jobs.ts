export const JOB_TYPES = ["sync", "import", "export", "cleanup", "mapping"] as const;
export type JobType = (typeof JOB_TYPES)[number];
export const jobLabels: Record<string, string> = { sync: "Sync", import: "Import", export: "Export", cleanup: "Cleanup", mapping: "Mapping" };
