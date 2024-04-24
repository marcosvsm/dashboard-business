<template>
  <li
    v-if="item"
    class="nav-item has-sub"
    :class="{
      'open': isOpen,
      'disabled': item.disabled,
      'vertical-group-active': isActive,
    }"
  >
    <b-link
      class="d-flex align-items-center"
      @click="() => updateGroupOpen(!isOpen)"
    >
      <base-feather-icon :icon="item.icon || 'CircleIcon'"/>
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
    <b-collapse
      v-model="isOpen"
      class="menu-content"
      tag="ul"
    >
      <component
        :is="resolveNavItemComponent(child)"
        v-for="child in item.children"
        :key="child.header || child.title"
        ref="groupChild"
        :item="child"
      />
    </b-collapse>
  </li>
</template>

<script>
import { resolveVerticalNavMenuItemComponent as resolveNavItemComponent } from './js/utils'
import VerticalNavMenuHeader from './js/verticalNavMenuHeader'
import VerticalNavMenuLink from './VerticalNavMenuLink.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'
import BaseFeatherIcon from './BaseFeatherIcon.vue'

// Composition Function
import useVerticalMenuGroup from './js/useVerticalNavMenuGroup'
import mixinVerticalMenuGroup from './js/mixinVerticalNavMenuGroup'

export default {
  name: 'VerticalNavMenuGroup',
  components: {
    VerticalNavMenuHeader,
    VerticalNavMenuLink,
    BaseFeatherIcon,
  },
  mixins: [mixinVerticalMenuGroup],
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const {
      isOpen,
      isActive,
      updateGroupOpen,
      updateIsActive,
    } = useVerticalMenuGroup(props.item)
    
    //t === translate
    const { t } = useI18nUtils()
 //   const { canViewVerticalNavMenuGroup } = useAclUtils()

    return {
      resolveNavItemComponent,
      isOpen,
      isActive,
      updateGroupOpen,
      updateIsActive,
      t,

      // ACL
//      canViewVerticalNavMenuGroup,

    }
  },
}
</script>

<style>

</style>
