import { useState } from 'react'
import { FONT_LIST } from '../utils/fonts'

const SYSTEM_FONTS = [
  { label: '맑은 고딕',     family: 'Malgun Gothic' },       // Windows
  { label: 'Apple SD 고딕', family: 'Apple SD Gothic Neo' }, // macOS / iOS
  { label: '바탕',          family: 'Batang' },              // Windows
  { label: 'Apple 명조',    family: 'AppleMyungjo' },        // macOS
  { label: '돋움',          family: 'Dotum' },               // Windows
  { label: '굴림',          family: 'Gulim' },               // Windows
]

const WEIGHTS = [
  { label: '가늘게',   value: '300' },
  { label: '보통',     value: '400' },
  { label: '굵게',     value: '700' },
  { label: '매우굵게', value: '900' },
]

// ── 공통 스타일 ─────────────────────────────────────────────────
const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[16px] md:text-sm text-gray-800 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors'

function Label({ children, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{children}</span>
      {value !== undefined && (
        <span className="text-xs text-gray-400 tabular-nums">{value}</span>
      )}
    </div>
  )
}

function Slider({ min, max, value, onChange }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-blue-500 cursor-pointer"
    />
  )
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────
export default function ControlPanel({
  watermarkText, setWatermarkText,
  fontFamily,    setFontFamily,
  fontWeight,    setFontWeight,
  color,         setColor,
  fontSize,      setFontSize,
  angle,         setAngle,
  opacity,       setOpacity,
  setPosition,
  fileName,
  totalPages,
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <aside className="w-full md:w-72 shrink-0">
      {/* ── 헤더 (모바일 토글 포함) ── */}
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm
                   ring-1 ring-gray-200 md:cursor-default md:pointer-events-none"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-800">워터마크 설정</span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 md:hidden
                      ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414
               1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd" />
        </svg>
      </button>

      {/* ── 컨트롤 패널 본문 ── */}
      <div
        className={`mt-2 space-y-4 rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-gray-200
                    ${isOpen ? 'block' : 'hidden'} md:block`}
      >
        {/* 파일 정보 */}
        {fileName && (
          <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
            <p className="font-medium text-gray-700 truncate" title={fileName}>{fileName}</p>
            {totalPages > 0 && (
              <p className="mt-0.5 text-xs text-gray-400">{totalPages}페이지</p>
            )}
          </div>
        )}

        {/* 1. 워터마크 텍스트 */}
        <div className="space-y-1.5">
          <Label>워터마크 텍스트</Label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="텍스트를 입력하세요"
            className={inputCls}
          />
        </div>

        {/* 2. 글꼴 */}
        <div className="space-y-1.5">
          <Label>글꼴</Label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className={inputCls}
          >
            <optgroup label="시스템 폰트">
              {SYSTEM_FONTS.map((f) => (
                <option key={f.family} value={f.family}>{f.label}</option>
              ))}
            </optgroup>
            <optgroup label="웹 폰트">
              {FONT_LIST.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.label}{f.family === 'Montserrat' ? ' ★' : ''}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* 3. 굵기 */}
        <div className="space-y-1.5">
          <Label>굵기</Label>
          <select
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value)}
            className={inputCls}
          >
            {WEIGHTS.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </div>

        {/* 4. 색상 */}
        <div className="flex items-center justify-between">
          <Label>색상</Label>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-400 font-mono uppercase">{color}</span>
            <span
              className="h-8 w-8 rounded-md border border-gray-300 shadow-sm overflow-hidden"
              style={{ backgroundColor: color }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="opacity-0 w-full h-full cursor-pointer"
              />
            </span>
          </label>
        </div>

        {/* 5. 크기 */}
        <div className="space-y-1.5">
          <Label value={fontSize}>크기</Label>
          <Slider min={20} max={150} value={fontSize} onChange={setFontSize} />
        </div>

        {/* 6. 각도 */}
        <div className="space-y-1.5">
          <Label value={`${angle}°`}>각도</Label>
          <Slider min={-90} max={90} value={angle} onChange={setAngle} />
        </div>

        {/* 7. 불투명도 */}
        <div className="space-y-1.5">
          <Label value={`${opacity}%`}>불투명도</Label>
          <Slider min={5} max={80} value={opacity} onChange={setOpacity} />
        </div>

        {/* 8. 중앙으로 */}
        <button
          type="button"
          onClick={() => setPosition({ x: 0.5, y: 0.5 })}
          className="w-full min-h-[44px] rounded-lg border border-gray-200 py-2 text-sm text-gray-600
                     hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          중앙으로 ⊕
        </button>
      </div>
    </aside>
  )
}
