<template>
  <div class="card" :style="cardStyle">
    <button class="delete-btn" @click.stop="$emit('delete', config.name)" title="Delete">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
    </button>

    <div class="drag-handle">
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
        <circle cx="2.5" cy="2.5" r="1.2" fill="currentColor"/>
        <circle cx="7.5" cy="2.5" r="1.2" fill="currentColor"/>
        <circle cx="2.5" cy="8" r="1.2" fill="currentColor"/>
        <circle cx="7.5" cy="8" r="1.2" fill="currentColor"/>
        <circle cx="2.5" cy="13.5" r="1.2" fill="currentColor"/>
        <circle cx="7.5" cy="13.5" r="1.2" fill="currentColor"/>
      </svg>
    </div>

    <div class="card-banner" :style="bannerStyle">
      <div class="banner-deco">
        <div class="ring r1"></div>
        <div class="ring r2"></div>
        <div class="shimmer"></div>
      </div>
      <div class="banner-content">
        <svg class="file-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 3h10l6 6v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
          <path d="M16 3v6h6" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
        </svg>
        <span class="badge">.YML</span>
      </div>
    </div>

    <div class="card-body">
      <div class="file-name-row">
        <h3 class="file-name" :title="config.name">{{ displayName }}</h3>
        <button class="rename-btn" @click.stop="emit('rename', config.name)" title="Rename">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="file-meta">
        <span>{{ formatSize(config.size) }}</span>
        <span class="sep">/</span>
        <span>{{ formatDate(config.uploadedAt) }}</span>
      </div>
    </div>

    <div class="card-actions">
      <button class="action-btn view-btn" @click.stop="$emit('view', config.name)">
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
          <ellipse cx="7" cy="7" rx="5.5" ry="3.5" stroke="currentColor" stroke-width="1.2"/>
          <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
        </svg>
        View
      </button>
      <button class="action-btn copy-btn" :class="{ copied }" @click.stop="copyLink">
        <span class="copy-particles" v-if="copied">
          <i v-for="n in 8" :key="n"></i>
        </span>
        <Transition name="copy-icon" mode="out-in">
          <svg v-if="!copied" key="copy" width="12" height="12" viewBox="0 0 14 14" fill="none">
            <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
            <path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6a1 1 0 001 1h1" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          <svg v-else key="check" width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5l3 3 5-5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </Transition>
        <Transition name="copy-text" mode="out-in">
          <span v-if="!copied" key="t1">Copy</span>
          <span v-else key="t2">Copied</span>
        </Transition>
      </button>
      <button class="action-btn download-btn" :class="{ downloading }" :style="downloadStyle" @click.stop="download">
        <svg v-if="!downloading" width="11" height="11" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M4 7l3 3 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 11.5h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <svg v-else class="spin" width="11" height="11" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
          <path d="M12 7a5 5 0 00-5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ downloading ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  config: { type: Object, required: true }
})

const emit = defineEmits(['delete', 'view', 'rename'])

const copied = ref(false)
const downloading = ref(false)

const palettes = [
  { from: '#6366f1', to: '#a78bfa' },
  { from: '#f43f5e', to: '#fb7185' },
  { from: '#f97316', to: '#fbbf24' },
  { from: '#10b981', to: '#34d399' },
  { from: '#8b5cf6', to: '#c084fc' },
  { from: '#0891b2', to: '#22d3ee' },
  { from: '#ec4899', to: '#f9a8d4' },
  { from: '#0ea5e9', to: '#7dd3fc' },
  { from: '#14b8a6', to: '#5eead4' },
  { from: '#e11d48', to: '#f472b6' },
  { from: '#7c3aed', to: '#818cf8' },
  { from: '#ea580c', to: '#fb923c' },
]

function hashName(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const palette = computed(() => palettes[hashName(props.config.name) % palettes.length])

const cardStyle = computed(() => ({
  '--c-from': palette.value.from,
  '--c-to': palette.value.to,
}))

const bannerStyle = computed(() => ({
  background: `linear-gradient(135deg, ${palette.value.from}, ${palette.value.to})`,
}))

const downloadStyle = computed(() => ({
  background: palette.value.from,
  boxShadow: `0 2px 8px ${palette.value.from}33`,
}))

const displayName = computed(() => {
  return props.config.name.replace(/\.(yml|yaml)$/i, '')
})

function getDownloadUrl() {
  return `${window.location.origin}/api/download/${encodeURIComponent(props.config.name)}`
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(getDownloadUrl())
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const input = document.createElement('input')
    input.value = getDownloadUrl()
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

async function download() {
  if (downloading.value) return
  downloading.value = true
  try {
    const res = await fetch(getDownloadUrl())
    if (!res.ok) throw new Error()
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = props.config.name
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    // fallback
    const a = document.createElement('a')
    a.href = getDownloadUrl()
    a.download = props.config.name
    a.click()
  } finally {
    setTimeout(() => { downloading.value = false }, 600)
  }
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
  return d.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.card {
  position: relative;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: visible;
  display: flex;
  flex-direction: column;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  transition: box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              translate 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  touch-action: none;
}

.card:active {
  cursor: grabbing;
}

.card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04);
  translate: 0 -4px;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  opacity: 0;
  transition: all 0.2s;
  z-index: 2;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.08);
}

