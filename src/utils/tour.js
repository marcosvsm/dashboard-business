// src/utils/tour.js
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/assets/css/tour.css'
import confetti from 'canvas-confetti'
import i18n from '@/libs/i18n'

let finishCallback = null
let closeCallback = null
let langClickHandler = null
let mobileMenuOpenedByTour = false

const NAV_STEP_SELECTORS = [
  '[data-tour-target="nav-my-business"]',
  '[data-tour-target="nav-business"]',
  '[data-tour-target="nav-clients"]',
  '[data-tour-target="nav-finance"]',
  '[data-tour-target="nav-invoice"]',
]

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 1200

const isMenuOpen = () => {
  const layout = document.querySelector('.vertical-layout')
  return layout ? layout.classList.contains('menu-open') : true
}

const openMobileMenu = () => {
  if (!isMobile() || isMenuOpen()) return
  const toggler = document.querySelector('.d-xl-none .nav-link')
  if (toggler) {
    toggler.click()
    mobileMenuOpenedByTour = true
  }
}

const closeMobileMenu = () => {
  if (!mobileMenuOpenedByTour) return
  const layout = document.querySelector('.vertical-layout')
  if (layout && layout.classList.contains('menu-open')) {
    const toggler = document.querySelector('.d-xl-none .nav-link')
    if (toggler) toggler.click()
  }
  mobileMenuOpenedByTour = false
}
const clickElement = target => {
  if (!target) return
  target.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

const ensureElementVisible = (selectorOrEl, offset = 0) => {
  if (typeof document === 'undefined' || !selectorOrEl) return null
  const target = typeof selectorOrEl === 'string'
    ? document.querySelector(selectorOrEl)
    : selectorOrEl
  if (target) {
    const rect = target.getBoundingClientRect()
    const needsScroll = rect.top < offset || rect.bottom > window.innerHeight
    if (needsScroll && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
  return target
}

const expandNavGroups = element => {
  if (typeof document === 'undefined' || !element || !element.classList) return
  let current = element.classList.contains('nav-item') ? element : element.closest('.nav-item')
  while (current) {
    if (current.classList.contains('has-sub') && !current.classList.contains('open')) {
      const toggler = Array.from(current.children || []).find(child => child.classList?.contains('d-flex'))
      clickElement(toggler)
    }
    current = current.parentElement?.closest('.nav-item.has-sub') || null
  }
}

/*const watchDropdownMenu = (callback) => {
  const menuSelector = '#language-modal'  // Update this selector to match your dropdown menu

  const checkAndCallback = () => {
    const menu = document.querySelector(menuSelector)
    if (menu && window.getComputedStyle(menu).display !== 'none') {
      callback(menu)
      return true
    }
    return false
  }

  if (checkAndCallback()) return

  const observer = new MutationObserver(() => {
    if (checkAndCallback()) {
      observer.disconnect()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  })

  setTimeout(() => {
    observer.disconnect()
    checkAndCallback()
  }, 5000)
}
*/
const fireConfetti = () => {
  confetti({
    particleCount: 180,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#667eea', '#764ba2', '#f093fb'],
  })
}

const driverObj = driver({
  showProgress: true,
  allowClose: true,
  overlayColor: 'rgba(0,0,0,0.75)',
  stagePadding: 12,
  stageRadius: 8,
  doneBtnText: '✨ Finish Tour',
  nextBtnText: 'Next →',
  prevBtnText: '← Back',
  closeBtnText: '✕',
  onDestroyStarted: () => {
    const completed = !driverObj.hasNextStep()
    closeMobileMenu()
    if (completed) {
      fireConfetti()
      if (typeof finishCallback === 'function') finishCallback()
    } else {
      if (typeof closeCallback === 'function') closeCallback()
    }
    finishCallback = null
    closeCallback = null
    driverObj.destroy()
  },
  onHighlightStarted: (element, step) => {
    if (typeof document === 'undefined') return

    // On mobile, open the side menu before highlighting any nav item
    const isNavStep = step?.element && NAV_STEP_SELECTORS.some(sel => step.element === sel)
    if (isNavStep && isMobile() && !isMenuOpen()) {
      openMobileMenu()
      // Wait for the slide-in transition (300ms) before driver.js positions the spotlight
      setTimeout(() => driverObj.refresh(), 350)
    }

    const target = step?.element ? ensureElementVisible(step.element) : element
    if (target) {
      expandNavGroups(target)
    }

    if (step?.element === '#nav-link-language') {  // First language step
      document.body.classList.add('tour-language-active');
const langBtn = document.querySelector('#nav-link-language')
      if (langBtn) {
        langClickHandler = () => {
          langClickHandler = null
          setTimeout(() => driverObj.moveNext(), 300)
        }
        langBtn.addEventListener('click', langClickHandler, { once: true })
      }
     /* watchDropdownMenu((menuEl) => {
        document.body.classList.add('tour-language-open');
        ensureElementVisible(menuEl, 180);

        // Auto-advance to the NEXT step (menu highlight) when menu appears
        setTimeout(() => {
          driverObj.moveNext();
        }, 300);  // small delay for positioning to settle
      });*/
    }

    // Step 2: language modal – advance automatically when user picks a language
    if (step?.element === '#language-modal') {
      const menuEl = document.querySelector('#language-modal')
      if (menuEl) {
        const handleSelection = () => {
          setTimeout(() => driverObj.moveNext(), 400)
        }
        menuEl.querySelectorAll('[data-locale]').forEach(opt => {
          opt.addEventListener('click', handleSelection, { once: true })
        })
      }
    }

    // Run custom per-step hook if defined
    if (step?.onHighlightStarted) {
      step.onHighlightStarted(element, step)
    }
  },
  onDeselected: (element, step) => {
    if (langClickHandler) {
      const langBtn = document.querySelector('#nav-link-language')
      if (langBtn) langBtn.removeEventListener('click', langClickHandler)
      langClickHandler = null
    }
    // Cleanup language tour classes
    document.body.classList.remove('tour-language-active', 'tour-language-open')

    // Close the mobile menu if the tour opened it and we're leaving the last nav step
    const wasNavStep = step?.element && NAV_STEP_SELECTORS.some(sel => step.element === sel)
    if (wasNavStep) {
      const steps = driverObj.getConfig().steps || []
      const nextIndex = (driverObj.getActiveIndex() ?? -1) + 1
      const nextStep = steps[nextIndex] ?? null
      const nextIsNavStep = nextStep?.element && NAV_STEP_SELECTORS.some(sel => nextStep.element === sel)
      if (!nextIsNavStep) closeMobileMenu()
    }

    if (step?.onDeselected) {
      step.onDeselected(element, step)
    }
  },
})

export const runSpotlightTour = (steps, { startAt = 0, onFinish, onClose } = {}) => {
  finishCallback = typeof onFinish === 'function' ? onFinish : null
  closeCallback = typeof onClose === 'function' ? onClose : null
  const translatedSteps = steps.map(step => ({
    ...step,
    popover: step.popover
      ? {
          ...step.popover,
          title: step.popover.title ? i18n.t(step.popover.title) : '',
          description: step.popover.description ? i18n.t(step.popover.description) : '',
        }
      : undefined,
  }))

  driverObj.setSteps(translatedSteps)


  const safeIndex = Number.isInteger(startAt) ? Math.max(0, startAt) : 0
  driverObj.drive(safeIndex)
}

export const stopSpotlightTour = () => {
  finishCallback = null
  closeCallback = null
  driverObj.destroy()
}

export default driverObj