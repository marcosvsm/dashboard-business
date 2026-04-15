const MOBILE_DOCK_BREAKPOINT = 991
const MOBILE_DOCK_SCROLL_THRESHOLD = 80
const MOBILE_HEADER_TOP_THRESHOLD = 40
const MOBILE_HEADER_SCROLL_TOLERANCE = 12

export {
  MOBILE_DOCK_BREAKPOINT,
  MOBILE_DOCK_SCROLL_THRESHOLD,
  MOBILE_HEADER_TOP_THRESHOLD,
  MOBILE_HEADER_SCROLL_TOLERANCE,
}

export default {
  data() {
    return {
      mobileDockScrollY: 0,
      mobileDockLastScrollY: 0,
      isMobileMoreSheetOpen: false,
      isHeaderVisible: true,
    }
  },
  computed: {
    mobileDockWindowWidth() {
      const windowWidth = this.$store?.state?.app?.windowWidth
      if (windowWidth) return windowWidth
      if (typeof window !== 'undefined') return window.innerWidth
      return 0
    },
    isMobileDockViewport() {
      return this.mobileDockWindowWidth <= MOBILE_DOCK_BREAKPOINT
    },
    isProtectedLayoutRoute() {
      return this.$route.meta.layout !== 'full' && !!this.$store.getters['auth/isAuthenticated']
    },
    canRenderMobileDock() {
      return this.isMobileDockViewport && this.isProtectedLayoutRoute
    },
    isMobileDockVisible() {
      return this.canRenderMobileDock && this.mobileDockScrollY > MOBILE_DOCK_SCROLL_THRESHOLD
    },
    isCompactMobileHeader() {
      return this.canRenderMobileDock && (this.isMobileDockVisible || this.isMobileMoreSheetOpen)
    },
  },
  watch: {
    $route() {
      this.closeMobileMoreSheet()
      this.syncMobileDockState()
    },
    canRenderMobileDock(value) {
      if (!value) {
        this.closeMobileMoreSheet()
        this.isHeaderVisible = true
      }
      this.syncMobileDockState()
    },
    isMobileMoreSheetOpen: {
      immediate: true,
      handler(isOpen) {
        if (typeof document === 'undefined') return

        document.body.classList.toggle('mobile-more-sheet-open', !!isOpen)
      },
    },
  },
  mounted() {
    if (typeof window === 'undefined') return

    this.syncMobileDockState()
    window.addEventListener('scroll', this.handleMobileDockScroll, { passive: true })
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleMobileDockScroll)
    }
    if (typeof document !== 'undefined') {
      document.body.classList.remove('mobile-more-sheet-open')
    }
  },
  methods: {
    handleMobileDockScroll() {
      const currentScrollY = window.pageYOffset
        || document.documentElement.scrollTop
        || document.body.scrollTop
        || 0

      if (!this.canRenderMobileDock) {
        this.mobileDockScrollY = 0
        this.mobileDockLastScrollY = currentScrollY
        this.isHeaderVisible = true
        return
      }

      const scrollDelta = currentScrollY - this.mobileDockLastScrollY

      if (currentScrollY <= MOBILE_HEADER_TOP_THRESHOLD) {
        this.isHeaderVisible = true
      } else if (scrollDelta > MOBILE_HEADER_SCROLL_TOLERANCE) {
        this.isHeaderVisible = false
      } else if (scrollDelta < -MOBILE_HEADER_SCROLL_TOLERANCE) {
        this.isHeaderVisible = true
      }

      this.mobileDockScrollY = currentScrollY
      this.mobileDockLastScrollY = currentScrollY
    },
    syncMobileDockState() {
      this.handleMobileDockScroll()
    },
    openMobileMoreSheet() {
      if (!this.canRenderMobileDock) return

      this.isMobileMoreSheetOpen = true
    },
    closeMobileMoreSheet() {
      this.isMobileMoreSheetOpen = false
    },
    toggleMobileMoreSheet() {
      if (this.isMobileMoreSheetOpen) {
        this.closeMobileMoreSheet()
        return
      }

      this.openMobileMoreSheet()
    },
  },
}
