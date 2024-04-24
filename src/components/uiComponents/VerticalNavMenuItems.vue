<template>
  <ul>
    <component
      :is="resolveNavItemComponent(item)"
      v-for="item in items"
      :key="item.header || item.title"
      :item="item"
    />
  </ul>
</template>

<script>
import { resolveVerticalNavMenuItemComponent as resolveNavItemComponent } from './js/utils'
import { provide, ref } from 'vue'
import VerticalNavMenuLink from './VerticalNavMenuLink.vue'
import VerticalNavMenuHeader from './js/verticalNavMenuHeader'
import VerticalNavMenuGroup from './VerticalNavMenuGroup.vue'


export default {
  components: {
   VerticalNavMenuHeader,
   VerticalNavMenuLink,
   VerticalNavMenuGroup,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  setup() {
    provide('openGroups', ref([]))

    return {
      resolveNavItemComponent,
    }
  },
}
</script>
