<!-- src/components/views/pages/Loading.vue -->
<template>
  <div class="loading">
    <span class="brand-logo">
      <b-img
        :src="appLogoImage"
        alt="logo"
      />
    </span>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { $themeConfig } from '@/themeConfig'
export default {
  name: "Loading",
  computed: {
    appLogoImage(){
      return $themeConfig?.app?.appLogoImage || '';
    }
  },

};
</script>
<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: #333;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px; /* Aumentei o espaço pro logo ficar mais centralizado */
}
.brand-logo {
  margin-top: 0; /* Sem espaço extra acima */
}
.brand-logo img {
  height: 60px; /* Tamanho compacto pro logo, ajustável pro seu (FB usa ~32-40px) */
  width: auto; /* Mantém proporção */
}
</style>
