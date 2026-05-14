import { useRef, useState } from 'react'

/**
 * @param {{ onFile: (buffer: ArrayBuffer, name: string) => void }} props
 */
export default function UploadZone({ onFile }) {
  const inputRef = useRef(null)
  // dragenter/dragleave가 자식 요소 위에서도 발생하므로 카운터로 추적
  const dragCounter = useRef(0)

  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const processFile = async (file) => {
    if (!file) return

    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      setError('PDF 파일만 업로드할 수 있습니다.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const buffer = await file.arrayBuffer()
      onFile(buffer, file.name)
    } catch {
      setError('파일을 읽는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── 드래그 이벤트 ────────────────────────────────────────────

  const handleDragEnter = (e) => {
    e.preventDefault()
    dragCounter.current += 1
    setIsDragging(true)
    setError(null)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current === 0) setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  // ── 파일 입력 ────────────────────────────────────────────────

  const handleInputChange = (e) => {
    processFile(e.target.files[0])
    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    e.target.value = ''
  }

  const handleClick = () => {
    if (!isLoading) inputRef.current?.click()
  }

  // ── 스타일 ──────────────────────────────────────────────────

  const zoneClass = [
    'relative flex flex-col items-center justify-center gap-4',
    'min-h-52 rounded-2xl border-2 border-dashed p-8 text-center',
    'transition-colors duration-200',
    isLoading
      ? 'cursor-wait border-gray-200 bg-gray-50'
      : isDragging
      ? 'cursor-copy border-blue-400 bg-blue-50'
      : 'cursor-pointer border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40',
  ].join(' ')

  // ── 렌더 ────────────────────────────────────────────────────

  return (
    <div
      className={zoneClass}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* 숨김 파일 입력 — accept=".pdf"로 모바일 파일 선택기도 PDF만 표시 */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {isLoading ? (
        /* 로딩 */
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-500">파일 읽는 중…</p>
        </div>
      ) : (
        <>
          {/* 아이콘 */}
          <div className={`rounded-full p-4 transition-colors duration-200
                           ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {isDragging ? (
              /* 놓기 아이콘 */
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            ) : (
              /* 업로드 아이콘 */
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21
                     18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            )}
          </div>

          {/* 안내 텍스트 */}
          <div className="space-y-1">
            <p className={`font-medium transition-colors duration-200
                           ${isDragging ? 'text-blue-600' : 'text-gray-700'}`}>
              {isDragging ? 'PDF를 여기에 놓으세요' : 'PDF를 드래그하거나 클릭하여 선택'}
            </p>
            <p className="text-sm text-gray-400">PDF 파일만 지원 · 용량 제한 없음</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5
                            text-sm text-red-600 ring-1 ring-red-200">
              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-8-5a.75.75 0 0 1 .75.75v4.5a
                     .75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                  clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </>
      )}
    </div>
  )
}
