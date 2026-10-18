import montserrat300Url from '@fontsource/montserrat/files/montserrat-latin-300-normal.woff2?url'
import montserrat400Url from '@fontsource/montserrat/files/montserrat-latin-400-normal.woff2?url'
import montserrat700Url from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2?url'
import montserrat900Url from '@fontsource/montserrat/files/montserrat-latin-900-normal.woff2?url'

import oswald300Url from '@fontsource/oswald/files/oswald-latin-300-normal.woff2?url'
import oswald400Url from '@fontsource/oswald/files/oswald-latin-400-normal.woff2?url'
import oswald700Url from '@fontsource/oswald/files/oswald-latin-700-normal.woff2?url'

import bebasNeue400Url from '@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2?url'

import raleway300Url from '@fontsource/raleway/files/raleway-latin-300-normal.woff2?url'
import raleway400Url from '@fontsource/raleway/files/raleway-latin-400-normal.woff2?url'
import raleway700Url from '@fontsource/raleway/files/raleway-latin-700-normal.woff2?url'
import raleway900Url from '@fontsource/raleway/files/raleway-latin-900-normal.woff2?url'

import nunito300Url from '@fontsource/nunito/files/nunito-latin-300-normal.woff2?url'
import nunito400Url from '@fontsource/nunito/files/nunito-latin-400-normal.woff2?url'
import nunito700Url from '@fontsource/nunito/files/nunito-latin-700-normal.woff2?url'
import nunito900Url from '@fontsource/nunito/files/nunito-latin-900-normal.woff2?url'

/**
 * 각 웹폰트와 지원하는 weight 목록.
 * weights 배열이 1개인 폰트(Bebas Neue)는 굵기 선택이 불가능하다.
 */
export const WEB_FONTS = [
  {
    label: 'Montserrat',
    family: 'Montserrat',
    weights: [
      { weight: '300', url: montserrat300Url },
      { weight: '400', url: montserrat400Url },
      { weight: '700', url: montserrat700Url },
      { weight: '900', url: montserrat900Url },
    ],
  },
  {
    label: 'Oswald',
    family: 'Oswald',
    weights: [
      { weight: '300', url: oswald300Url },
      { weight: '400', url: oswald400Url },
      { weight: '700', url: oswald700Url },
    ],
  },
  {
    label: 'Bebas Neue',
    family: 'Bebas Neue',
    weights: [
      { weight: '400', url: bebasNeue400Url },
    ],
  },
  {
    label: 'Raleway',
    family: 'Raleway',
    weights: [
      { weight: '300', url: raleway300Url },
      { weight: '400', url: raleway400Url },
      { weight: '700', url: raleway700Url },
      { weight: '900', url: raleway900Url },
    ],
  },
  {
    label: 'Nunito',
    family: 'Nunito',
    weights: [
      { weight: '300', url: nunito300Url },
      { weight: '400', url: nunito400Url },
      { weight: '700', url: nunito700Url },
      { weight: '900', url: nunito900Url },
    ],
  },
]

// ControlPanel이 family / label에 접근하는 기존 코드와 호환
export const FONT_LIST = WEB_FONTS

// family → WEB_FONTS 항목
function findWebFont(family) {
  return WEB_FONTS.find((f) => f.family === family)
}

/** FONT_LIST에 등록된 웹폰트인지 확인한다. */
export function isWebFont(family) {
  return !!findWebFont(family)
}

const SANS_FALLBACK = ['Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'sans-serif']
const SERIF_FALLBACK = ['AppleMyungjo', 'Batang', 'Noto Serif KR', 'serif']
const SERIF_FAMILIES = ['Batang', 'AppleMyungjo']

/**
 * ctx.font에 넣을 font-family 문자열을 만든다.
 * 웹폰트는 이름 하나만, 시스템 폰트는 기기별 대체 폰트 목록을 뒤에 붙인다.
 */
export function buildCanvasFontFamily(family) {
  if (isWebFont(family)) return `"${family}"`

  const fallback = SERIF_FAMILIES.includes(family) ? SERIF_FALLBACK : SANS_FALLBACK
  const list = [family, ...fallback.filter((f) => f !== family)]
  return list.map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ')
}

/** 해당 폰트가 단일 weight만 지원하는지 여부 (Bebas Neue 등). */
export function isSingleWeightFont(family) {
  const font = findWebFont(family)
  return font ? font.weights.length === 1 : false
}

/** 해당 폰트에서 사용 가능한 weight 문자열 배열. 시스템 폰트면 null. */
export function getAvailableWeights(family) {
  const font = findWebFont(family)
  return font ? font.weights.map((w) => w.weight) : null
}

/**
 * 요청한 weight와 가장 가까운 사용 가능한 weight를 반환한다.
 * 시스템 폰트(WEB_FONTS 외)는 요청 weight를 그대로 반환한다.
 */
export function getEffectiveFontWeight(family, requestedWeight) {
  const font = findWebFont(family)
  if (!font) return requestedWeight

  const available = font.weights.map((w) => Number(w.weight))
  const target = Number(requestedWeight)
  if (available.includes(target)) return requestedWeight

  const closest = available.reduce((a, b) =>
    Math.abs(b - target) < Math.abs(a - target) ? b : a
  )
  return String(closest)
}

// 이미 document.fonts에 등록된 (family, weight) 쌍 추적
const _registered = new Set()

/**
 * 모든 웹폰트의 전체 weight를 document.fonts에 등록한다 (다운로드는 하지 않음).
 * 앱 최초 실행 시 동기적으로 호출해야 ensureFontLoaded / loadFonts가 동작한다.
 */
export function registerFonts() {
  for (const { family, weights } of WEB_FONTS) {
    for (const { weight, url } of weights) {
      const key = `${family}-${weight}`
      if (_registered.has(key)) continue
      document.fonts.add(
        new FontFace(family, `url(${url}) format('woff2')`, { weight })
      )
      _registered.add(key)
    }
  }
}

/**
 * 모든 워터마크 폰트(전체 weight)를 비동기로 다운로드한다.
 * @returns {Promise<Array<{ family: string, weight: string, loaded: boolean, error?: Error }>>}
 */
export async function loadFonts() {
  registerFonts()

  const allVariants = WEB_FONTS.flatMap(({ family, weights }) =>
    weights.map(({ weight }) => ({ family, weight }))
  )

  const results = await Promise.allSettled(
    allVariants.map(({ family, weight }) =>
      document.fonts.load(`${weight} 1px "${family}"`)
        .then(() => ({ family, weight, loaded: true }))
    )
  )

  return results.map((result, i) => {
    const { family, weight } = allVariants[i]
    if (result.status === 'fulfilled') return result.value
    return { family, weight, loaded: false, error: result.reason }
  })
}

/**
 * canvas에 그리기 전, 지정한 weight의 웹폰트가 로드됐는지 보장한다.
 * 요청 weight가 없으면 가장 가까운 weight로 대체한다.
 * 시스템 폰트(WEB_FONTS 외)는 isWebFont()로 사전 확인 후 호출하지 않는다.
 */
export async function ensureFontLoaded(family, fontWeight) {
  if (!findWebFont(family)) return

  const effective = getEffectiveFontWeight(family, fontWeight)
  const spec = `${effective} 1px "${family}"`
  if (document.fonts.check(spec)) return

  try {
    await document.fonts.load(spec)
  } catch {
    // 로드 실패 시 canvas가 자동으로 sans-serif 폴백 사용
  }
}
