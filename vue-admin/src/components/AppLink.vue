<template>
  <component :is="type" v-bind="linkProps">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isExternal } from '@/utils/validate'
import { RouterLink } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true
  }
})

const isExternalLink = computed(() => isExternal(props.to))

const type = computed(() => {
  if (isExternalLink.value) {
    return 'a'
  }
  return RouterLink
})

const linkProps = computed(() => {
  if (isExternalLink.value) {
    return {
      href: props.to,
      target: '_blank',
      rel: 'noopener'
    }
  }
  return {
    to: props.to
  }
})
</script>