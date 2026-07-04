<template>
  <b-card no-body class="skeleton-card" :class="cardClass">
    <b-card-body :class="bodyClass">
      <slot />
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  name: 'SkeletonCard',
  props: {
    cardClass: { type: [String, Array, Object], default: '' },
    bodyClass: { type: [String, Array, Object], default: '' },
  },
}
</script>

<style scoped>
.skeleton-card {
  border: 1px solid #e6edf7;
  border-radius: 0.428rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  background: #fff;
}
</style>
