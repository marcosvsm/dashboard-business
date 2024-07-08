import { $themeBreakpoints } from '@/themeConfig'

export default {
  watch: {
    $route() {
      if (this.$store.state.app.windowWidth < $themeBreakpoints.xl) {
        this.isVerticalMenuActive = false
      }
      // Utility function to check if the device is mobile
    const isMobile = () => this.$store.state.app.windowWidth <= 1199
    // Close the menu when the route changes, only on mobile devices
    if (isMobile()) {
      this.isVerticalMenuActive = false
    }
    },
  },
}
