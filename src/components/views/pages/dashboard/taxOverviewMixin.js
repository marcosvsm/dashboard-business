import { mapGetters } from 'vuex';

const GST_RATE = 0.1;

export default {
  props: {
    invoices:          { type: Array,    default: () => [] },
    t:                 { type: Function, required: true },
    currencyFormatter: { required: true },
    hideAmount:        { type: Boolean,  default: false },
  },

  data() {
    return {
      editingSaved: false,
      savedDraft: 0,
    };
  },

  mounted() {
    if (!this.overview) {
      this.$store.dispatch('tax/fetchOverview');
    }
  },

  computed: {
    ...mapGetters('tax', [
      'setupData',
      'savedAmount',
      'isGstRegistered',
      'estimateTax',
      'isLoading',
      'overview',
      'error',
      'profileUpdatedAt',
    ]),

    hasBackendData() {
      return !!this.overview && this.overview.profileComplete !== false;
    },

    overviewIncomeTax() {
      return this.overview?.incomeTax?.totalIncomeTax ?? null;
    },

    overviewMedicareLevy() {
      return this.overview?.incomeTax?.medicareLevy ?? null;
    },

    overviewGstPosition() {
      return this.overview?.gst?.netGstPosition ?? null;
    },

    // Income-derived GST estimate (gross × 1/11). Forward-looking.
    overviewGstEstimate() {
      return this.overview?.gst?.gstCollected ?? null;
    },

    // Actual GST ledger sum (per-invoice gst_amount snapshots). Backward-looking.
    overviewGstCollectedFromInvoices() {
      return this.overview?.gst?.gstCollectedFromInvoices ?? null;
    },

    overviewGstInvoiceCount() {
      return this.overview?.gst?.gstInvoiceCount ?? 0;
    },

    overviewGstRegisteredFrom() {
      return this.overview?.gst?.registeredFrom ?? null;
    },

    // Divergence between estimate and ledger as a percentage of the ledger.
    // Returns 0 when either value is missing or the ledger is zero.
    gstEstimateDivergencePct() {
      const ledger   = this.overviewGstCollectedFromInvoices;
      const estimate = this.overviewGstEstimate;
      if (ledger === null || estimate === null) return 0;
      if (ledger <= 0) return 0;
      return Math.abs(estimate - ledger) / ledger;
    },

    // Surface the estimate row in the GST panel only when the two numbers
    // materially disagree (Q-GST-3 option A: >5% drift).
    showGstEstimateDivergence() {
      return this.gstEstimateDivergencePct > 0.05;
    },

    // Days remaining until the next BAS lodgement (negative if past).
    nextBasInDays() {
      if (!this.overviewNextLodgement) return null;
      const due   = new Date(this.overviewNextLodgement);
      const today = new Date();
      return Math.ceil((due - today) / (24 * 60 * 60 * 1000));
    },

    // Short "28 Feb" style label for the next BAS due date.
    nextBasDueLabel() {
      if (!this.overviewNextLodgement) return null;
      try {
        return new Date(this.overviewNextLodgement).toLocaleDateString('en-AU', {
          day: 'numeric', month: 'short',
        });
      } catch {
        return null;
      }
    },

    overviewPaygPaid() {
      return this.overview?.payg?.paidAmount ?? null;
    },

    overviewRemainingObligation() {
      return this.overview?.obligations?.remainingObligation ?? null;
    },

    overviewShouldHaveSaved() {
      return this.overview?.savings?.shouldHaveSaved ?? null;
    },

    overviewRecommendedMonthly() {
      return this.overview?.savings?.recommendedMonthlySavings ?? null;
    },

    overviewRecommendedWeekly() {
      return this.overview?.savings?.recommendedWeeklySavings ?? null;
    },

    overviewNextLodgement() {
      return this.overview?.gst?.nextLodgementDue ?? null;
    },

    overviewFiscalYear() {
      return this.overview?.financialYear ?? null;
    },

    overviewTaxableIncome() {
      return this.overview?.taxableIncome ?? null;
    },

    formattedUpdatedAt() {
      if (!this.profileUpdatedAt) return null;
      try {
        return new Date(this.profileUpdatedAt).toLocaleDateString('en-AU', {
          day: 'numeric', month: 'short', year: 'numeric',
        });
      } catch {
        return null;
      }
    },

    hasPayg() {
      return this.setupData?.paygInstalments === 'yes';
    },

    medicareIsExempt() {
      return this.setupData?.medicareLevy === 'exempt';
    },

    showMedicare() {
      const residency = this.setupData?.taxResidency;
      return !!residency && residency !== 'non-resident';
    },

    paidInvoices() {
      return this.invoices.filter(inv => inv.status === 1);
    },

    totalIncome() {
      return this.paidInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    },

    localGstCollected() {
      if (!this.isGstRegistered) return 0;
      return this.paidInvoices.reduce((sum, inv) => {
        const amount = parseFloat(inv.amount) || 0;
        return sum + (amount - amount / (1 + GST_RATE));
      }, 0);
    },

    localEstimatedIncomeTax() {
      if (!this.estimateTax) return null;
      return Math.max(0, this.totalIncome * 0.25);
    },

    heroAmount() {
      if (this.hasBackendData && this.overviewRemainingObligation !== null) {
        return this.overviewRemainingObligation;
      }
      if (!this.estimateTax) return 0;
      const paygPaid = parseFloat(this.setupData?.paygAmountPaid) || 0;
      return Math.max(0, this.totalIncome * 0.25 - paygPaid);
    },

    gap() {
      return Math.max(0, this.heroAmount - this.savedAmount);
    },

    savingsProgressPct() {
      if (!this.heroAmount || this.heroAmount <= 0) return 0;
      return Math.min(100, Math.round((this.savedAmount / this.heroAmount) * 100));
    },

    savingsBarClass() {
      if (this.savingsProgressPct >= 100) return 'fill-green';
      if (this.savingsProgressPct >= 70) return 'fill-amber';
      return 'fill-red';
    },

    weeklyTarget() {
      if (this.hasBackendData && this.overviewRecommendedWeekly !== null) {
        return this.overviewRecommendedWeekly;
      }
      const today = new Date();
      const june30 = new Date(today.getFullYear(), 5, 30);
      if (today > june30) june30.setFullYear(june30.getFullYear() + 1);
      const weeks = Math.max(1, Math.ceil((june30 - today) / (7 * 24 * 60 * 60 * 1000)));
      return this.gap > 0 ? this.gap / weeks : 0;
    },

    fiscalYearLabel() {
      if (this.overviewFiscalYear) {
        return `FY${this.overviewFiscalYear.replace('-', '–')}`;
      }
      const today = new Date();
      const startYear = today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
      return `FY${startYear}–${String(startYear + 1).slice(-2)}`;
    },

    nextObligation() {
      if (this.hasBackendData && this.overviewNextLodgement) {
        const due = new Date(this.overviewNextLodgement);
        const today = new Date();
        const weeks = Math.ceil((due - today) / (7 * 24 * 60 * 60 * 1000));
        if (weeks <= 10) {
          const dateStr = due.toLocaleDateString('en-AU', { day: 'numeric', month: 'long' });
          return `${this.t('Next BAS due')}: ${dateStr} (${weeks} ${this.t('weeks away')})`;
        }
        return null;
      }

      const today = new Date();
      const june30 = new Date(today.getFullYear(), 5, 30);
      if (today > june30) june30.setFullYear(june30.getFullYear() + 1);
      const weeks = Math.ceil((june30 - today) / (7 * 24 * 60 * 60 * 1000));
      if (weeks <= 10) {
        const label = this.isGstRegistered
          ? this.t('EOFY and final BAS period approaching — 30 June')
          : this.t('EOFY approaching — 30 June');
        return `${label} (${weeks} ${this.t('weeks away')})`;
      }
      return null;
    },
  },

  methods: {
    beginEdit() {
      this.savedDraft = this.savedAmount;
      this.editingSaved = true;
      this.$nextTick(() => this.$refs.savedInput?.focus());
    },

    async commitEdit() {
      await this.$store.dispatch('tax/updateSavedAmount', this.savedDraft);
      this.editingSaved = false;
    },

    cancelEdit() {
      this.editingSaved = false;
    },

    confirmReset() {
      this.$bvModal.msgBoxConfirm(
        this.t('This will clear your Tax Overview setup. You can redo it any time.'),
        {
          title: this.t('Reset Tax Overview'),
          okTitle: this.t('Yes, reset'),
          cancelTitle: this.t('Cancel'),
          okVariant: 'danger',
          size: 'sm',
          centered: true,
        }
      ).then(ok => {
        if (ok) this.$store.dispatch('tax/resetSetup');
      });
    },
  },
};