.card:hover .delete-btn { opacity: 1; }
.delete-btn:hover { background: rgba(0, 0, 0, 0.25); color: #fff; }

.drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  opacity: 0;
  transition: all 0.2s;
  z-index: 2;
}

.card:hover .drag-handle { opacity: 1; }
.drag-handle:hover { color: rgba(255, 255, 255, 0.8); }

.card-banner {
  position: relative;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}

.banner-deco {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
}

.r1 { width: 120px; height: 120px; top: -40px; right: -30px; }
.r2 { width: 80px; height: 80px; bottom: -30px; left: -20px; }

.shimmer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.06) 45%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.06) 55%,
    transparent 60%
  );
  transform: translateX(-100%);
  transition: transform 0.8s ease;
}

.card:hover .shimmer {
  transform: translateX(30%);
}

.banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.file-icon { opacity: 0.9; }

.badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  padding: 3px 10px;
  border-radius: 20px;
}

.card-body {
  padding: 14px 16px 0;
  flex: 1;
}

.file-name-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.file-name {
  font-size: 13.5px;
  font-weight: 650;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.1px;
  flex: 1;
  min-width: 0;
}

.rename-btn {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  opacity: 0;
  transition: all 0.2s;
}

.card:hover .rename-btn {
  opacity: 1;
}

.rename-btn:hover {
  background: var(--border);
  color: var(--text);
}

.file-meta {
  font-size: 11.5px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
}

.sep {
  opacity: 0.35;
  font-weight: 300;
}

.card-actions {
  padding: 12px 14px 14px;
  display: flex;
  gap: 6px;
  position: relative;
  overflow: visible;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 7px 0;
  border-radius: 8px;
  font-size: 10.5px;
  font-weight: 600;
  transition: all 0.2s;
  letter-spacing: 0.1px;
  line-height: 1;
}

.view-btn {
  background: var(--bg);
  color: var(--text-secondary);
}

.view-btn:hover {
  background: var(--border);
  color: var(--text);
}

.view-btn:hover svg {
  animation: eye-blink 0.5s ease;
}

@keyframes eye-blink {
  0%   { transform: scaleY(1); }
  30%  { transform: scaleY(0.2); }
  60%  { transform: scaleY(1.1); }
  100% { transform: scaleY(1); }
}

.copy-btn {
  background: var(--bg);
  color: var(--text-secondary);
  position: relative;
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.copy-btn:hover {
  background: var(--border);
  color: var(--text);
}

.copy-btn.copied {
  background: #10b981;
  color: #fff;
  animation: copy-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes copy-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* Particle burst */
.copy-particles {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  z-index: 10;
}

.copy-particles i {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: particle-burst 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.copy-particles i:nth-child(odd) {
  width: 6px;
  height: 6px;
  border-radius: 2px;
}

.copy-particles i:nth-child(1) {
  background: #fbbf24;
  --px: -36px;
  --py: -32px;
}
.copy-particles i:nth-child(2) {
  background: #f472b6;
  --px: 38px;
  --py: -28px;
}
.copy-particles i:nth-child(3) {
  background: #60a5fa;
  --px: -40px;
  --py: 16px;
}
.copy-particles i:nth-child(4) {
  background: #a78bfa;
  --px: 34px;
  --py: 30px;
}
.copy-particles i:nth-child(5) {
  background: #34d399;
  --px: -12px;
  --py: -40px;
}
.copy-particles i:nth-child(6) {
  background: #fb923c;
  --px: 42px;
  --py: 6px;
}
.copy-particles i:nth-child(7) {
  background: #f43f5e;
  --px: -32px;
  --py: -10px;
}
.copy-particles i:nth-child(8) {
  background: #6366f1;
  --px: 10px;
  --py: 36px;
}

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--px)), calc(-50% + var(--py))) scale(0);
    opacity: 0;
  }
}

/* Icon transition */
.copy-icon-enter-active,
.copy-icon-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.copy-icon-enter-from {
  opacity: 0;
  transform: scale(0.5) rotate(-15deg);
}
.copy-icon-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(15deg);
}

/* Text transition */
.copy-text-enter-active,
.copy-text-leave-active {
  transition: all 0.2s ease;
}
.copy-text-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.copy-text-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.download-btn {
  color: #fff;
  transition: all 0.2s;
  overflow: hidden;
}

.download-btn:hover:not(.downloading) {
  opacity: 0.88;
  transform: translateY(-1px);
}

.download-btn:hover:not(.downloading) svg {
  animation: download-loop 0.55s ease forwards;
}

@keyframes download-loop {
  0%   { transform: translateY(0);    opacity: 1; animation-timing-function: ease-in; }
  38%  { transform: translateY(10px);  opacity: 0; }
  39%  { transform: translateY(-10px); opacity: 0; animation-timing-function: ease-out; }
  100% { transform: translateY(0);    opacity: 1; }
}

.download-btn.downloading {
  opacity: 0.75;
  cursor: not-allowed;
}

.spin {
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
