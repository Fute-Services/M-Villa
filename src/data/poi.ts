import type { PoiCategory } from './content'

export interface Poi {
  id: string
  category: PoiCategory
  name: string
  /** [longitude, latitude] */
  lngLat: [number, number]
  /** Approximate drive time from the property, as shown in the reference popups ("5 mins"). */
  dist: string
}

const dms = (d: number, m: number, s: number) => d + m / 60 + s / 3600

/** Points of interest from the reference's nearby-amenities map (Greenz_map.html), same names, order and positions. */
export const POIS: Poi[] = [
  { id: 'emirates-road', category: 'road', name: 'Emirates Road (E611)', lngLat: [dms(55, 26, 44.65), dms(25, 7, 28)], dist: '2 mins' },
  { id: 'dubai-alain-road', category: 'road', name: 'Dubai – Al Ain Road (E66)', lngLat: [55.60806053556787, 24.75657834695293], dist: '~15 mins' },
  { id: 'szr-hamdan', category: 'road', name: 'Sheikh Zayed Bin Hamdan Al Nahyan St', lngLat: [55.34560854381644, 25.084728036812567], dist: '~10 mins' },
  { id: 'mbz-road', category: 'road', name: 'Sheikh Mohammed Bin Zayed Road (E311)', lngLat: [55.44026802763769, 25.300964680428866], dist: '~20 mins' },
  { id: 'dxb', category: 'airport', name: 'Dubai International Airport (DXB)', lngLat: [55.36848963122563, 25.2521892766298], dist: '17 mins' },
  { id: 'burj-khalifa', category: 'landmark', name: 'Downtown Dubai / Burj Khalifa', lngLat: [55.27427524680336, 25.197419826341015], dist: '18 mins' },
  { id: 'creek-harbour', category: 'landmark', name: 'Dubai Creek Harbour', lngLat: [55.34420699504838, 25.205965585257523], dist: '15 mins' },
  { id: 'silicon-mall', category: 'mall', name: 'Silicon Central Mall', lngLat: [55.38897666231978, 25.126490477730837], dist: '10 mins' },
  { id: 'dubai-mall', category: 'mall', name: 'The Dubai Mall', lngLat: [55.279206392823696, 25.20062619758395], dist: '20 mins' },
  { id: 'dubai-outlet-mall', category: 'mall', name: 'Dubai Outlet Mall', lngLat: [55.400178790158236, 25.07331978585042], dist: '12 mins' },
  { id: 'q1-mall', category: 'mall', name: 'Q1 Mall — Dubai Silicon Oasis', lngLat: [55.402990133065586, 25.127961871343462], dist: '5 mins' },
  { id: 'dso-main', category: 'mall', name: 'Dubai Silicon Oasis', lngLat: [55.40230248140574, 25.12509358947898], dist: '5 mins' },
  { id: 'arch-mall', category: 'mall', name: 'The Arch Mall', lngLat: [55.374494280710984, 25.14941486300614], dist: '8 mins' },
  { id: 'avenue-mall', category: 'mall', name: 'Avenue Mall — Nad Al Sheba', lngLat: [55.347127752296686, 25.146692761048804], dist: '10 mins' },
  { id: 'silicon-central-2', category: 'mall', name: 'Silicon Central Mall (South)', lngLat: [55.374789625203796, 25.1120054648799], dist: '9 mins' },
  { id: 'cedre-shopping', category: 'mall', name: 'Cedre Shopping Centre', lngLat: [55.39671825214378, 25.12826439898812], dist: '6 mins' },
  { id: 'villanova-centre', category: 'mall', name: 'Villanova Centre By Dubai Retail', lngLat: [55.36701637732803, 25.076069648507435], dist: '13 mins' },
  { id: 'loggiaplaza', category: 'mall', name: 'Loggiaplaza', lngLat: [55.38042694583506, 25.112466985916136], dist: '8 mins' },
  { id: 'img-worlds', category: 'entertainment', name: 'IMG Worlds of Adventure', lngLat: [55.31970920944851, 25.082660919919434], dist: '13 mins' },
  { id: 'global-village', category: 'entertainment', name: 'Global Village', lngLat: [55.30847301140326, 25.07190067769577], dist: '15 mins' },
  { id: 'dubai-safari', category: 'park', name: 'Dubai Safari Park', lngLat: [55.44565006701969, 25.172053167640197], dist: '11 mins' },
  { id: 'metro-blue', category: 'metro', name: 'Metro Blue Line', lngLat: [55.40599936364155, 25.14366570098184], dist: '5 mins' },
  { id: 'petit-plaisir', category: 'restaurant', name: 'Petit Plaisir Restaurant', lngLat: [55.410936780446754, 25.12545005355278], dist: '5 mins' },
  { id: 'the-garden', category: 'restaurant', name: 'The Garden', lngLat: [55.42315991822961, 25.12779744664326], dist: '7 mins' },
  { id: 'ksk-restaurant', category: 'restaurant', name: 'KSK Restaurant', lngLat: [55.427099150590095, 25.131001644914587], dist: '7 mins' },
  { id: 'diac-foodcourt', category: 'restaurant', name: 'DIAC Foodcourt', lngLat: [55.41046700249981, 25.12555702482526], dist: '5 mins' },
  { id: 'manipal', category: 'university', name: 'Manipal Academy of Higher Education — Dubai', lngLat: [55.4249573893814, 25.136190297308055], dist: '8 mins' },
  { id: 'rit-dubai', category: 'university', name: 'Rochester Institute of Technology (RIT Dubai)', lngLat: [55.38982623603085, 25.132606540637106], dist: '6 mins' },
  { id: 'univ-dubai', category: 'university', name: 'University of Dubai', lngLat: [55.414470281237236, 25.107586966872073], dist: '10 mins' },
  { id: 'curtin', category: 'university', name: 'Curtin University Dubai', lngLat: [55.4107597821805, 25.127182722445607], dist: '5 mins' },
]
