<template>
  <section>
    <div>
        <h4>FAQ</h4>
    </div>
    <div>
      <b-row>
        
        <b-form class="mb-lg-2 col-xl-12 col-12">
          <b-row>
              <b-card-group
                class="mb-1 col-12"
                >
                <b-card>
                  <div class="accordion" role="tablist">
    <b-card no-body class="mb-1"  v-for="(faq, index) in faqs" 
                :key="index">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle="'accordion-'+index" class="custom-variant">{{ faq.question }}</b-button>
      </b-card-header>
      <b-collapse :id="'accordion-'+index" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-card-text>{{ faq.answer }}</b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
                </b-card>
                  </b-card-group>
          </b-row>
    </b-form>
      </b-row>
    </div>    
  </section>
</template>

<script>
import ValidationError from "@/components/uiComponents/ValidationError"
import BaseFeatherIcon from '../../../uiComponents/BaseFeatherIcon.vue'

export default {
    components:{
        ValidationError,
        BaseFeatherIcon,
  },
  data(){
      return {
         faqs: [
           {
             question: "How do I create a new invoice?",
             answer: "Navigate to the Invoice section and click on Create, fill in the necessary details like client information, items or services provided, and payment terms, then click Save or Download."
           },{
             question: "How do I add or remove items from an invoice?",
             answer: "While creating or editing an invoice, you can add items by clicking 'Add Item' and remove them by clicking the trash icon next to the item."
           }
        ],
      }
  },
  created(){

  },
  methods:{
   
  },
  
}
</script>
<style>
.custom-variant {
  background-color: #007eca;
  color: white;
  border-color: #007eca;
}

.custom-variant:hover {
  background-color: darken(#007eca, 10%);
  border-color: darken(#007eca, 10%);
}

</style>