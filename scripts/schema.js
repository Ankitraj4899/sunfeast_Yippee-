// Schema injection is handled exclusively by the Cloudflare Edge Worker (edge-worker).
// Client-side DOM schema injection has been disabled to improve frontend performance
// and prevent hydration race conditions.

export function setJsonLd() {}
export function updateSchemaGraph() {}
export function addSchemaEntities() {}
export function buildPageSchema() {}
export default buildPageSchema;
