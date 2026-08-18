<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Globe } from 'lucide-vue-next'

import { AppLogo, BaseButton, ThemeToggle } from '@/shared/components/base'

const { t, locale } = useI18n()
const isScrolled = ref(false)
const activeSection = ref<string>('')
const linkRefs = ref<Record<string, HTMLElement | null>>({})

const navItems = computed(() => [
  { id: 'demos', label: t('home.landing.nav.demos') },
  { id: 'features', label: t('home.landing.nav.features') },
  { id: 'roi', label: t('home.landing.nav.roi') },
  { id: 'pricing', label: t('home.landing.nav.pricing') },
  { id: 'faq', label: t('home.landing.nav.faq') }
])

// Dynamic position styling for the sliding active indicator pill
const indicatorStyle = ref<{ left: string; width: string; opacity: number }>({
  left: '0px',
  width: '0px',
  opacity: 0
})

function updateIndicator() {
  if (!activeSection.value) {
    indicatorStyle.value.opacity = 0
    return
  }

  const el = linkRefs.value[activeSection.value]
  if (el) {
    indicatorStyle.value = {
      left: `${el.offsetLeft}px`,
      width: `${el.offsetWidth}px`,
      opacity: 1
    }
  } else {
    indicatorStyle.value.opacity = 0
  }
}

function handleScroll() {
  isScrolled.value = window.scrollY > 20

  // If at top (Hero section), deactivate all nav item highlights
  if (window.scrollY < 200) {
    if (activeSection.value !== '') {
      activeSection.value = ''
      updateIndicator()
    }
    return
  }

  const sectionIds = navItems.value.map(item => item.id)
  let currentActive = ''
  const headerOffset = 160

  // 1. Direct viewport top hit check
  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= headerOffset && rect.bottom > headerOffset) {
        currentActive = id
        break
      }
    }
  }

  // 2. Proximity fallback if scrolled between sections
  if (!currentActive) {
    let minDistance = Infinity
    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const dist = Math.abs(rect.top - headerOffset)
          if (dist < minDistance) {
            minDistance = dist
            currentActive = id
          }
        }
      }
    }
  }

  if (currentActive !== activeSection.value) {
    activeSection.value = currentActive
    updateIndicator()
  }
}

function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
}

function setLinkRef(id: string, el: unknown) {
  if (el && el instanceof HTMLElement) {
    linkRefs.value[id] = el
  }
}

function scrollToTop(e: Event) {
  e.preventDefault()
  activeSection.value = ''
  updateIndicator()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToSection(e: Event, id: string) {
  e.preventDefault()
  activeSection.value = id
  updateIndicator()
  const target = document.getElementById(id)
  if (target) {
    const yOffset = -90 // offset for fixed header
    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

watch(activeSection, () => {
  nextTick(updateIndicator)
})

watch(locale, () => {
  nextTick(updateIndicator)
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updateIndicator)
  nextTick(() => {
    handleScroll()
    updateIndicator()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateIndicator)
})
</script>

<template>
  <header
    class="fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b"
    :class="[
      isScrolled
        ? 'bg-canvas/85 backdrop-blur-md border-border py-3 shadow-lift'
        : 'bg-transparent border-transparent py-5'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <!-- Brand Logo -->
      <a href="#" @click="scrollToTop" class="flex items-center gap-2 group cursor-pointer" title="Scroll to Top">
        <AppLogo class="h-8 w-auto text-accent transition-transform duration-300 group-hover:scale-105" />
      </a>

      <!-- Navigation Links with Animated Sliding Pill Indicator -->
      <nav class="hidden md:flex items-center relative p-1.5 rounded-full bg-canvas-elevated/40 border border-border/50 backdrop-blur-sm">
        <!-- Animated Sliding Background Pill -->
        <div
          class="absolute rounded-full bg-accent-soft border border-accent/30 transition-all duration-300 ease-out pointer-events-none shadow-xs"
          :style="{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: '6px',
            bottom: '6px',
            opacity: indicatorStyle.opacity
          }"
        />

        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          :ref="(el) => setLinkRef(item.id, el)"
          @click="(e) => scrollToSection(e, item.id)"
          class="relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200"
          :class="[
            activeSection === item.id
              ? 'text-accent font-bold'
              : 'text-ink-soft hover:text-ink'
          ]"
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- Header Controls & CTAs -->
      <div class="flex items-center gap-3">
        <!-- Locale Switcher Button -->
        <button
          type="button"
          @click="toggleLocale"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase text-ink-soft hover:text-ink hover:bg-canvas-elevated border border-border transition-all"
          :title="`Switch to ${locale === 'en' ? 'French' : 'English'}`"
        >
          <Globe class="w-3.5 h-3.5 text-accent" />
          <span>{{ locale }}</span>
        </button>

        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Login Link -->
        <RouterLink to="/login" class="hidden sm:inline-block">
          <BaseButton variant="ghost" size="sm">
            {{ t('home.landing.nav.login') }}
          </BaseButton>
        </RouterLink>

        <!-- Primary CTA -->
        <RouterLink to="/register">
          <BaseButton size="sm" class="shadow-md shadow-accent/20">
            {{ t('home.landing.nav.getStarted') }}
          </BaseButton>
        </RouterLink>
      </div>
    </div>
  </header>
</template>
