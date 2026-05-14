import { useState, useEffect } from 'react'

export function useWatermark() {
  const [watermarkText, setWatermarkText] = useState('© 작성자명')
  const [fontSize, setFontSize] = useState(60)
  const [opacity, setOpacity] = useState(20)
  const [color, setColor] = useState('#888888')
  const [fontFamily, setFontFamily] = useState('Montserrat')
  const [fontWeight, setFontWeight] = useState('800')
  const [angle, setAngle] = useState(-30)
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    console.log('[1] useWatermark fontFamily:', fontFamily)
  }, [fontFamily])

  return {
    watermarkText, setWatermarkText,
    fontSize, setFontSize,
    opacity, setOpacity,
    color, setColor,
    fontFamily, setFontFamily,
    fontWeight, setFontWeight,
    angle, setAngle,
    position, setPosition,
  }
}
