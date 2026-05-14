import { useState } from 'react'

// ── iOS 공유 아이콘 (Safari 스타일) ─────────────────────────────────
function IosSafariShareIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
    </svg>
  )
}

// ── iOS 설치 안내 모달 ────────────────────────────────────────────────
function IosGuideModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 아이콘 */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center
                        rounded-2xl bg-blue-50 text-blue-600">
          <IosSafariShareIcon className="h-7 w-7" />
        </div>

        <h2 className="mb-1.5 text-center text-lg font-bold text-gray-900">
          홈 화면에 추가
        </h2>
        <p className="mb-5 text-center text-sm text-gray-500">
          앱처럼 설치하면 더 빠르게 실행할 수 있어요
        </p>

        {/* 단계 */}
        <ol className="space-y-3.5 text-sm">
          <li className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center
                             rounded-full bg-blue-600 text-xs font-bold text-white">
              1
            </span>
            <span className="text-gray-700">
              Safari 하단{' '}
              <span className="inline-flex items-center gap-0.5 rounded-md bg-gray-100
                               px-1.5 py-0.5 align-middle">
                <IosSafariShareIcon className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-medium text-gray-600">공유</span>
              </span>{' '}
              버튼을 탭하세요
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center
                             rounded-full bg-blue-600 text-xs font-bold text-white">
              2
            </span>
            <span className="text-gray-700">
              <span className="font-semibold">"홈 화면에 추가"</span>를 선택하세요
            </span>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white
                     hover:bg-blue-700 active:bg-blue-800 transition-colors min-h-[44px]"
        >
          확인
        </button>
      </div>
    </div>
  )
}

// ── PC / Android 설치 버튼 ────────────────────────────────────────────
function InstallButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl
                 border border-violet-300 bg-violet-50 px-4 py-3
                 text-sm font-medium text-violet-700 min-h-[44px]
                 hover:bg-violet-100 active:bg-violet-200 transition-colors"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      바탕화면에 설치
    </button>
  )
}

// ── iOS 안내 트리거 버튼 ─────────────────────────────────────────────
function IosInstallButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl
                 border border-blue-300 bg-blue-50 px-4 py-3
                 text-sm font-medium text-blue-700 min-h-[44px]
                 hover:bg-blue-100 active:bg-blue-200 transition-colors"
    >
      <IosSafariShareIcon className="h-5 w-5" />
      홈 화면에 추가
    </button>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────
export default function PwaInstallBanner({ canInstall, showIosGuide, onInstall }) {
  const [modalOpen, setModalOpen] = useState(false)

  if (canInstall) {
    return <InstallButton onClick={onInstall} />
  }

  if (showIosGuide) {
    return (
      <>
        <IosInstallButton onClick={() => setModalOpen(true)} />
        {modalOpen && <IosGuideModal onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  return null
}
