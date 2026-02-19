export const buildQuery = (params: Record<string, string | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v?.length) {
      sp.set(k, v);
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};
