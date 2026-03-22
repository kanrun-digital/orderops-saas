export function getNcbAuthConfig() {
  const instance = process.env.NCB_INSTANCE ?? "";
  const apiUrl = process.env.NCB_API_URL ?? process.env.NCB_AUTH_API_URL ?? "";
  const secretKey = process.env.NCB_SECRET_KEY ?? "";

  return {
    instance,
    apiUrl,
    secretKey,
    hasLegacyAuthApiUrl: Boolean(process.env.NCB_AUTH_API_URL),
    hasCanonicalApiUrl: Boolean(process.env.NCB_API_URL),
  };
}
