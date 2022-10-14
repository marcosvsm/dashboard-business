import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import BaseFeatherIcon from '../BaseFeatherIcon.vue'
//import { useUtils as useAclUtils } from '@core/libs/acl'
const { t } = useI18nUtils()
//const { canViewVerticalNavMenuHeader } = useAclUtils()
export default {
  components:{
    BaseFeatherIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  render(h) {
    const span = h('span', {}, t(this.item.header))
    const icon = h('base-feather-icon', { props: { icon: 'MoreHorizontalIcon', size: '18' } })
 //   if (canViewVerticalNavMenuHeader(this.item)) {
    if (this.item) {
      return h('li', { class: 'navigation-header text-truncate' }, [span, icon])
    }
    return h()
  },
}
