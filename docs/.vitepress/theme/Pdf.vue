<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ src: string }>()
const documents = import.meta.glob('../../_static/shared/pdf/**/*.pdf', {
  eager: true,
  query: '?url',
  import: 'default'
})
const pdfUrl = computed(() => documents[`../../${props.src.replace(/^\.\.\//, '')}`] as string | undefined)
</script>

<template>
  <div v-if="pdfUrl" class="pdf-guide">
    <p><a :href="pdfUrl" target="_blank" rel="noopener noreferrer">Open PDF guide</a></p>
    <iframe :src="pdfUrl" title="PDF guide" loading="lazy" />
  </div>
</template>

<style scoped>
iframe {
  width: 100%;
  height: 600px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
</style>
