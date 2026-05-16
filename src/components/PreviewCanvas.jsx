import { useRef, useState, useEffect } from 'react'
import { usePdfPreview } from '../hooks/usePdfPreview'
import { drawWatermarkOnCanvas } from '../utils/watermarkPdf'
import { ensureFontLoaded, isWebFont } from '../utils/fonts'

// 워터마크 중심점 기준 드래그 감지 반경 (canvas px)
const HIT_RADIUS = 48

export default function PreviewCanvas({ pdfBuffer, watermarkOptions, onPositionChange }) {
  const containerRef = useRef(null)
  const pdfCanvasRef = useRef(null)
  const overlayRef = useRef(null)
  // 렌더 간 최신 options를 비동기 콜백(MutationObserver)에서 읽기 위해 ref 유지
  const optionsRef = useRef(watermarkOptions)
  optionsRef.current = watermarkOptions

  const dragging = useRef(false)
  // 연속 폰트 변경 시 마지막 요청만 실제로 그리도록 시퀀스 추적
  const redrawSeqRef = useRef(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [cursor, setCursor] = useState('default')

  const { totalPages, isLoading, error, pageWidthPtRef } = usePdfPreview({
    canvasRef: pdfCanvasRef,
    containerRef,
    pdfBuffer,
    pageNumber,
  })

  // 새 PDF 업로드 시 1페이지로 초기화
  useEffect(() => {
    setPageNumber(1)
  }, [pdfBuffer])

  // overlay canvas를 PDF canvas에 맞춰 동기화하고 워터마크를 다시 그린다.
  // 웹폰트가 아직 다운로드 중이면 완료될 때까지 대기 후 그린다.
  const redrawOverlay = async () => {
    const seq = ++redrawSeqRef.current
    const overlay = overlayRef.current
    const pdfCanvas = pdfCanvasRef.current
    if (!overlay || !pdfCanvas || !pdfCanvas.width || !pdfCanvas.height) return

    const { fontFamily, fontWeight } = optionsRef.current

    // 웹폰트만 로드 대기 + seq 체크. 시스템 폰트는 await 없이 즉시 진행
    if (isWebFont(fontFamily)) {
      await ensureFontLoaded(fontFamily, fontWeight)
      if (seq !== redrawSeqRef.current) return
    }

    // canvas 좌표 공간을 PDF canvas와 동일하게 맞춤
    overlay.width = pdfCanvas.width
    overlay.height = pdfCanvas.height

    const ctx = overlay.getContext('2d')
    ctx.clearRect(0, 0, overlay.width, overlay.height)
    // PDF pt 기준으로 미리보기 scale을 맞춰 PDF 출력과 동일한 비율로 그린다
    const pdfPageWidthPt = pageWidthPtRef.current
    const scale = pdfPageWidthPt > 0 ? overlay.width / pdfPageWidthPt : 1
    drawWatermarkOnCanvas(ctx, overlay.width, overlay.height, scale, optionsRef.current)
  }

  // watermarkOptions(텍스트·스타일·위치) 변경 시 즉시 재그리기
  useEffect(() => {
    console.log('[2] PreviewCanvas watermarkOptions.fontFamily:', watermarkOptions.fontFamily)
    redrawOverlay()
  }, [watermarkOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  // PDF 페이지가 렌더링되면 canvas width/height 속성이 갱신됨 → overlay 동기화
  useEffect(() => {
    const pdfCanvas = pdfCanvasRef.current
    if (!pdfCanvas) return
    const observer = new MutationObserver(redrawOverlay)
    observer.observe(pdfCanvas, { attributes: true, attributeFilter: ['width', 'height'] })
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 포인터 이벤트 헬퍼 ──────────────────────────────────────

  // 포인터의 canvas 내 비율 좌표(0-1)를 반환
  const getPointerRatio = (e) => {
    const rect = overlayRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    }
  }

  // 비율 좌표가 워터마크 중심 HIT_RADIUS 이내인지 판단
  const isNearWatermark = (rx, ry) => {
    const { position } = optionsRef.current
    const overlay = overlayRef.current
    if (!overlay) return false
    const dx = (rx - position.x) * overlay.width
    const dy = (ry - position.y) * overlay.height
    return Math.sqrt(dx * dx + dy * dy) < HIT_RADIUS
  }

  // ── 이벤트 핸들러 ──────────────────────────────────────────

  const handlePointerDown = (e) => {
    const { x, y } = getPointerRatio(e)
    if (!isNearWatermark(x, y)) return
    // 드래그 중 포인터가 canvas 밖으로 나가도 이벤트를 계속 수신
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    setCursor('grabbing')
  }

  const handlePointerMove = (e) => {
    const { x, y } = getPointerRatio(e)
    if (dragging.current) {
      onPositionChange({ x, y })
    } else {
      setCursor(isNearWatermark(x, y) ? 'grab' : 'default')
    }
  }

  const handlePointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    setCursor('default')
  }

  // ── 렌더 ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      {/* PDF + 워터마크 오버레이 */}
      <div ref={containerRef} className="relative w-full bg-white shadow-lg">
        {/* 로딩 / 에러 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75">
            <span className="text-sm text-gray-500">렌더링 중…</span>
          </div>
        )}
        {error && !isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75">
            <span className="text-sm text-red-500">PDF를 불러올 수 없습니다</span>
          </div>
        )}
        {!pdfBuffer && (
          <div className="flex items-center justify-center h-72 text-gray-400 text-sm">
            PDF를 업로드하면 미리보기가 표시됩니다
          </div>
        )}

        {/* PDF 렌더링 canvas */}
        <canvas ref={pdfCanvasRef} className="block w-full" />

        {/* 워터마크 + 드래그 인터랙션 overlay */}
        {pdfBuffer && (
          <canvas
            ref={overlayRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor, touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        )}
      </div>

      {/* 페이지 네비게이션 */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber === 1}
            className="min-h-[44px] min-w-[44px] px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          <span className="text-gray-600 tabular-nums">
            {pageNumber} / {totalPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
            disabled={pageNumber === totalPages}
            className="min-h-[44px] min-w-[44px] px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
