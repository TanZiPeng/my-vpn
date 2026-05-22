<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="dialog-overlay" @click.self="$emit('close')">
        <div class="dialog">
          <div class="dialog-header">
            <div class="dialog-title">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M3 2h6l3 3v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.2"/>
                <path d="M9 2v3h3" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              <span>{{ name }}</span>
            </div>
            <button class="close-btn" @click="$emit('close')">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="dialog-body">
            <div v-if="loading" class="skeleton-wrap">
              <div class="skeleton-line" v-for="n in 14" :key="n" :style="skeletonStyle(n)"></div>
            </div>
            <div v-else-if="error" class="state-center error-text">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.4"/>
                <path d="M10 6v5M10 13.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Failed to load file content
            </div>
            <Transition name="content-fade">
              <pre v-if="!loading && !error && content" class="code-block"><code>{{ content }}</code></pre>
            </Transition>
          </div>

          <div class="dialog-footer">
            <span class="line-count" v-if="content && !loading">{{ lineCount }} lines</span>
            <span v-else-if="loading" class="line-count skeleton-text"></span>
            <button class="copy-btn" :class="{ copied }" @click="copyContent" :disabled="loading || !content">
              <svg v-if="!copied" width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                <path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6a1 1 0 001 1h1" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              <svg v-else width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M3 7.5l3 3 5-5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  name: { type: String, default: '' },
})

defineEmits(['close'])

const content = ref('')
const loading = ref(false)
const error = ref(false)
const copied = ref(false)

// In-memory cache: name -> content string
const cache = new Map()

const lineCount = computed(() => content.value ? content.value.split('\n').length : 0)

const skeletonWidths = [72, 88, 55, 94, 63, 80, 45, 91, 68, 76, 52, 85, 60, 40]
function skeletonStyle(n) {
  const w = skeletonWidths[(n - 1) % skeletonWidths.length]
  return { width: `${w}%`, animationDelay: `${(n - 1) * 0.04}s` }
}

watch(() => [props.visible, props.name], async ([visible, name]) => {
  if (!visible || !name) return

  if (cache.has(name)) {
    content.value = cache.get(name)
    loading.value = false
    error.value = false
    return
  }

  loading.value = true
  error.value = false
  content.value = ''

  try {
    const res = await fetch(`/api/download/${encodeURIComponent(name)}`)
    if (!res.ok) throw new Error()
    const text = await res.text()
    cache.set(name, text)
    content.value = text
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}, { immediate: false })

async function copyContent() {
  if (!content.value) return
  try {
    await navigator.clipboard.writeText(content.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = content.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.dialog {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  width: 100%;
  max-width: 680px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 650;
  color: var(--text);
}

.dialog-title svg {
  color: #6366f1;
  flex-shrink: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--border);
  color: var(--text);
}

.dialog-body {
  flex: 1;
  overflow: auto;
  padding: 0;
  position: relative;
  min-height: 200px;
}

/* Skeleton loader */
.skeleton-wrap {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 13px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.code-block {
  margin: 0;
  padding: 20px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text);
  white-space: pre;
  overflow-x: auto;
  tab-size: 2;
}

.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  color: #ef4444;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.line-count {
  font-size: 11.5px;
  color: var(--text-secondary);
}

.skeleton-text {
  width: 60px;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--border) 25%, var(--bg) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
  display: inline-block;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg);
  color: var(--text-secondary);
  transition: all 0.2s;
}

.copy-btn:hover:not(:disabled) {
  background: var(--border);
  color: var(--text);
}

.copy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.copy-btn.copied {
  background: #dcfce7;
  color: #16a34a;
}

/* Content fade-in */
.content-fade-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.content-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

/* Dialog open/close */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.22s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
.dialog-fade-enter-active .dialog {
  animation: dialog-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.dialog-fade-leave-active .dialog {
  animation: dialog-out 0.18s ease forwards;
}

@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes dialog-out {
  to { opacity: 0; transform: scale(0.97) translateY(6px); }
}
</style>
