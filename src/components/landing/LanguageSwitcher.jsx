import { useEffect, useId, useRef, useState } from 'react'
import { LANGUAGES } from '../../app/copy.js'
import Icon from '../Icon.jsx'

export default function LanguageSwitcher({ language, label, onChange, onOpen }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const wrapperRef = useRef(null)
  const triggerRef = useRef(null)
  const optionsRef = useRef([])
  const focusIndexRef = useRef(0)
  const current = LANGUAGES.find((item) => item.code === language)

  useEffect(() => {
    if (!open) return
    optionsRef.current[focusIndexRef.current]?.focus()
    const dismiss = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  const openMenu = (index = LANGUAGES.indexOf(current)) => {
    focusIndexRef.current = index
    setOpen(true)
    onOpen?.()
  }

  const handleKeyDown = (event) => {
    if (!open) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
    if (!direction && !['Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const index = optionsRef.current.indexOf(document.activeElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? LANGUAGES.length - 1 : (index + direction + LANGUAGES.length) % LANGUAGES.length
    optionsRef.current[next]?.focus()
  }

  return <div className="lp-language" ref={wrapperRef} onKeyDown={handleKeyDown} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }}>
    <button ref={triggerRef} className="lp-language-trigger" type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => open ? setOpen(false) : openMenu()} onKeyDown={(event) => {
      if (!open && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        event.stopPropagation()
        openMenu(event.key === 'ArrowDown' ? 0 : LANGUAGES.length - 1)
      }
    }}><Icon name="globe" size={14} /><span lang={language}>{current.label}</span><Icon name="chevron" size={10} /></button>
    {open && <div className="lp-language-menu" id={menuId} role="menu" aria-label={label}>
      {LANGUAGES.map(({ code, label: optionLabel }, index) => <button key={code} ref={(node) => { optionsRef.current[index] = node }} type="button" role="menuitemradio" aria-checked={language === code} lang={code} tabIndex={-1} data-language={code} onClick={() => {
        onChange(code)
        setOpen(false)
        triggerRef.current?.focus()
      }}><span>{optionLabel}</span>{language === code && <Icon name="check" size={12} />}</button>)}
    </div>}
  </div>
}
