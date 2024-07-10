<template>
    <b-row class="justify-content-left flex-nowrap overflow-auto">
      <b-col
        v-for="(item, index) in navMenuItems"
        :key="index"
        class="flex-shrink-0"
      >
        <router-link :to="item.route" class="nav-link-button">
            {{ t(item.name) }}
        </router-link>
      </b-col>
    </b-row>
</template>

<script>
import { ref, onMounted } from 'vue';
import router from '@/router'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  props:{
        name: String,
        route: String,
  },
  setup(props){
    const navMenuItems = ref([]);
    
    onMounted(() => {
        const resolvedRoute = router.resolve({name: props.route});
        navMenuItems.value.push({
            name: props.name,
            route: resolvedRoute.href,
        });
    });
    const {t} = useI18nUtils()

    return {
        navMenuItems,
        t
    }
  },
};
</script>

<style lang="scss">
@import '~@/scss/vue/libs/vue-flatpicker.scss';


.b-row {
  white-space: nowrap;
}

.nav-link-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin: 5px;
  font-size: 0.9rem;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 0.25rem;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #007bff;
    color: white;
  }
}

@media (max-width: 576px) {
  .nav-link-button {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style>
