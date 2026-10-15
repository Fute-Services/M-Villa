/** Minimal outline icon set (original SVG paths, 24x24 viewBox, stroke based). */
const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  lotus: 'M12 20c-4 0-8-3-8-9 3 0 6 1.5 8 4 2-2.5 5-4 8-4 0 6-4 9-8 9zM12 15V6c-1.5 1-2.5 3-2.5 5',
  route: 'M6 4v8a3 3 0 006 0V9a3 3 0 016 0v7M6 4H4m2 0h2M18 20h2m-2 0h-2',
  house: 'M4 20v-8l8-8 8 8v8H4zM9 20v-5h6v5',
  book: 'M3 5h7a2 2 0 012 2v13a2 2 0 00-2-2H3V5zM21 5h-7a2 2 0 00-2 2v13a2 2 0 012-2h7V5z',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c3-5 6-8 10-10',
  wave: 'M3 9c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 15c3 0 3 2 6 2s3-2 6-2 3 2 6 2',
  sport: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  family: 'M8 11a3 3 0 100-6 3 3 0 000 6zM17 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 20c0-3 2.2-5 5-5s5 2 5 5M14 20c0-2.2 1.5-4 3.5-4S21 17.8 21 20',
  bed: 'M3 18V7M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5M7 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  plane: 'M2 14l8-2-4-8h2l7 7 6-2c1 0 2 1 1 2l-6 3 1 7h-2l-3-6-5 2-2-1z',
  landmark: 'M3 21h18M5 21V9M19 21V9M9 21V9M15 21V9M3 9l9-6 9 6',
  bag: 'M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 016 0v2',
  fork: 'M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 21V3c-2 1-3 4-3 7h3',
  cap: 'M2 9l10-5 10 5-10 5L2 9zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5',
  ticket: 'M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 100-4V8z',
  train: 'M7 3h10a2 2 0 012 2v10a3 3 0 01-3 3H8a3 3 0 01-3-3V5a2 2 0 012-2zM5 11h14M8 21l2-3M16 21l-2-3',
  chevronUp: 'M6 15l6-6 6 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  play: 'M8 5l11 7-11 7V5z',
  phone: 'M6 3h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z',
  sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
  moon: 'M20 14A8 8 0 019.5 4 8 8 0 1020 14z',
  guide: 'M9 11a3 3 0 100-6 3 3 0 000 6zM15 11a2.5 2.5 0 100-5M3 20c0-3 2.5-5 6-5s6 2 6 5M16 15c3 0 5 1.8 5 5',
  mute: 'M4 9h4l5-4v14l-5-4H4V9zM17 9l4 6M21 9l-4 6',
  chat: 'M4 5h16v11H9l-5 4V5z',
  facebook: 'M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8z',
  instagram: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 16a4 4 0 100-8 4 4 0 000 8zM17.5 6.5h.01',
  linkedin: 'M4 9h4v11H4V9zM6 4a2 2 0 110 4 2 2 0 010-4zM10 9h4v2c1-2 6-3 6 2v7h-4v-6c0-2-3-2-3 0v6h-3V9z',
  walker: 'M12 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 21l2-6-2-3 1-5 3 3 3 1M9 12l-3 1',
  zoomIn: 'M12 5v14M5 12h14',
  zoomOut: 'M5 12h14',
  compass: 'M12 3l4 14-4-3-4 3 4-14z',
  map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6zM9 4v14M15 6v14',
  satellite: 'M4 20l4-4M7 13l4 4M13 7l4 4M9 11l4-4 4 4-4 4-4-4zM17 3a4 4 0 014 4',
  plot: 'M4 4h7v7H4V4zM13 4h7v4h-7V4zM13 10h7v10h-7V10zM4 13h7v7H4v-7z',
  vr: 'M4 8h16a2 2 0 012 2v5a2 2 0 01-2 2h-4l-2-2.5h-4L8 17H4a2 2 0 01-2-2v-5a2 2 0 012-2z',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
} as const

/** Icons taken from the reference tour (public/icons). These take priority over the SVG fallbacks above. */
const IMAGE_ICONS = {
  home: 'home',
  pin: 'pin',
  lotus: 'lotusMenu',
  route: 'route',
  house: 'house',
  book: 'book',
  bed: 'bed',
  family: 'family',
  sport: 'sport',
  phone: 'phone',
  guide: 'guide',
  mute: 'mute',
  facebook: 'facebook',
  instagram: 'instagram',
  linkedin: 'linkedin',
  expand: 'expand',
  sun: 'sun',
  moon: 'moon',
  chevronUp: 'chevronUp',
  chevronDown: 'chevronDown',
  chevronLeft: 'chevronLeft',
  explore: 'explore',
  umbrella: 'umbrella',
  tree: 'tree',
  wellness: 'lotus',
  address: 'address',
} as const

type SvgIconName = keyof typeof PATHS
type ImageIconName = keyof typeof IMAGE_ICONS
export type IconName = SvgIconName | ImageIconName

interface Props {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 22, className }: Props) {
  if (name in IMAGE_ICONS) {
    return (
      <img
        className={className}
        src={`/icons/${IMAGE_ICONS[name as ImageIconName]}.png`}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ objectFit: 'contain' }}
      />
    )
  }
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name as SvgIconName]} />
    </svg>
  )
}
