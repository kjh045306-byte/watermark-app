import { PDFDocument } from 'pdf-lib'
import { ensureFontLoaded, getEffectiveFontWeight } from './fonts'

/**
 * Canvas 2D context에 워터마크 텍스트를 그린다.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width  - 캔버스 픽셀 너비
 * @param {number} height - 캔버스 픽셀 높이
 * @param {number} scale  - 렌더 배율 (fontSize에 곱해짐)
 * @param {{ text: string, fontSize: number, opacity: number, color: string,
 *            fontFamily: string, fontWeight: string,
 *            angle: number, position: { x: number, y: number } }} options
 */
export function drawWatermarkOnCanvas(ctx, width, height, scale, options) {
  const { text, fontSize, opacity, color, fontFamily, fontWeight, angle, position } = options
  // 웹폰트: FONT_LIST에 등록된 weight 강제 사용 (로드된 weight와 일치)
  // 시스템 폰트: 사용자 선택 weight 적용
  const effectiveWeight = getEffectiveFontWeight(fontFamily, fontWeight)

  ctx.save()

  ctx.globalAlpha = opacity / 100
  ctx.translate(position.x * width, position.y * height)
  ctx.rotate((angle * Math.PI) / 180)

  ctx.font = `${effectiveWeight} ${fontSize * scale}px "${fontFamily}"`
  console.log('[3] drawWatermarkOnCanvas ctx.font:', ctx.font)
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)

  ctx.restore()
}

// PDF 삽입용 워터마크 캔버스 해상도 배율
const RENDER_SCALE = 2

/**
 * pdf-lib으로 모든 페이지에 워터마크를 삽입한 PDF를 반환한다.
 * @param {ArrayBuffer} pdfArrayBuffer
 * @param {object} options - drawWatermarkOnCanvas 와 동일한 options
 * @returns {Promise<Uint8Array>}
 */
export async function buildWatermarkedPdf(pdfArrayBuffer, options) {
  // PDF 생성 전에도 폰트가 canvas에서 쓸 수 있는 상태인지 보장
  await ensureFontLoaded(options.fontFamily)

  const pdfDoc = await PDFDocument.load(pdfArrayBuffer)
  const pages = pdfDoc.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * RENDER_SCALE)
    canvas.height = Math.round(height * RENDER_SCALE)

    const ctx = canvas.getContext('2d')
    drawWatermarkOnCanvas(ctx, canvas.width, canvas.height, RENDER_SCALE, options)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    const pngBuffer = await blob.arrayBuffer()

    const pngImage = await pdfDoc.embedPng(pngBuffer)
    page.drawImage(pngImage, { x: 0, y: 0, width, height })
  }

  return pdfDoc.save()
}
