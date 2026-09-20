export function isKemnakerSynced(notes?: string | null): boolean {
  return Boolean(notes?.includes('[kemnaker_synced]'));
}
