<template>
  <div class="product-item-selector">
    <v-select
      v-model="localValue"
      :options="products"
      label="name"
      :taggable="true"
      :push-tags="false"
      :create-option="createOption"
      :dir="$store.state.appConfig.isRTL ? 'rtl' : 'ltr'"
      :placeholder="t('Type or search products/services')+'...'"
      class="item-selector-title"
      @input="onInput"
      @search="onSearch"
      @search:blur="onSearchBlur"
    >
      <!-- Rich option display: name + price on right, description below -->
      <template #option="{ name, description, price }">
        <div class="d-flex justify-content-between align-items-center">
          <span class="font-weight-bold">{{ name }}</span>
          <small v-if="price" class="text-muted ml-1">${{ Number(price).toFixed(2) }}</small>
        </div>
        <small v-if="description" class="text-muted d-block text-truncate">{{ description }}</small>
      </template>

      <!-- Show selected option cleanly -->
      <template #selected-option="{ name }">
        <span>{{ name }}</span>
      </template>

      <!-- Empty state -->
      <template #no-options="{ search }">
        <li class="no-options-message d-flex align-items-center my-50 px-1">
          <base-feather-icon icon="PackageIcon" size="16" />
          <span class="ml-25 text-muted">
            {{ search ? t('No matching products/services.') : t('No saved products/services yet. Type to enter an item.') }}
          </span>
        </li>
      </template>

      <!-- Footer: Save to catalog (locked or active) -->
      <template #list-footer>
        <li class="save-catalog-footer border-top">
          <!-- Enabled: user is on a plan that allows saving -->
          <b-button
            v-if="canSaveToCatalog"
            variant="flat-primary"
            size="sm"
            class="w-100 text-left px-1 py-50"
            :disabled="isSaving || !item.name || isExistingProduct || !companyId"
            @click.prevent.stop="saveToCatalog"
          >
            <b-spinner v-if="isSaving" small class="mr-25" />
            <base-feather-icon v-else icon="BookmarkIcon" size="14" class="mr-25" />
            <span v-if="item.name && !isExistingProduct">
              {{t('Save')}} "{{ item.name }}" {{t('to catalog')}}
            </span>
            <span v-else-if="isExistingProduct">{{t('Already in catalog')}}</span>
            <span v-else>{{t('Save items to catalog for quick reuse')}}</span>
          </b-button>

          <!-- Locked: show premium badge + upgrade prompt -->
          <div
            v-else
            class="d-flex align-items-center justify-content-between px-1 py-50 upgrade-row"
            @click.stop="showUpgradeModal = true"
          >
            <span class="text-muted d-flex align-items-center">
              <base-feather-icon icon="LockIcon" size="14" class="mr-25" />
              <small>{{t('Save to product catalog')}}</small>
            </span>
            <b-badge variant="warning" pill>
              <small>Pro</small>
            </b-badge>
          </div>
        </li>
      </template>
    </v-select>

    <!-- Upgrade modal -->
    <b-modal
      v-model="showUpgradeModal"
      :title="t('New: Product/Service Catalog')"
      :ok-title="t('See Plans')"
      :cancel-title="t('Not Now')"
      ok-variant="primary"
      centered
      @ok="goToUpgrade"
    >
      <div class="text-center mb-1">
        <base-feather-icon icon="PackageIcon" size="40" class="text-primary" />
      </div>
      <p class="font-weight-bold text-center">{{t('Save reusable products/services to your catalog')}}</p>
      <p>{{t('Build a library of your most-used services and goods. When creating an invoice, select any saved product and the name, description, and price fill automatically.')}}</p>
      <p class="text-muted mb-0">{{t('Upgrade your plan to unlock this feature.')}}</p>
    </b-modal>
  </div>
</template>

