<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { BaseButton } from '@/shared/components/base'

const { t } = useI18n()
</script>

<template>
  <div class="not-found">
    <!-- Decorative floating rings -->
    <div class="not-found__ring not-found__ring--1" aria-hidden="true" />
    <div class="not-found__ring not-found__ring--2" aria-hidden="true" />

    <div class="not-found__content">
      <span class="not-found__code">404</span>

      <h1 class="not-found__title">
        {{ t('common.errors.notFoundTitle') }}
      </h1>

      <p class="not-found__description">
        {{ t('common.errors.notFoundMessage') }}
      </p>

      <RouterLink to="/app" class="not-found__cta">
        <BaseButton>{{ t('common.nav.dashboard') }}</BaseButton>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: var(--color-canvas);
}

/* ---------- decorative rings ---------- */
.not-found__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  opacity: 0.35;
  pointer-events: none;
}

.not-found__ring--1 {
  width: 420px;
  height: 420px;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  animation: pulse-ring 6s ease-in-out infinite;
}

.not-found__ring--2 {
  width: 620px;
  height: 620px;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  animation: pulse-ring 6s ease-in-out 1.5s infinite;
  opacity: 0.18;
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.15;
  }
}

/* ---------- main content ---------- */
.not-found__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 2rem;
}

.not-found__code {
  font-family: var(--font-display, system-ui);
  font-size: clamp(6rem, 18vw, 10rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(
    135deg,
    var(--color-accent) 0%,
    color-mix(in oklab, var(--color-accent) 50%, var(--color-ink)) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  user-select: none;
  animation: fade-in-up 0.6s ease-out both;
}

.not-found__title {
  font-family: var(--font-display, system-ui);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-ink);
  animation: fade-in-up 0.6s ease-out 0.15s both;
}

.not-found__description {
  font-size: 0.9375rem;
  color: var(--color-muted);
  max-width: 28rem;
  line-height: 1.6;
  animation: fade-in-up 0.6s ease-out 0.3s both;
}

.not-found__cta {
  margin-top: 0.5rem;
  animation: fade-in-up 0.6s ease-out 0.45s both;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
