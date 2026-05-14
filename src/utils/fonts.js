import montserratUrl from '@fontsource/montserrat/files/montserrat-latin-800-normal.woff2?url'
import oswaldUrl from '@fontsource/oswald/files/oswald-latin-700-normal.woff2?url'
import bebasNeueUrl from '@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2?url'
import ralewayUrl from '@fontsource/raleway/files/raleway-latin-800-normal.woff2?url'
import nunitoUrl from '@fontsource/nunito/files/nunito-latin-800-normal.woff2?url'

export const FONT_LIST = [
  { label: 'Montserrat',  family: 'Montserrat',  weight: '800', url: montserratUrl },
  { label: 'Oswald',      family: 'Oswald',      weight: '700', url: oswaldUrl },
  { label: 'Bebas Neue',  family: 'Bebas Neue',  weight: '400', url: bebasNeueUrl },
  { label: 'Raleway',     family: 'Raleway',      weight: '800', url: ralewayUrl },
  { label: 'Nunito',      family: 'Nunito',       weight: '800', url: nunitoUrl },
]

// 이미 document.fonts에 등록된 family 추적
const _registered = new Set()

/**
 * 모든 웹폰트 FontFace를 document.fonts에 등록한다 (다운로드는 하지 않음).
 * 앱 최초 실행 시 동기적으로 호출해야 ensureFontLoaded / loadFonts가 동작한다.
 */
export function registerFonts() {
  for (const { family, weight, url } of FONT_LIST) {
    if (_registered.has(family)) continue
    document.fonts.add(
      new FontFace(family, `url(${url}) format('woff2')`, { weight })
    )
    _registered.add(family)
  }
}

/**
 * 모든 워터마크 폰트를 비동기로 다운로드하고 document.fonts에 등록한다.
 * @returns {Promise<Array<{ family: string, weight: string, loaded: boolean, error?: Error }>>}
 */
export async function loadFonts() {
  registerFonts() // 미등록 폰트 먼저 등록

  const results = await Promise.allSettled(
    FONT_LIST.map(({ family, weight }) =>
      document.fonts.load(`${weight} 1px "${family}"`)
        .then(() => ({ family, weight, loaded: true }))
    )
  )

  return results.map((result, i) => {
    const { family, weight } = FONT_LIST[i]
    if (result.status === 'fulfilled') return result.value
    return { family, weight, loaded: false, error: result.reason }
  })
}

/** FONT_LIST에 등록된 웹폰트인지 확인한다. */
export function isWebFont(fontFamily) {
  return FONT_LIST.some((f) => f.family === fontFamily)
}

/**
 * 웹폰트는 FONT_LIST에 등록된 weight(고정)를 반환하고,
 * 시스템 폰트는 사용자가 선택한 fontWeight를 그대로 반환한다.
 */
export function getEffectiveFontWeight(fontFamily, fontWeight) {
  const listEntry = FONT_LIST.find((f) => f.family === fontFamily)
  return listEntry ? listEntry.weight : fontWeight
}

/**
 * canvas에 그리기 전 웹폰트가 로드됐는지 보장한다.
 * 시스템 폰트(FONT_LIST 외)는 isWebFont()로 사전 확인 후 호출하지 않는다.
 */
export async function ensureFontLoaded(fontFamily) {
  const listEntry = FONT_LIST.find((f) => f.family === fontFamily)
  if (!listEntry) return

  const spec = `${listEntry.weight} 1px "${fontFamily}"`
  if (document.fonts.check(spec)) return

  try {
    await document.fonts.load(spec)
  } catch {
    // 로드 실패 시 canvas가 자동으로 sans-serif 폴백 사용
  }
}
