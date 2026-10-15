export const MAPBOX_TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined)?.trim() ?? ''

/** True when .env.local holds a real public (pk.) token rather than the placeholder. */
export const hasMapboxToken =
  MAPBOX_TOKEN.startsWith('pk.') && !MAPBOX_TOKEN.includes('PASTE_YOUR') && !MAPBOX_TOKEN.includes('your_public')
