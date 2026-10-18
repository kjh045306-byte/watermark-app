import { useState } from 'react'
import { buildWatermarkedPdf } from '../utils/watermarkPdf'

// 터치 전용 디바이스(모바일/태블릿): 프린트 다이얼로그 대신 다운로드로 폴백
const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches

function getDownloadName(fileName) {
  return fileName.replace(/\.pdf$/i, '') + '.pdf'
}

function Spinner({ light }) {
  return (
    <div className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent
                     ${light ? 'border-white' : 'border-gray-500'}`} />
  )
}

export default function ActionBar({ pdfBuffer, watermarkOptions, fileName, onReset }) {
  const [loading, setLoading] = useState(null) // null | 'download' | 'print'

  const disabled = !pdfBuffer || loading !== null

  // ── 공통 헬퍼 ────────────────────────────────────────────────

  const buildBlob = async () => {
    const bytes = await buildWatermarkedPdf(pdfBuffer, watermarkOptions)
    return new Blob([bytes], { type: 'application/pdf' })
  }

  const triggerDownload = (url, name) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // ── 다운로드 ─────────────────────────────────────────────────

  const handleDownload = async () => {
    setLoading('download')
    try {
      const blob = await buildBlob()
      const url = URL.createObjectURL(blob)
      triggerDownload(url, getDownloadName(fileName))
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error('[ActionBar] download failed', err)
    } finally {
      setLoading(null)
    }
  }

  // ── 프린트 (모바일은 다운로드로 폴백) ────────────────────────

  const handlePrint = async () => {
    setLoading('print')
    try {
      const blob = await buildBlob()
      const url = URL.createObjectURL(blob)

      if (IS_MOBILE) {
        // 모바일: 프린트 다이얼로그를 신뢰할 수 없으므로 다운로드
        triggerDownload(url, getDownloadName(fileName))
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        return
      }

      const win = window.open(url, '_blank')
      if (!win) {
        // 팝업 차단 → 다운로드로 폴백
        triggerDownload(url, getDownloadName(fileName))
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        return
      }

      win.focus()
      // PDF 뷰어가 준비될 때까지 짧게 대기 후 프린트 다이얼로그 호출
      setTimeout(() => {
        win.print()
        win.addEventListener('afterprint', () => {
          win.close()
          URL.revokeObjectURL(url)
        }, { once: true })
        // afterprint를 지원하지 않는 경우를 대비한 안전망 정리
        setTimeout(() => URL.revokeObjectURL(url), 30_000)
      }, 800)
    } catch (err) {
      console.error('[ActionBar] print failed', err)
    } finally {
      setLoading(null)
    }
  }

  // ── 렌더 ─────────────────────────────────────────────────────

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white
                    px-5 py-4 shadow-sm ring-1 ring-gray-200">
      {/* 파일 변경 */}
      <button
        type="button"
        onClick={onReset}
        disabled={loading !== null}
        className="flex items-center gap-1.5 min-h-[44px] rounded-lg px-3 py-2 text-sm text-gray-600
                   hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21
               18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        파일 변경
      </button>

      {/* 우측 버튼 그룹 */}
      <div className="flex items-center gap-2">
        {/* 프린트 */}
        <button
          type="button"
          onClick={handlePrint}
          disabled={disabled}
          className="flex items-center gap-1.5 min-h-[44px] rounded-lg border border-gray-200 px-4 py-2
                     text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors"
        >
          {loading === 'print' ? (
            <Spinner />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415
                   0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096
                   L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662
                   0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21
                   15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0
                   0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081
                   .768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536
                   48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25
                   c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3
                   0h.008v.008H15V10.5Z" />
            </svg>
          )}
          <span>{IS_MOBILE ? '프린트 (저장)' : '프린트'}</span>
        </button>

        {/* PDF 다운로드 (주요 버튼) */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={disabled}
          className="flex items-center gap-1.5 min-h-[44px] rounded-lg bg-blue-600 px-4 py-2 text-sm
                     font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading === 'download' ? (
            <Spinner light />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21
                   18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          )}
          PDF 다운로드
        </button>
      </div>
    </div>
  )
}
