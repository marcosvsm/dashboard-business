// src/utils/tour.js
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/assets/css/tour.css'
import confetti from 'canvas-confetti'

let finishCallback = null

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
    if (!driverObj.hasNextStep()) {
      fireConfetti()
      if (typeof finishCallback === 'function') {
        finishCallback()
      }
    }
    finishCallback = null
  },
  onHighlightStarted: (element, step) => {
    if (typeof document === 'undefined') return

    const target = step?.element ? ensureElementVisible(step.element) : element
    if (target) {
      expandNavGroups(target)
    }

    if (step?.element === '#nav-link-language') {  // First language step
      document.body.classList.add('tour-language-active');

     /* watchDropdownMenu((menuEl) => {
        document.body.classList.add('tour-language-open');
        ensureElementVisible(menuEl, 180);

        // Auto-advance to the NEXT step (menu highlight) when menu appears
        setTimeout(() => {
          driverObj.moveNext();
        }, 300);  // small delay for positioning to settle
      });*/
    }

   // For the second step (menu):
    /*if (step?.element === '#language-modal') {
      const menuEl = document.querySelector('#language-modal');
      if (menuEl) {
        menuEl.classList.add('driver-active-element');

        const handleSelection = () => {
          document.body.classList.remove('tour-language-open');
          menuEl.classList.remove('driver-active-element');
          setTimeout(() => driverObj.moveNext(), 600);
        };

        menuEl.querySelectorAll('[data-locale]').forEach(opt => {
          opt.addEventListener('click', handleSelection, { once: true });
        });
      }
    }*/

    // Run custom per-step hook if defined
    if (step?.onHighlightStarted) {
      step.onHighlightStarted(element, step)
    }
  },
  onDeselected: (element, step) => {
    // Cleanup language tour classes
    document.body.classList.remove('tour-language-active', 'tour-language-open')

    if (step?.onDeselected) {
      step.onDeselected(element, step)
    }
  },
})

export const runSpotlightTour = (steps, { startAt = 0, onFinish } = {}) => {
  finishCallback = typeof onFinish === 'function' ? onFinish : null

  driverObj.setSteps(steps)

  const safeIndex = Number.isInteger(startAt) ? Math.max(0, startAt) : 0
  driverObj.drive(safeIndex)
}

export const stopSpotlightTour = () => {
  finishCallback = null
  driverObj.destroy()
}

export default driverObj