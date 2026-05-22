<template>
  <div class="app">
    <AppHeader @upload="showUpload = true" />

    <main class="main">
      <div class="container">
        <div v-if="loading" class="state-box">
          <div class="loader"></div>
          <p>Loading configs...</p>
        </div>

        <div v-else-if="!configs.length" class="state-box">
          <div class="empty-art">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="18" y="8" width="44" height="56" rx="6" fill="#e8e9ed" stroke="#d1d5db" stroke-width="1.5"/>
              <rect x="26" y="20" width="18" height="2" rx="1" fill="#c4c7d0"/>
              <rect x="26" y="28" width="28" height="2" rx="1" fill="#c4c7d0"/>
              <rect x="26" y="36" width="22" height="2" rx="1" fill="#c4c7d0"/>
              <rect x="26" y="44" width="14" height="2" rx="1" fill="#c4c7d0"/>
              <circle cx="58" cy="56" r="14" fill="#6366f1"/>
              <path d="M52 56h12M58 50v12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="empty-title">No configs yet</p>
          <p class="empty-desc">Upload your first YML config to get started</p>
          <button class="empty-btn" @click="showUpload = true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5v9M4.5 5l3.5-3.5L11.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.5 11.5v2h11v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Upload Config
          </button>
        </div>

        <template v-else>
          <div class="grid-header">
            <span class="config-count">{{ configs.length }} config{{ configs.length > 1 ? 's' : '' }}</span>
            <span class="drag-hint" v-if="configs.length > 1">Drag to reorder</span>
          </div>
          <TransitionGroup name="flip" tag="div" :class="['grid', { 'grid--dragging': isDragging }]">
            <ConfigCard
              v-for="(c, i) in configs"
              :key="c._id"
              :config="c"
              :class="{
                'card-enter-anim': !hasDragged,
                'card-is-dragging': dragIndex === i
              }"
              :style="!hasDragged ? { animationDelay: `${i * 0.06}s` } : undefined"
              @pointerdown="startDrag($event, i)"
              @delete="deleteConfig"
              @view="viewTarget = $event"
      @rename="renameTarget = $event"
            />
          </TransitionGroup>
        </template>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-authors">
          Created by <strong>🎻 woral tallp</strong>, <strong>☠️ 陈过汉</strong> & <strong>⚔️ 池大帝</strong>
        </span>
        <span class="footer-sep">·</span>
        <a class="footer-email" href="mailto:tan2133261080@gmail.com">🎖️ tan2133261080@gmail.com</a>
        <span class="footer-sep">·</span>
        <span class="footer-copy">&copy; {{ new Date().getFullYear() }} VPN Config Share</span>
      </div>
    </footer>

    <ViewDialog
      :visible="!!viewTarget"
      :name="viewTarget || ''"
      @close="viewTarget = null"
    />

    <UploadDialog
      :visible="showUpload"
      @close="showUpload = false"
      @uploaded="onUploaded"
    />

    <ConfirmDialog
      ref="confirmRef"
      :visible="!!deleteTarget"
      :name="deleteTarget"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <RenameDialog
      ref="renameRef"
      :visible="!!renameTarget"
      :name="renameTarget"
      @confirm="confirmRename"
      @cancel="renameTarget = null"
    />

    <div class="toast-container">
      <div
        v-for="(t, i) in toasts"
        :key="i"
        class="toast"
        :class="{ error: t.error }"
      >{{ t.message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ConfigCard from './components/ConfigCard.vue'
import UploadDialog from './components/UploadDialog.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import RenameDialog from './components/RenameDialog.vue'
import ViewDialog from './components/ViewDialog.vue'
import { useDragSort } from './composables/useDragSort.js'

const configs = ref([])
const loading = ref(true)
const showUpload = ref(false)
const toasts = ref([])
const hasDragged = ref(false)
const deleteTarget = ref(null)
const viewTarget = ref(null)
const renameTarget = ref(null)

const { dragIndex, isDragging, startDrag: _startDrag } = useDragSort(configs, {
  onOrderChange: persistOrder,
})

function startDrag(e, i) {
  hasDragged.value = true
  _startDrag(e, i)
}

function toast(message, error = false) {
  const t = { message, error }
  toasts.value.push(t)
  setTimeout(() => {
    const idx = toasts.value.indexOf(t)
    if (idx > -1) toasts.value.splice(idx, 1)
  }, 3000)
}

let nextId = 1
async function fetchConfigs() {
  try {
    const res = await fetch('/api/configs')
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    configs.value = data.map(c => ({ ...c, _id: nextId++ }))
  } catch {
    toast('Failed to load configs', true)
  } finally {
    loading.value = false
  }
}

async function persistOrder() {
  const names = configs.value.map(c => c.name)
  try {
    await fetch('/api/order', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names })
    })
  } catch { /* silent */ }
}

