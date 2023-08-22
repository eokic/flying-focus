(function () {
  if (!window.addEventListener) return

  // Don't init the script if the user has reduced motion enabled
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)')?.matches)
    return

  const DURATION = 500

  let ringElem = null
  let movingId = 0
  let prevFocused = null
  let keyDownTime = 0

  const win = window
  const doc = document
  const docElem = doc.documentElement
  const { body } = doc

  docElem.addEventListener('keydown', event => {
    const code = event.which

    // Show animation only upon Tab or Arrow keys press.
    if (code === 9 || (code > 36 && code < 41))
      keyDownTime = Date.now()
  }, false)


  docElem.addEventListener('focus', event => {
    const { target } = event
    if (target.id === 'flying-focus')
      return

    let isFirstFocus = false
    if (!ringElem) {
      isFirstFocus = true
      initialize()
    }

    if (isFirstFocus || !isJustPressed())
      return

    const offset = offsetOf(target)
    ringElem.style.left = offset.left + 'px'
    ringElem.style.top = offset.top + 'px'
    ringElem.style.width = target.offsetWidth + 'px'
    ringElem.style.height = target.offsetHeight + 'px'

    // Adds border-radius to the ring element
    // Should animate towards the target's border-radius
    const targetBorderRadius = getComputedStyle(target).borderRadius.match(/^([\d.]+)([a-zA-Z]+)?$/)
    ringElem.style.borderRadius = targetBorderRadius?.[1] && (parseInt(targetBorderRadius[1], 10) > 12)
      ? targetBorderRadius[1] + targetBorderRadius[2]
      : 'var(--focus-sr-radius, 6px)'

    onEnd()
    target.classList.add('flying-focus_target')
    ringElem.classList.add('flying-focus_visible')
    prevFocused = target
    movingId = setTimeout(onEnd, DURATION)
  }, true)


  docElem.addEventListener('blur', () => {
    onEnd()
  }, true)


  function initialize () {
    ringElem = doc.createElement('flying-focus') // use uniq element name to decrease the chances of a conflict with website styles
    ringElem.id = 'flying-focus'
    body.appendChild(ringElem)
  }


  function onEnd () {
    if (!movingId) return
    clearTimeout(movingId)
    movingId = 0
    ringElem.classList.remove('flying-focus_visible')
    prevFocused.classList.remove('flying-focus_target')
    prevFocused = null
  }


  function isJustPressed () {
    return Date.now() - keyDownTime < 42
  }


  function offsetOf (elem) {
    const rect = elem.getBoundingClientRect()
    const clientLeft = docElem.clientLeft || body.clientLeft
    const clientTop = docElem.clientTop || body.clientTop
    const scrollLeft = win.pageXOffset || docElem.scrollLeft || body.scrollLeft
    const scrollTop = win.pageYOffset || docElem.scrollTop || body.scrollTop
    const left = rect.left + scrollLeft - clientLeft
    const top = rect.top + scrollTop - clientTop
    return {
      top: top || 0,
      left: left || 0,
    }
  }
}())
