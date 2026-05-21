<template>
  <header class="header">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="34" y2="34">
                <stop stop-color="#6366f1"/>
                <stop offset="1" stop-color="#a78bfa"/>
              </linearGradient>
            </defs>
            <circle cx="17" cy="17" r="7" stroke="url(#lg)" stroke-width="1.8" fill="none"/>
            <circle cx="17" cy="17" r="13" stroke="url(#lg)" stroke-width="1.2" fill="none" stroke-dasharray="3.5 4" opacity="0.45"/>
            <path d="M17 4v4M17 26v4M4 17h4M26 17h4" stroke="url(#lg)" stroke-width="1.3" stroke-linecap="round" opacity="0.35"/>
            <path d="M7.5 7.5l3 3M23.5 23.5l3 3M23.5 7.5l3-3M7.5 23.5l-3 3" stroke="url(#lg)" stroke-width="1.1" stroke-linecap="round" opacity="0.2"/>
            <circle cx="17" cy="17" r="2.2" fill="url(#lg)"/>
          </svg>
        </div>
        <div>
          <h1 class="title">VPN Configs</h1>
          <span class="subtitle">Share & subscribe to configuration files</span>
        </div>
      </div>
      <button class="upload-btn" @click="$emit('upload')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5v9M4.5 5l3.5-3.5L11.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2.5 11.5v2h11v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Upload
      </button>
    </div>
  </header>
</template>

<script setup>
defineEmits(['upload'])
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 16px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  flex-shrink: 0;
}

.title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--text);
}

.subtitle {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 1px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.upload-btn:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .header-inner { padding: 14px 16px; }
  .subtitle { display: none; }
  .upload-btn { padding: 8px 14px; }
}
</style>
