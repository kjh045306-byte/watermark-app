import { useState, useEffect } from 'react'
import './index.css'
import { useWatermark } from './hooks/useWatermark'
import { usePwaInstall } from './hooks/usePwaInstall'
import { loadFonts } from './utils/fonts'
import UploadZone from './components/UploadZone'
import ControlPanel from './components/ControlPanel'
import PreviewCanvas from './components/PreviewCanvas'
import ActionBar from './components/ActionBar'
import PwaInstallBanner from './components/PwaInstallBanner'

export default function App() {
  const [pdfFile, setPdfFile] = useState(null) // { buffer: ArrayBuffer, name: string }
  const watermark = useWatermark()
  const { canInstall, showIosGuide, promptInstall } = usePwaInstall()

  // 앱 마운트 시 모든 웹폰트를 백그라운드에서 미리 다운로드
  useEffect(() => { loadFonts() }, [])

  const watermarkOptions = {
    text:       watermark.watermarkText, // drawWatermarkOnCanvas가 'text' 키를 사용
    fontSize:   watermark.fontSize,
    opacity:    watermark.opacity,
    color:      watermark.color,
    fontFamily: watermark.fontFamily,
    fontWeight: watermark.fontWeight,
    angle:      watermark.angle,
    position:   watermark.position,
  }

  // ── 업로드 화면 ─────────────────────────────────────────────────
  if (!pdfFile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
            PDF 워터마크
          </h1>
          <UploadZone onFile={(buffer, name) => setPdfFile({ buffer, name })} />
          <PwaInstallBanner
            canInstall={canInstall}
            showIosGuide={showIosGuide}
            onInstall={promptInstall}
          />
        </div>
      </div>
    )
  }

  // ── 워크스페이스 ─────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-4 p-4
                        pb-24 md:pb-4">
          {/* 사이드바: PC 왼쪽 / 모바일 두 번째 */}
          <div className="order-2 md:order-1 shrink-0">
            <ControlPanel
              {...watermark}
              fileName={pdfFile.name}
              totalPages={0}
            />
          </div>

          {/* 미리보기: PC 오른쪽 / 모바일 첫 번째 */}
          <main className="flex-1 order-1 md:order-2">
            <PreviewCanvas
              pdfBuffer={pdfFile.buffer}
              watermarkOptions={watermarkOptions}
              onPositionChange={watermark.setPosition}
            />
          </main>
        </div>
      </div>

      {/* ActionBar: 모바일 고정 하단 / PC 정적 하단 */}
      <div
        className="fixed inset-x-0 bottom-0 z-10 p-4 bg-gray-100 md:static md:z-auto md:pt-0"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <ActionBar
          pdfBuffer={pdfFile.buffer}
          watermarkOptions={watermarkOptions}
          fileName={pdfFile.name}
          onReset={() => setPdfFile(null)}
        />
      </div>
    </div>
  )
}