<script>
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'
import vSelect from 'vue-select'
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  name: 'ProductItemSelector',

  components: {
    BaseFeatherIcon,
    vSelect,
  },

  props: {
    // The invoice item object — mutated directly (same pattern as InvoiceBody)
    item: {
      type: Object,
      required: true,
    },
    // Passed from parent once backend role checking is wired up.
    // Defaults false so the locked/premium state is shown until plan is confirmed.
    canSaveToCatalog: {
      type: Boolean,
      default: false,
    },
    // UUID of the company currently selected on the invoice.
    // Required by the backend when saving a new product to the catalog.
    companyId: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      // Holds either a catalog product object or a { name, isCustom: true } object
      localValue: this.item.name ? { name: this.item.name, isCustom: true } : null,
      searchQuery: '',
      isSaving: false,
      showUpgradeModal: false,
      t: null
    }
  },

  computed: {
    products() {
      return this.$store.getters['products/list'] || []
    },

    isExistingProduct() {
      // Use item.name rather than searchQuery — searchQuery gets cleared on blur
      // before the footer renders, making the "already in catalog" check unreliable.
      const name = this.item.name
      if (!name) return false
      return this.products.some(p => p.name.toLowerCase() === name.toLowerCase())
    },
  },

  watch: {
    // Syncs when item.name changes externally — e.g. the date picker appends a date,
    // or the parent resets the form. We compare against item.name itself (not searchQuery)
    // because onSearch("") fires and clears searchQuery BEFORE item.name is wiped.
    'item.name'(newName) {
      const displayedName = this.localValue ? this.localValue.name : ''
      if (newName !== displayedName) {
        this.localValue = newName ? { name: newName, isCustom: true } : null
      }
    },
  },

  mounted() {
    // Load catalog in the background — fails silently if backend not ready
    if (this.products.length === 0) {
      this.$store.dispatch('products/list').catch(() => {})
    }
    const { t } = useI18nUtils()
    this.t = t
  },

  methods: {
    // Called by vue-select when user presses Enter without selecting from the dropdown.
    // Guard empty strings so a blank tag is never created (which triggers the vue-select
    // "label key does not exist" warning when it tries to render {}).
    createOption(name) {
      if (!name || !name.trim()) return null
      return { name: name.trim(), isCustom: true }
    },

    // Fires while the user types in the search box.
    // KEY RULE: only update item.name for non-empty queries.
    // When the user blurs, vue-select emits @search("") FIRST to clear its internal
    // search string, THEN emits @search:blur. If we wrote item.name = "" here,
    // the name would be wiped before onSearchBlur ever gets a chance to read it.
    onSearch(query) {
      this.searchQuery = query
      if (query && (!this.localValue || this.localValue.isCustom)) {
        this.item.name = query
      }
    },

    // Fires after vue-select has already cleared its internal search string on blur.
    // At this point searchQuery is "" (cleared by the @search("") above), but
    // item.name still holds the last thing the user typed — use that to commit
    // a display value so the field doesn't go blank after the user tabs away.
    onSearchBlur() {
      const name = this.item.name
      if (name && (!this.localValue || this.localValue.isCustom)) {
        this.localValue = { name, isCustom: true }
      }
    },

    // Fires when selection changes (product selected or cleared)
    onInput(selected) {
      // Guard: vue-select can emit {} in some taggable edge cases (e.g. createOption
      // returning null). Without this guard, label resolution on {} triggers the warning.
      if (!selected || typeof selected !== 'object' || !selected.name) {
        return
      }

      this.item.name = selected.name

      if (!selected.isCustom) {
        // Catalog product selected — store its id so invoice_items.product_id gets saved
        this.item.productId = selected.id || null
        if (selected.description) {
          this.item.description = selected.description
        }
        if (selected.price != null) {
          this.item.price = selected.price
          this.$emit('recalculate')
        }
      } else {
        // Manual entry — clear any previously linked product
        this.item.productId = null
      }
    },

    async saveToCatalog() {
      if (!this.item.name || this.isSaving || this.isExistingProduct) return

      this.isSaving = true
      try {
        const payload = {
          data: {
            type: 'products',
            attributes: {
              name: this.item.name,
              description: this.item.description || null,
              price: this.item.price ? parseFloat(this.item.price) : null,
            },
            relationships: this.companyId
              ? { company: { data: { type: 'companies', id: this.companyId } } }
              : undefined,
          },
        }
        await this.$store.dispatch('products/add', payload)
        this.$bvToast.toast(`"${this.item.name}" saved to your product catalog.`, {
          title: 'Product Saved',
          variant: 'success',
          autoHideDelay: 3000,
          solid: true,
        })
      } catch (err) {
        if (err?.response?.status === 403) {
          // Backend confirms this plan cannot save — show upgrade modal
          this.showUpgradeModal = true
        } else {
          this.$bvToast.toast('Could not save product. Please try again.', {
            title: 'Error',
            variant: 'danger',
            autoHideDelay: 3000,
            solid: true,
          })
        }
      } finally {
        this.isSaving = false
      }
    },

    goToUpgrade() {
      // TODO: update route name to match your pricing/plans page
      this.$router.push({ name: 'pricing' }).catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/scss/vue/libs/vue-select.scss';

.upgrade-row {
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 159, 67, 0.08);
    border-radius: 0 0 4px 4px;
  }
}

.save-catalog-footer {
  padding: 0.15rem 0 0;
}

.product-item-selector {
  width: 100%;
}
</style>
