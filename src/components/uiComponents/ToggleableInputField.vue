<template>
  <div class="d-flex align-items-center">
    <base-feather-icon
      v-if="!isInputVisible && isEmpty"
      class="cursor-pointer"
      :color="color"
      :icon="plusIcon"
      :size="iconSize"
      @click="toggleInput"
    />
    <b-form-group
      v-if="isInputVisible || !isEmpty"
      class="mt-2 flex-grow-1"
      :label="label"
      :label-for="inputId"
    >
      <div class="d-flex align-items-center">
        <b-form-input
          :id="inputId"
          v-model="inputValue"
          :type="inputType"
          :class="inputClass"
          trim
        />
        <base-feather-icon
          class="cursor-pointer ml-2"
          :color="color"
          :icon="minusIcon"
          :size="iconSize"
          @click="toggleInput"
        />
      </div>
    </b-form-group>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import BaseFeatherIcon from '@/components/uiComponents/BaseFeatherIcon.vue'

export default {
  components: {
    BaseFeatherIcon,
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    inputId: {
      type: String,
      required: true
    },
    inputType: {
      type: String,
      default: 'text'
    },
    inputClass: {
      type: String,
      default: 'flex-grow-1'
    },
    color: {
      type: String,
      default: '#0366d6'
    },
    plusIcon: {
      type: String,
      default: 'PlusCircleIcon'
    },
    minusIcon: {
      type: String,
      default: 'MinusCircleIcon'
    },
    iconSize: {
      type: [String, Number],
      default: "22"
    }
  },
  setup(props, { emit }) {
    const isInputVisible = ref(false)
    const inputValue = ref(props.modelValue)

    const isEmpty = computed(() => !inputValue.value || inputValue.value.trim() === '')

      // Watch for changes in modelValue and update inputValue
    watch(() => props.modelValue, (newValue) => {
      inputValue.value = newValue
      isInputVisible.value = newValue.trim() !== ''
    })
    
    watch(inputValue, (newValue) => {
      emit('update:modelValue', newValue)
    })

    const toggleInput = () => {
      isInputVisible.value = !isInputVisible.value
      if (!isInputVisible.value) {
        inputValue.value = ''
      }
    }

    return {
      isInputVisible,
      inputValue,
      isEmpty,
      toggleInput
    }
  }
}
</script>
