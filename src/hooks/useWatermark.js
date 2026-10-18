import { useState, useEffect } from 'react'

export function useWatermark() {
  const [watermarkText, setWatermarkText] = useState('Yull2T MUSIC')
  const [fontSize, setFontSize] = useState(65)
  const [opacity, setOpacity] = useState(25)
  const [color, setColor] = useState('#888888')
  const [fontFamily, setFontFamily] = useState('Apple SD Gothic Neo')
  const [fontWeight, setFontWeight] = useState('900')
  const [angle, setAngle] = useState(-50)
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
