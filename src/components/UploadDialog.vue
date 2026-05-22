<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div class="overlay" v-if="visible" @click.self="$emit('close')">
        <div class="dialog" @click.stop>
          <div class="dialog-header">
            <h2>Upload Config</h2>
            <button class="close-btn" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div
            class="drop-zone"
            :class="{ active: dragging }"
            @dragover.prevent="dragging = true"
            @dragleave="dragging = false"
            @drop.prevent="onDrop"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".yml,.yaml"
              multiple
              hidden
              @change="onFileSelect"
            />
            <div class="drop-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4v14M8 10l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 20v3a1 1 0 001 1h18a1 1 0 001-1v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="drop-text">Drag & drop YML files here</p>
            <p class="drop-hint">or click to browse files</p>
          </div>

          <div class="file-list" v-if="files.length">
            <TransitionGroup name="file">
              <div class="file-item" v-for="(file, i) in files" :key="file.name + i"
                :class="fileStatus[i]">
                <div class="file-item-dot" :style="{ background: dotColor(i) }"></div>
                <span class="file-item-name">{{ file.name }}</span>
                <span class="file-item-size">{{ formatSize(file.size) }}</span>
                <div class="file-item-right">
                  <svg v-if="fileStatus[i] === 'uploading'" class="spin" width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="var(--border)" stroke-width="1.5"/>
                    <path d="M12 7a5 5 0 00-5-5" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <svg v-else-if="fileStatus[i] === 'done'" class="status-icon done" width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" fill="#dcfce7"/>
                    <path d="M4.5 7l2 2 3-3" stroke="#16a34a" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else-if="fileStatus[i] === 'error'" class="status-icon error" width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" fill="#fee2e2"/>
                    <path d="M5 5l4 4M9 5l-4 4" stroke="#ef4444" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                  <button v-else class="file-item-remove" @click="files.splice(i, 1)">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <button
            class="submit-btn"
            :disabled="!files.length || uploading"
            @click="upload"
          >
            <span class="submit-inner">
              <svg v-if="uploading" class="spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
                <path d="M14 8a6 6 0 00-6-6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ uploading ? 'Uploading...' : `Upload ${files.length || ''} file${files.length > 1 ? 's' : ''}` }}
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'uploaded'])

const files = ref([])
const dragging = ref(false)
const uploading = ref(false)
const fileStatus = ref([])

const colors = ['#6366f1', '#f43f5e', '#f97316', '#10b981', '#8b5cf6', '#0891b2', '#ec4899', '#0ea5e9']
function dotColor(i) { return colors[i % colors.length] }

function onDrop(e) {
  dragging.value = false
  const dropped = Array.from(e.dataTransfer.files).filter(f =>
    f.name.endsWith('.yml') || f.name.endsWith('.yaml')
  )
  files.value.push(...dropped)
  fileStatus.value = files.value.map(() => 'idle')
}

function onFileSelect(e) {
  files.value.push(...Array.from(e.target.files))
  fileStatus.value = files.value.map(() => 'idle')
  e.target.value = ''
}

async function upload() {
  uploading.value = true
  fileStatus.value = files.value.map(() => 'idle')
  let hasError = false
  try {
    for (let i = 0; i < files.value.length; i++) {
      fileStatus.value[i] = 'uploading'
      try {
        const formData = new FormData()
        formData.append('file', files.value[i])
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) throw new Error(await res.text())
        fileStatus.value[i] = 'done'
      } catch {
        fileStatus.value[i] = 'error'
        hasError = true
      }
    }
    if (!hasError) {
      await new Promise(r => setTimeout(r, 400))
      files.value = []
      fileStatus.value = []
      emit('uploaded')
      emit('close')
    }
  } finally {
    uploading.value = false
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.overlay-enter-active { transition: opacity 0.25s ease; }
.overlay-leave-active { transition: opacity 0.2s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.overlay-enter-active .dialog { animation: dialog-in 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.overlay-leave-active .dialog { animation: dialog-out 0.2s ease forwards; }

@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.94) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes dialog-out {
  to { opacity: 0; transform: scale(0.96) translateY(6px); }
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dialog {
  background: var(--card-bg);
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  padding: 28px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.dialog-header h2 {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.close-btn:hover { background: var(--bg); color: var(--text); }

.drop-zone {
  border: 2px dashed var(--border);
  border-radius: 14px;
  padding: 36px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
}

.drop-zone:hover,
.drop-zone.active {
  border-color: #6366f1;
  background: #f5f3ff;
}

.drop-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: var(--text-secondary);
  transition: all 0.25s;
}

.drop-zone:hover .drop-icon-wrap,
.drop-zone.active .drop-icon-wrap {
  background: #ede9fe;
  color: #6366f1;
}

.drop-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.drop-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.file-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-enter-active { animation: file-in 0.3s ease; }
.file-leave-active { animation: file-out 0.2s ease forwards; }

@keyframes file-in { from { opacity: 0; transform: translateY(-4px); } }
@keyframes file-out { to { opacity: 0; height: 0; padding: 0; margin: 0; } }

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg);
  border-radius: 10px;
  font-size: 13px;
  transition: background 0.2s;
}

.file-item.uploading {
  background: #f5f3ff;
}

.file-item.done {
  background: #f0fdf4;
}

.file-item.error {
  background: #fef2f2;
}

.file-item-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.file-item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.file-item-size {
  color: var(--text-secondary);
  flex-shrink: 0;
  font-size: 12px;
}

.file-item-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.file-item-remove {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.15s;
}

.file-item-remove:hover { background: #fef2f2; color: var(--danger); }

.status-icon {
  display: block;
}

.spin {
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.submit-btn {
  width: 100%;
  margin-top: 18px;
  padding: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.submit-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
