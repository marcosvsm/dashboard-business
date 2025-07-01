<template>
    <b-tabs v-model="currentTab">
      <b-tab :title="t('Create Business')">
        <section>
          <div class="mt-1">
            <b-row>
              <b-form class="mb-lg-2 col-xl-8 col-12" @submit.prevent="collectCompanyData">
                <b-row class="p-1">
                <b-card>
                  <b-card-body>
                    <b-card-title>{{ t('Business') }}</b-card-title>
                    <b-row>
                      <b-col cols="12">
                        <b-form-group :label="t('Name')" label-for="h-name" label-cols-md="1">
                          <b-input id="h-name" placeholder="Name" v-model="name" required />
                        </b-form-group>
                      </b-col>
                      <b-col cols="12">
                        <b-form-group :label="t('Phone')" label-for="h-phone" label-cols-md="1">
                          <b-input id="h-phone" placeholder="Phone" v-model="phone" maxlength="13" />
                        </b-form-group>
                      </b-col>
                      <b-col cols="12">
                        <b-form-group label="ABN" label-for="h-abn" label-cols-md="1">
                          <b-input id="h-abn" placeholder="ABN" v-model="abn" maxlength="11" required />
                        </b-form-group>
                      </b-col>
                      <b-col cols="12">
                        <b-form-group label="Email" label-for="h-email" label-cols-md="1">
                          <b-input id="h-email" placeholder="Email" v-model="email" />
                        </b-form-group>
                      </b-col>
                      <b-col md="8" offset-md="4">
                        <b-button type="submit" variant="primary" class="mr-1 mt-5">
                          {{ t('Next') }}
                        </b-button>
                      </b-col>
                    </b-row>
                  </b-card-body>
                </b-card>
                </b-row>
              </b-form>
            </b-row>
          </div>
        </section>
      </b-tab>
      <b-tab :title="t('Add Payment Details')" :disabled="!companyCreated">
        <section>
          <div class="mt-1">
            <b-row>
              <b-form class="mb-lg-2 col-xl-8 col-12" @submit.prevent="collectPaymentDetails">
                <b-card>
                  <b-card-body>
                    <b-card-title>{{ t('Payment Options') }}</b-card-title>
                    <b-row>
                      <b-col cols="12">
                        <b-form-group :label="t('PAYID')" label-for="payid">
                          <b-input id="payid" v-model="payment_details.payid" type="text" trim />
                        </b-form-group>
                      </b-col>
                      <b-col cols="12">
                        <b-form-group :label="t('PAYID Name')" label-for="payidName">
                          <b-input id="payidName" v-model="payment_details.name" type="text" trim />
                        </b-form-group>
                      </b-col>
                      <b-col md="8" offset-md="4">
                        <b-button type="submit" variant="primary" class="mr-1 mt-5">
                          {{ t('Save') }}
                        </b-button>
                        <b-button @click="skipPaymentDetails" variant="secondary" class="mr-1 mt-5">
                          {{ t('Skip') }}
                        </b-button>
                      </b-col>
                    </b-row>
                  </b-card-body>
                </b-card>
              </b-form>
            </b-row>
          </div>
        </section>
      </b-tab>
    </b-tabs>
</template>

<script>
import { useUtils as useI18nUtils } from '@/libs/i18n/i18n'

export default {
  data() {
    return {
      currentTab: 0,
      name: '',
      abn: '',
      phone: '',
      email: '',
      payment_details: {
        payid: '',
        name: '',
      },
      companyCreated: false,
      companyData: null, // Temporary storage for company data
      t: null,
    }
  },
  created() {
    const { t } = useI18nUtils()
    this.t = t
  },
  methods: {
    async collectCompanyData() {
      // Collect company data and move to the next tab
      this.companyData = {
        name: this.name,
        phone: this.phone,
        abn: this.abn,
        email: this.email,
      };
      this.companyCreated = true;
      await this.$nextTick();
      this.currentTab = 1;
    },
    collectPaymentDetails() {
      // Collect payment details and save all data
      this.payment_details = {
        payid: this.payment_details.payid,
        name: this.payment_details.name,
      };
      this.saveAllData();
    },
    async saveAllData() {
      try {
        const userId = await this.getId();
        const data = {
          data: {
            type: "companies",
            attributes: {
              ...this.companyData,
              payment_details: this.payment_details,
            },
            relationships: {
              user: {
                data: {
                  type: "users",
                  id: userId,
                }
              }
            },
          }
        };
        await this.$store.dispatch('companies/add', data);
        this.$router.push({ name: 'companies' });
      } catch (e) {
        console.log('Response data:', e.response.data);
        let message = 'Something went wrong! Try again later or contact the support.'
        if (e.response.data.errors[0].detail === 'Your email address is not verified.') {
          message = "Your email address is not verified. Please verify your email.";
        } else if(e.response.data.errors[0].detail === 'You have reached your limit for this feature.') {
          message = 'You have reached your limit to create a Company';
        }
       this.$toast.error(message,
          {
            position: "top-right",
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 3000
          })
      }
    },async saveCompany() {
      try {
        const userId = await this.getId();
        const data = {
          data: {
            type: "companies",
            attributes: {
              ...this.companyData,
            },
            relationships: {
              user: {
                data: {
                  type: "users",
                  id: userId,
                }
              }
            },
          }
        };
        await this.$store.dispatch('companies/add', data);
        this.$router.push({ name: 'companies' });
      } catch (e) {
        let message = 'Something went wrong! Try again later or contact the support.'
        if (e.response.data.errors[0].detail === 'Your email address is not verified.') {
          message = "Your email address is not verified. Please verify your email.";
        } else if(e.response.data.errors[0].detail === 'You have reached your limit for this feature.') {
          message = 'You have reached your limit to create a Company';
        }
         this.$toast.error(message,
          {
            position: "top-right",
            icon: false,
            closeButton: false,
            hideProgressBar: true,
            timeout: 3000
          })
      }
    },
    async skipPaymentDetails() {
      // Skip payment details and save company data only
      this.saveCompany();
    },
    async getId() {
      const user = await this.$store.getters["profile/me"]
      return user.id;
    },
  }
}
</script>
