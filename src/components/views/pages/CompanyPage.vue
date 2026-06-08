<template>
  <section class="company-page-shell">
    <nav aria-label="breadcrumb">
      <ol class="px-0 pt-1 mb-0 bg-transparent breadcrumb me-sm-6">
        <li class="text-sm breadcrumb-item">
          <router-link :to="{ name: 'invoices' }">{{ t('My Business') }}</router-link>
        </li>
        <li class="text-sm breadcrumb-item active" aria-current="page">{{ pageTitle }}</li>
      </ol>
    </nav>

    <router-view />
  </section>
</template>

<script>
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  data() {
    return {
      t: null,
    }
  },
  created() {
    const { t } = useI18nUtils()
    this.t = t
  },
  computed: {
    currentPath() {
      const route = this.$route.path
      const actual = route.split('/company/')
      return actual.pop('')
    },
    pageTitle() {
      if (this.currentPath === 'add') {
        return this.t('Add My Business')
      }
      return this.t('Business')
    },
  },
}
</script>

<style scoped>
.company-page-shell {
  padding-bottom: 1rem;
}

.company-page-hero {
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(45, 206, 204, 0.18), transparent 28%),
    linear-gradient(135deg, #0f4c81 0%, #0366d6 55%, #2d8cff 100%);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.company-page-hero-body {
  padding: 1.75rem;
  color: #fff;
}

.company-page-hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.company-page-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.company-page-title {
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
}

.company-page-subtitle {
  max-width: 42rem;
  color: rgba(255, 255, 255, 0.82);
}

.company-page-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.95rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-weight: 700;
  white-space: nowrap;
}

.company-page-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.company-page-stat {
  padding: 1rem 1.1rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.company-page-stat-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 0.35rem;
}

.company-page-stat-value {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
}

@media (max-width: 767.98px) {
  .company-page-hero-body {
    padding: 1.25rem;
  }

  .company-page-hero-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .company-page-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .company-page-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 575.98px) {
  .company-page-stats {
    grid-template-columns: 1fr;
  }
}
</style>
