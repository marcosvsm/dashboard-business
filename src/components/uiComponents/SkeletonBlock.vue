<template>
  <component
    :is="tag"
    class="skeleton-block"
    :class="{ 'skeleton-block--light': light }"
    :style="style"
    aria-hidden="true"
  />
</template>

<script>
export default {
  name: 'SkeletonBlock',
  props: {
    width: { type: String, default: '100%' },
    height: { type: String, default: '1rem' },
    radius: { type: String, default: '0.4rem' },
    circle: { type: Boolean, default: false },
    light: { type: Boolean, default: false },
    tag: { type: String, default: 'div' },
  },
  computed: {
    style() {
      return {
        width: this.width,
        height: this.height,
        borderRadius: this.circle ? '50%' : this.radius,
      }
    },
  },
}
</script>

<style scoped>
.skeleton-block {
  display: block;
  position: relative;
  overflow: hidden;
  background-color: #eef2f8;
  background-image: linear-gradient(
    90deg,
    #eef2f8 0%,
    #f7f9fc 50%,
    #eef2f8 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.skeleton-block--light {
  background-color: rgba(255, 255, 255, 0.18);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.34) 50%,
    rgba(255, 255, 255, 0.18) 100%
  );
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block { animation: none; }
}
</style>
