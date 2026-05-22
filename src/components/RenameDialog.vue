<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div class="confirm-overlay" v-if="visible" @click.self="cancel">
        <div class="confirm-dialog">
          <div class="confirm-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#6366f1" stroke-width="1.5" fill="none"/>
              <path d="M18 10l-7 7M10 10h4v4" stroke="#6366f1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="confirm-title">Rename Config</h3>
          <p class="confirm-desc">Rename <strong>{{ name }}</strong></p>
          <input
            ref="nameInput"
            v-model="newName"
            type="text"
            class="confirm-pass"
            placeholder="New name"
            @keyup.enter="focusPass"
          />
          <input
            ref="passInput"
            v-model="password"
            type="password"
            class="confirm-pass"
            placeholder="Enter admin password"
            @keyup.enter="confirm"
          />
          <p v-if="error" class="confirm-error">{{ error }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel" :disabled="loading" @click="cancel">Cancel</button>
            <button class="btn-rename" :disabled="!password || !newName.trim() || loading" @click="confirm">
              <svg v-if="loading" class="spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
                <path d="M12 7a5 5 0 00-5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              {{ loading ? 'Renaming...' : 'Rename' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: Boolean,
  name: String,
})

const emit = defineEmits(['confirm', 'cancel'])

const newName = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const nameInput = ref(null)
const passInput = ref(null)

watch(() => props.visible, (v) => {
  if (v) {
    newName.value = props.name ? props.name.replace(/\.(yml|yaml)$/i, '') : ''
    password.value = ''
    error.value = ''
    loading.value = false
    nextTick(() => {
      nameInput.value?.focus()
      nameInput.value?.select()
    })
  }
})

function focusPass() {
  passInput.value?.focus()
}

function confirm() {
  if (!password.value || !newName.value.trim() || loading.value) return
  loading.value = true
  emit('confirm', newName.value.trim(), password.value)
}

function cancel() {
  emit('cancel')
}

function showError(msg) {
  error.value = msg
  loading.value = false
}

defineExpose({ showError })
</script>

<style scoped>
.confirm-enter-active { transition: opacity 0.2s ease; }
.confirm-leave-active { transition: opacity 0.15s ease; }
.confirm-enter-from, .confirm-leave-to { opacity: 0; }
.confirm-enter-active .confirm-dialog { animation: cd-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.confirm-leave-active .confirm-dialog { animation: cd-out 0.15s ease forwards; }

@keyframes cd-in {
  from { opacity: 0; transform: scale(0.92) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes cd-out {
  to { opacity: 0; transform: scale(0.95) translateY(4px); }
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.confirm-dialog {
  background: var(--card-bg);
  border-radius: 18px;
  width: 100%;
  max-width: 340px;
  padding: 28px 24px 22px;
  text-align: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.confirm-icon {
  margin-bottom: 14px;
}

.confirm-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.confirm-desc {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
}

.confirm-desc strong {
  color: var(--text);
  font-weight: 600;
}

.confirm-pass {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.2s;
  margin-bottom: 8px;
  background: var(--bg);
  color: var(--text);
}

.confirm-pass:focus {
  border-color: #6366f1;
}

.confirm-error {
  font-size: 12px;
  color: #ef4444;
  margin-bottom: 4px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.confirm-actions button {
  flex: 1;
  padding: 10px 0;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: var(--border);
  color: var(--text);
}

.btn-rename {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-rename:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-rename:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.spin {
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
