"use client"

import { useEffect, useState } from "react"
import styles from "./CustomCursor.module.css"

const CustomCursor = () => {
  const [isClicking, setIsClicking] = useState(false)
  const [isHoveringLink, setIsHoveringLink] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    const handleLinkHoverStart = () => setIsHoveringLink(true)
    const handleLinkHoverEnd = () => setIsHoveringLink(false)

    document.addEventListener("mousemove", updatePosition)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)

    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]')

    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", handleLinkHoverStart)
      element.addEventListener("mouseleave", handleLinkHoverEnd)
    })

    document.body.style.cursor = "none"

    return () => {
      document.removeEventListener("mousemove", updatePosition)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)

      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleLinkHoverStart)
        element.removeEventListener("mouseleave", handleLinkHoverEnd)
      })

      document.body.style.cursor = "auto"
    }
  }, [])

  return (
    <>
      <div
        className={`${styles.cursorOuter} ${isClicking ? styles.clicking : ""} ${
          isHoveringLink ? styles.hovering : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div
        className={`${styles.cursorInner} ${isClicking ? styles.clicking : ""} ${
          isHoveringLink ? styles.hovering : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div
        className={`${styles.cursorTrail} ${isClicking ? styles.clicking : ""} ${
          isHoveringLink ? styles.hovering : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  )
}

export default CustomCursor

