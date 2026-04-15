<template>
  <div
    v-if="value"
    class="mobile-more-sheet"
    role="dialog"
    aria-modal="true"
    :aria-label="t('More actions')"
  >
    <transition name="mobile-more-sheet-backdrop">
      <div
        v-if="value"
        class="mobile-more-sheet__backdrop"
        @click="close"
      />
    </transition>

    <transition name="mobile-more-sheet-panel">
      <div
        v-if="value"
        class="mobile-more-sheet__panel"
      >
        <div class="mobile-more-sheet__handle" />

        <div class="mobile-more-sheet__header">
          <div>
            <p class="mobile-more-sheet__eyebrow">
              {{ t('Simplify Business') }}
            </p>
            <h5 class="mobile-more-sheet__title">
              {{ t('More') }}
            </h5>
          </div>

          <button
            type="button"
            class="mobile-more-sheet__close"
            :aria-label="t('Close more actions')"
            @click="close"
          >
            <base-feather-icon
              icon="XIcon"
              size="18"
            />
          </button>
        </div>

        <div class="mobile-more-sheet__list">
          <button
            v-for="item in items"
            :key="item.label"
            type="button"
            class="mobile-more-sheet__action"
            @click="handleItemClick(item)"
          >
            <span class="mobile-more-sheet__action-icon">
              <base-feather-icon
                :icon="item.icon"
                size="18"
              />
            </span>

            <span class="mobile-more-sheet__action-copy">
              <span class="mobile-more-sheet__action-label">{{ item.label }}</span>
              <span
                v-if="item.description"
                class="mobile-more-sheet__action-description"
              >
                {{ item.description }}
              </span>
            </span>

            <span class="mobile-more-sheet__action-trailing">
              <base-feather-icon
                :icon="item.isLogout ? 'LogOutIcon' : 'ChevronRightIcon'"
                size="16"
              />
            </span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import BaseFeatherIcon from './BaseFeatherIcon.vue'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  components: {
    BaseFeatherIcon,
  },
  data() {
    const { t } = useI18nUtils()

    return {
      t,
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    value(isOpen) {
      if (isOpen) {
        document.addEventListener('keydown', this.handleEscape)
        return
      }

      document.removeEventListener('keydown', this.handleEscape)
    },
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleEscape)
  },
  methods: {
    close() {
      document.removeEventListener('keydown', this.handleEscape)
      this.$emit('input', false)
    },
    handleEscape(event) {
      if (event.key === 'Escape') {
        this.close()
      }
    },
    handleItemClick(item) {
      if (item.isLogout) {
        this.$emit('logout')
        return
      }

      this.$emit('navigate', item)
    },
  },
}
</script>

<style scoped lang="scss">
.mobile-more-sheet {
  position: fixed;
  inset: 0;
  z-index: 1025;
}

.mobile-more-sheet__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.34);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.mobile-more-sheet__panel {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  max-width: 36rem;
  margin: 0 auto;
  padding: 0.75rem 1rem calc(1.1rem + constant(safe-area-inset-bottom));
  padding: 0.75rem 1rem calc(1.1rem + env(safe-area-inset-bottom));
  border-radius: 1.75rem 1.75rem 0 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.94));
  box-shadow: 0 -16px 38px rgba(15, 23, 42, 0.18);
}

.mobile-more-sheet__handle {
  width: 3rem;
  height: 0.3rem;
  margin: 0 auto 1rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.7);
}

.mobile-more-sheet__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mobile-more-sheet__eyebrow {
  margin-bottom: 0.2rem;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.mobile-more-sheet__title {
  margin-bottom: 0;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 700;
}

.mobile-more-sheet__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border: 0;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  color: #334155;
}

.mobile-more-sheet__list {
  display: grid;
  gap: 0.7rem;
}

.mobile-more-sheet__action {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.95rem 1rem;
  text-align: left;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.78);
  color: #0f172a;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.mobile-more-sheet__action:hover,
.mobile-more-sheet__action:focus {
  outline: none;
  transform: translateY(-1px);
  border-color: rgba(96, 165, 250, 0.55);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.mobile-more-sheet__action-icon,
.mobile-more-sheet__action-trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mobile-more-sheet__action-icon {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.95rem;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

.mobile-more-sheet__action-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.15rem;
}

.mobile-more-sheet__action-label {
  font-size: 0.96rem;
  font-weight: 600;
}

.mobile-more-sheet__action-description {
  color: #64748b;
  font-size: 0.77rem;
}

.mobile-more-sheet__action-trailing {
  color: #94a3b8;
}

.mobile-more-sheet-backdrop-enter-active,
.mobile-more-sheet-backdrop-leave-active {
  transition: opacity 0.24s ease;
}

.mobile-more-sheet-backdrop-enter,
.mobile-more-sheet-backdrop-leave-to {
  opacity: 0;
}

.mobile-more-sheet-panel-enter-active,
.mobile-more-sheet-panel-leave-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}

.mobile-more-sheet-panel-enter,
.mobile-more-sheet-panel-leave-to {
  opacity: 0;
  transform: translateY(2rem);
}
</style>