async function deleteConfig(name) {
  deleteTarget.value = name
}

const confirmRef = ref(null)
const renameRef = ref(null)

async function confirmDelete(password) {
  const name = deleteTarget.value
  try {
    const res = await fetch(`/api/configs/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': password }
    })
    if (res.status === 403) {
      confirmRef.value?.showError('Password incorrect')
      return
    }
    if (!res.ok) throw new Error('Failed to delete')
    deleteTarget.value = null
    configs.value = configs.value.filter(c => c.name !== name)
    toast('Config deleted')
  } catch {
    toast('Failed to delete config', true)
    deleteTarget.value = null
  }
}

function onUploaded() {
  toast('Config uploaded successfully')
  fetchConfigs()
}

async function confirmRename(newName, password) {
  const oldName = renameTarget.value
  try {
    const res = await fetch(`/api/rename/${encodeURIComponent(oldName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': password,
      },
      body: JSON.stringify({ newName }),
    })
    if (res.status === 403) { renameRef.value?.showError('Password incorrect'); return }
    if (res.status === 409) { renameRef.value?.showError('Name already exists'); return }
    if (!res.ok) throw new Error()
    const { name: finalName } = await res.json()
    const idx = configs.value.findIndex(c => c.name === oldName)
    if (idx !== -1) configs.value[idx] = { ...configs.value[idx], name: finalName }
    renameTarget.value = null
    toast('Renamed successfully')
  } catch {
    toast('Failed to rename', true)
    renameTarget.value = null
  }
}

onMounted(fetchConfigs)
</script>

<style scoped>
.main {
  padding: 28px 28px 48px;
}

.container {
  max-width: 1080px;
  margin: 0 auto;
}

.grid-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.config-count {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.drag-hint {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
}

/* --- Entry animation (only on first load) --- */
.card-enter-anim {
  animation: card-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* --- TransitionGroup FLIP: siblings slide smoothly --- */
.flip-move {
  transition: transform 0.38s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Freeze hover effects during drag so FLIP isn't disrupted */
.grid--dragging :deep(.card:hover) {
  box-shadow: var(--shadow) !important;
}

.grid--dragging :deep(.card .shimmer) {
  display: none !important;
}

/* The original card being dragged: invisible, skip FLIP */
.card-is-dragging {
  opacity: 0 !important;
  pointer-events: none !important;
}

.card-is-dragging.flip-move {
  transition: none !important;
}

.state-box {
  text-align: center;
  padding: 100px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-art {
  margin-bottom: 8px;
  opacity: 0.85;
}

.empty-title {
  font-size: 17px;
  font-weight: 650;
  color: var(--text);
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.empty-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.loader {
  width: 28px;
  height: 28px;
  border: 2.5px solid var(--border);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* --- Footer --- */
.footer {
  margin-top: 32px;
  padding: 24px 20px;
  text-align: center;
  border-top: 1px solid var(--border);
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0 8px;
  font-size: 12.5px;
  color: var(--text-secondary);
}

.footer-authors strong {
  color: var(--text);
  font-weight: 600;
}

.footer-sep {
  opacity: 0.35;
}

.footer-email {
  color: #6366f1;
  text-decoration: none;
  transition: opacity 0.2s;
}

.footer-email:hover {
  opacity: 0.7;
}

.footer-copy {
  opacity: 0.6;
}

@media (max-width: 640px) {
  .main { padding: 16px 16px 32px; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
</style>
