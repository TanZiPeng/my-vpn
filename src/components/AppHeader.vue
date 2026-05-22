<template>
  <header class="header">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo" @mouseenter="onLogoEnter" @mouseleave="onLogoLeave">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="34" y2="34">
                <stop stop-color="#6366f1"/>
                <stop offset="1" stop-color="#a78bfa"/>
              </linearGradient>
            </defs>
            <!-- 外六边形6段，各自用 SVG transform 做动画 -->
            <line :transform="segs[0]" x1="17" y1="2"    x2="29.5" y2="9.5"  stroke="url(#lg)" stroke-width="1.6" stroke-linecap="round"/>
            <line :transform="segs[1]" x1="29.5" y1="9.5"  x2="29.5" y2="24.5" stroke="url(#lg)" stroke-width="1.6" stroke-linecap="round"/>
            <line :transform="segs[2]" x1="29.5" y1="24.5" x2="17"   y2="32"   stroke="url(#lg)" stroke-width="1.6" stroke-linecap="round"/>
            <line :transform="segs[3]" x1="17"   y1="32"   x2="4.5"  y2="24.5" stroke="url(#lg)" stroke-width="1.6" stroke-linecap="round"/>
            <line :transform="segs[4]" x1="4.5"  y1="24.5" x2="4.5"  y2="9.5"  stroke="url(#lg)" stroke-width="1.6" stroke-linecap="round"/>
            <line :transform="segs[5]" x1="4.5"  y1="9.5"  x2="17"   y2="2"    stroke="url(#lg)" stroke-width="1.6" stroke-linecap="round"/>
            <!-- 内六边形 -->
            <polygon class="hex-inner" :style="innerStyle" points="17,8.5 24,12.5 24,21.5 17,25.5 10,21.5 10,12.5" stroke="url(#lg)" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
            <!-- 连接线 -->
            <line x1="17" y1="2"    x2="17"   y2="8.5"  stroke="url(#lg)" stroke-width="1.1" :opacity="spokeOpacity"/>
            <line x1="29.5" y1="9.5"  x2="24"   y2="12.5" stroke="url(#lg)" stroke-width="1.1" :opacity="spokeOpacity"/>
            <line x1="29.5" y1="24.5" x2="24"   y2="21.5" stroke="url(#lg)" stroke-width="1.1" :opacity="spokeOpacity"/>
            <line x1="17"   y1="32"   x2="17"   y2="25.5" stroke="url(#lg)" stroke-width="1.1" :opacity="spokeOpacity"/>
            <line x1="4.5"  y1="24.5" x2="10"   y2="21.5" stroke="url(#lg)" stroke-width="1.1" :opacity="spokeOpacity"/>
            <line x1="4.5"  y1="9.5"  x2="10"   y2="12.5" stroke="url(#lg)" stroke-width="1.1" :opacity="spokeOpacity"/>
            <circle cx="17" cy="17" :r="centerR" fill="url(#lg)"/>
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
import { ref, computed } from 'vue'

defineEmits(['upload'])

// 每段向外弹出的方向 (dx, dy)
const DIRS = [
  [0, -6],   // s1 上
  [6, -3],   // s2 右上
  [6,  3],   // s3 右下
  [0,  6],   // s4 下
  [-6,  3],  // s5 左下
  [-6, -3],  // s6 左上
]

const progress = ref(new Array(6).fill(0))
const innerScale = ref(1)
const spokeOpacity = ref(0.3)
const centerR = ref(2)

let timers = []

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeIn(t) {
  return t * t * t
}

function animateSeg(i, delay) {
  setTimeout(() => {
    const duration = 550
    const start = performance.now()
    function frame(now) {
      const t = Math.min((now - start) / duration, 1)
      // 前40%弹出，后60%收回，带弹性
      let p
      if (t < 0.4) {
        p = easeIn(t / 0.4)
      } else {
        const t2 = (t - 0.4) / 0.6
        // 弹性收回：overshoots slightly
        p = 1 - (1 + 2.5 * t2) * Math.pow(1 - t2, 2.5)
        p = Math.max(0, 1 - p)
      }
      progress.value[i] = p
      if (t < 1) requestAnimationFrame(frame)
      else progress.value[i] = 0
    }
    requestAnimationFrame(frame)
  }, delay)
}

function animateInner(delay) {
  setTimeout(() => {
    const duration = 550
    const start = performance.now()
    function frame(now) {
      const t = Math.min((now - start) / duration, 1)
      let s
      if (t < 0.4) s = 1 - easeIn(t / 0.4) * 0.5
      else s = 0.5 + easeOut((t - 0.4) / 0.6) * 0.5
      innerScale.value = s
      if (t < 1) requestAnimationFrame(frame)
      else innerScale.value = 1
    }
    requestAnimationFrame(frame)
  }, delay)
}

function animateSpokes(delay) {
  setTimeout(() => {
    const duration = 550
    const start = performance.now()
    function frame(now) {
      const t = Math.min((now - start) / duration, 1)
      let o
      if (t < 0.35) o = 0.3 * (1 - t / 0.35)
      else o = 0.3 * ((t - 0.35) / 0.65)
      spokeOpacity.value = o
      if (t < 1) requestAnimationFrame(frame)
      else spokeOpacity.value = 0.3
    }
    requestAnimationFrame(frame)
  }, delay)
}

function animateCenter(delay) {
  setTimeout(() => {
    const duration = 550
    const start = performance.now()
    function frame(now) {
      const t = Math.min((now - start) / duration, 1)
      let r
      if (t < 0.4) r = 2 + easeIn(t / 0.4) * 2.5
      else r = 4.5 - easeOut((t - 0.4) / 0.6) * 2.5
      centerR.value = r
      if (t < 1) requestAnimationFrame(frame)
      else centerR.value = 2
    }
    requestAnimationFrame(frame)
  }, delay)
}

function onLogoEnter() {
  timers.forEach(clearTimeout)
  timers = []
  const delays = [0, 40, 80, 120, 80, 40]
  delays.forEach((d, i) => animateSeg(i, d))
  animateInner(60)
  animateSpokes(30)
  animateCenter(50)
}

function onLogoLeave() {
  // 动画自然结束，不需要额外处理
}

const segs = computed(() =>
  progress.value.map((p, i) => {
    const [dx, dy] = DIRS[i]
    return `translate(${dx * p}, ${dy * p})`
  })
)

const innerStyle = computed(() => ({
  transformOrigin: '17px 17px',
  transform: `scale(${innerScale.value})`,
  opacity: innerScale.value < 1 ? 0.45 * (innerScale.value / 1) : 0.45,
}))
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
  cursor: pointer;
}

.logo svg {
  transition: filter 0.3s ease;
}

.logo:hover svg {
  filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.5));
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
  overflow: hidden;
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

.upload-btn:hover svg {
  animation: upload-loop 0.55s ease forwards;
}

@keyframes upload-loop {
  0%   { transform: translateY(0);    opacity: 1; animation-timing-function: ease-in; }
  38%  { transform: translateY(-10px); opacity: 0; }
  39%  { transform: translateY(10px);  opacity: 0; animation-timing-function: ease-out; }
  100% { transform: translateY(0);    opacity: 1; }
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
