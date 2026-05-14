import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
// ?url 으로 Vite가 올바른 버전의 워커 파일 URL을 빌드 시 해석하게 한다.
// public/pdf.worker.min.js 같은 하드코딩 경로는 버전 불일치 위험이 있다.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

/**
 * @param {{
 *   canvasRef: React.RefObject<HTMLCanvasElement>,
 *   containerRef: React.RefObject<HTMLElement>,
 *   pdfBuffer: ArrayBuffer | null,
 *   pageNumber: number,
 * }} params
 * @returns {{ totalPages: number, isLoading: boolean, error: Error | null }}
 */
export function usePdfPreview({ canvasRef, containerRef, pdfBuffer, pageNumber = 1 }) {
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [docVersion, setDocVersion] = useState(0)
  const pdfDocRef = useRef(null)
  const renderTaskRef = useRef(null)

  // PDF 문서 로드
  useEffect(() => {
    if (!pdfBuffer) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    // pdfjs는 ArrayBuffer를 Worker로 transfer(전송)해 원본을 neutered(무효화)시킨다.
    // slice(0)으로 복사본을 넘겨 원본을 보존한다.
    // React StrictMode의 effect 이중 실행에서도 두 번째 호출이 안전하게 동작한다.
    const task = pdfjsLib.getDocument({ data: pdfBuffer.slice(0) })

    task.promise
      .then((pdf) => {
        if (cancelled) return
        pdfDocRef.current?.destroy()
        pdfDocRef.current = pdf
        setTotalPages(pdf.numPages)
        setDocVersion((v) => v + 1)
        setIsLoading(false)
      })
      .catch((err) => {
        if (cancelled) return // task.destroy()에 의한 rejection 무시
        setError(err)
        setIsLoading(false)
      })

    return () => {
      cancelled = true
      task.destroy() // 진행 중인 로드 태스크 취소 (cancelled=true 이후 설정으로 rejection 무시됨)
    }
  }, [pdfBuffer])

  // 페이지 렌더링
  useEffect(() => {
    const pdf = pdfDocRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!pdf || !canvas || !container) return

    let cancelled = false

    const render = async () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }

      try {
        const page = await pdf.getPage(pageNumber)
        if (cancelled) return

        const containerWidth = container.clientWidth
        const baseViewport = page.getViewport({ scale: 1 })
        const scale = containerWidth / baseViewport.width
        const viewport = page.getViewport({ scale })

        canvas.width = viewport.width
        canvas.height = viewport.height

        const task = page.render({
          canvasContext: canvas.getContext('2d'),
          viewport,
        })
        renderTaskRef.current = task

        await task.promise
        renderTaskRef.current = null
      } catch (err) {
        if (err?.name === 'RenderingCancelledException') return
        if (!cancelled) setError(err)
      }
    }

    render()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
        renderTaskRef.current = null
      }
    }
  }, [docVersion, pageNumber, canvasRef, containerRef])

  // 언마운트 시 문서 해제
  useEffect(() => {
    return () => {
      pdfDocRef.current?.destroy()
      pdfDocRef.current = null
    }
  }, [])

  return { totalPages, isLoading, error }
}
