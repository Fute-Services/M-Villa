import { describe, expect, it } from 'vitest'
import { HUB_DETAILS, hubThumb } from './hubs'
import { getCube } from './panoramas'

describe('hub views', () => {
  it('every view points at a panorama that is in the project, with its own thumbnail', () => {
    for (const hub of HUB_DETAILS) {
      for (const item of hub.items) {
        const pano = getCube(item.panoId)
        expect(pano, `${hub.id}/${item.id}`).toBeDefined()
        expect(pano?.available, `${hub.id}/${item.id} files`).toBe(true)
        expect(hubThumb(item.panoId)).toBe(`/panoramas/hub-thumbs/${pano!.slug}.jpg`)
      }
    }
  })

  it('does not show one image for everything: only the deliberately shared views repeat', () => {
    const all = HUB_DETAILS.flatMap((h) => h.items.map((i) => i.panoId))
    const distinct = new Set(all)
    expect(all.length).toBe(19)
    expect(distinct.size).toBe(18) // Greenz Sanctuary appears under both Green Sanctuary and Family Hub
  })
})
