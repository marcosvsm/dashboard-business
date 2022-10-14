<template>
<!--
  <li
    v-if="canViewVerticalNavMenuLink(item)"
    class="nav-item"
    :class="{
      'active': isActive,
      'disabled': item.disabled
    }"
  >
-->
  <li
    v-if="item"
    class="nav-item"
    :class="{
      'active': isActive,
      'disabled': item.disabled
    }"
  >
    <b-link
      v-bind="linkProps"
      class="d-flex align-items-center"
    >
      <base-feather-icon :icon="item.icon || 'CircleIcon'" />
      <span class="menu-title text-truncate">{{ t(item.title) }}</span>
      <b-badge
        v-if="item.tag"
        pill
        :variant="item.tagVariant || 'primary'"
        class="mr-1 ml-auto"
      >
        {{ item.tag }}
      </b-badge>
    </b-link>
  </li>
</template>

<script>
import useVerticalMenuLink from './js/useVerticalNavMenuLink'
import mixinVerticalMenuLink from './js/mixinVerticalNavMenuLink'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import BaseFeatherIcon from './BaseFeatherIcon.vue'

export default {
  components:{
    BaseFeatherIcon,
  },
  mixins: [mixinVerticalMenuLink],
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { isActive, linkProps, updateIsActive } = useVerticalMenuLink(props.item)
    //t === translate
    const { t } = useI18nUtils()

    return {
      isActive,
      linkProps,
      updateIsActive,
      t,
    }
  },

}
</script>
