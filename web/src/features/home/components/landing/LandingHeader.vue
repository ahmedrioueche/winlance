<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { 
  Globe, 
  Menu, 
  X, 
  Kanban, 
  Layers, 
  Calculator, 
  Zap, 
  HelpCircle,
  ChevronRight,
  LogIn,
  Sparkles
} from 'lucide-vue-next'

import { AppLogo, BaseButton, ThemeToggle } from '@/shared/components/base'

import { setAppLocale } from '@/i18n'

const { t, locale } = useI18n()

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const activeSection = ref<string>('')
const linkRefs = ref<Record<string, HTMLElement | null>>({})

const navItems = computed(() => [
  { id: 'demos', label: t('home.landing.nav.demos'), icon: Kanban },
  { id: 'features', label: t('home.landing.nav.features'), icon: Layers },
  { id: 'roi', label: t('home.landing.nav.roi'), icon: Calculator },
  { id: 'pricing', label: t('home.landing.nav.pricing'), icon: Zap },
  { id: 'faq', label: t('home.landing.nav.faq'), icon: HelpCircle }
])

// Dynamic position styling for the sliding active indicator pill (desktop)
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

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
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
  setAppLocale(locale.value === 'fr' ? 'en' : 'fr')
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
  closeMobileMenu()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToSection(e: Event, id: string) {
  e.preventDefault()
  activeSection.value = id
  updateIndicator()
  closeMobileMenu()
  const target = document.getElementById(id)
  if (target) {
    const yOffset = -90 // offset for fixed header
    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

function handleResize() {
  updateIndicator()
  if (window.innerWidth >= 768) {
    closeMobileMenu()
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
  window.addEventListener('resize', handleResize)
  nextTick(() => {
    handleScroll()
    updateIndicator()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <header
    class="fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b"
    :class="[
      isScrolled || isMobileMenuOpen
        ? 'bg-canvas/90 backdrop-blur-md border-border py-3 shadow-lift'
        : 'bg-transparent border-transparent py-4 sm:py-5'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <!-- Brand Logo -->
      <a href="#" @click="scrollToTop" class="flex items-center gap-2 group cursor-pointer" title="Scroll to Top">
        <AppLogo class="h-8 w-auto text-accent transition-transform duration-300 group-hover:scale-105" />
      </a>

      <!-- Desktop Navigation Links with Animated Sliding Pill Indicator -->
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

      <!-- Desktop & Mobile Header Controls -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Desktop Language Switcher -->
        <button
          type="button"
          @click="toggleLocale"
          class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase text-ink-soft hover:text-ink hover:bg-canvas-elevated border border-border transition-all"
          :title="`Switch to ${locale === 'en' ? 'French' : 'English'}`"
        >
          <Globe class="w-3.5 h-3.5 text-accent" />
          <span>{{ locale }}</span>
        </button>

        <!-- Desktop Theme Toggle -->
        <div class="hidden sm:block">
          <ThemeToggle />
        </div>

        <!-- Login Link (Desktop) -->
        <RouterLink to="/login" class="hidden sm:inline-block">
          <BaseButton variant="ghost" size="sm">
            {{ t('home.landing.nav.login') }}
          </BaseButton>
        </RouterLink>

        <!-- Primary CTA (Visible desktop & mobile) -->
        <RouterLink to="/register">
          <BaseButton size="sm" class="shadow-md shadow-accent/20 text-xs px-3 sm:px-4 py-1.5">
            <span>{{ t('home.landing.nav.getStarted') }}</span>
          </BaseButton>
        </RouterLink>

        <!-- Slick Mobile Hamburger Menu Button -->
        <button
          type="button"
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-xl text-ink-soft hover:text-ink bg-canvas-elevated/80 border border-border/80 focus:outline-none transition-all duration-200"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle Navigation Menu"
        >
          <Transition name="fade" mode="out-in">
            <X v-if="isMobileMenuOpen" class="w-5 h-5 text-accent" />
            <Menu v-else class="w-5 h-5" />
          </Transition>
        </button>
      </div>
    </div>

    <!-- Slick Mobile Dropdown Menu Drawer -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-4 scale-95"
    >
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden absolute top-full inset-x-0 bg-canvas/95 backdrop-blur-2xl border-b border-border shadow-2xl px-4 py-5 overflow-hidden"
      >
        <div class="max-w-7xl mx-auto space-y-4">
          <!-- Mobile Nav Items -->
          <div class="space-y-1">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-muted px-3 mb-2 flex items-center gap-1.5">
              <Sparkles class="w-3 h-3 text-accent" />
              <span>Navigation</span>
            </div>

            <a
              v-for="item in navItems"
              :key="item.id"
              :href="`#${item.id}`"
              @click="(e) => scrollToSection(e, item.id)"
              class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              :class="[
                activeSection === item.id
                  ? 'bg-accent-soft text-accent border border-accent/30 font-bold'
                  : 'text-ink-soft hover:text-ink hover:bg-canvas-elevated'
              ]"
            >
              <span class="flex items-center gap-3">
                <component :is="item.icon" class="w-4 h-4 text-accent" />
                <span>{{ item.label }}</span>
              </span>
              <ChevronRight class="w-4 h-4 opacity-50" />
            </a>
          </div>

          <!-- Divider -->
          <div class="border-t border-border/80 my-3"></div>

          <!-- Mobile Controls & Settings -->
          <div class="space-y-3">
            <div class="text-[10px] font-extrabold uppercase tracking-wider text-muted px-3 mb-1">
              Preferences & Account
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <!-- Language Switcher Button Mobile -->
              <button
                type="button"
                @click="toggleLocale"
                class="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-canvas-elevated border border-border text-xs font-semibold text-ink hover:border-accent/40 transition-colors"
              >
                <Globe class="w-4 h-4 text-accent" />
                <span>Lang: {{ locale.toUpperCase() }}</span>
              </button>

              <!-- Theme Toggle Mobile Wrapper -->
              <div class="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-canvas-elevated border border-border text-xs font-semibold text-ink">
                <span>Theme:</span>
                <ThemeToggle />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5 pt-1">
              <RouterLink to="/login" @click="closeMobileMenu" class="w-full">
                <BaseButton variant="secondary" size="sm" class="w-full justify-center gap-1.5 py-2 text-xs">
                  <LogIn class="w-3.5 h-3.5" />
                  <span>{{ t('home.landing.nav.login') }}</span>
                </BaseButton>
              </RouterLink>

              <RouterLink to="/register" @click="closeMobileMenu" class="w-full">
                <BaseButton size="sm" class="w-full justify-center gap-1.5 py-2 text-xs shadow-md shadow-accent/20">
                  <span>{{ t('home.landing.nav.getStarted') }}</span>
                </BaseButton>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Mobile Menu Backdrop Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="md:hidden fixed inset-0 top-[65px] bg-black/40 backdrop-blur-xs z-40"
        aria-hidden="true"
      />
    </Transition>
  </header>
</template>
