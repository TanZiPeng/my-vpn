<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div class="confirm-overlay" v-if="visible" @click.self="cancel">
        <div class="confirm-dialog">
          <div class="confirm-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#ef4444" stroke-width="1.5" fill="none"/>
              <path d="M14 8v7" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
              <circle cx="14" cy="19.5" r="1.2" fill="#ef4444"/>
            </svg>
          </div>
          <h3 class="confirm-title">Delete Config</h3>
          <p class="confirm-desc">Are you sure you want to delete <strong>{{ name }}</strong>? This action cannot be undone.</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="cancel">Cancel</button>
            <button class="btn-delete" @click="confirm">Delete</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: Boolean,
  name: String,
})

const emit = defineEmits(['confirm', 'cancel'])

function confirm() { emit('confirm') }
function cancel() { emit('cancel') }
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
  margin-bottom: 22px;
}

.confirm-desc strong {
  color: var(--text);
  font-weight: 600;
}

.confirm-actions {
  display: flex;
  gap: 10px;
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

.btn-delete {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}
</style>
