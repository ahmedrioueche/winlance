<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Globe, Github, Twitter, Linkedin } from 'lucide-vue-next'

import { AppLogo, ThemeToggle } from '@/shared/components/base'

const { t, locale } = useI18n()

function toggleLocale() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr'
}
</script>

<template>
  <footer class="border-t border-border bg-canvas-elevated py-16 text-xs text-ink-soft">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border">
        <!-- Col 1: Brand Info -->
        <div class="space-y-4 md:col-span-1">
          <RouterLink to="/" class="flex items-center gap-2">
            <AppLogo class="h-7 w-auto text-accent" />
          </RouterLink>
          <p class="text-xs text-ink-soft leading-relaxed">
            {{ t('home.landing.footer.tagline') }}
          </p>
          <div class="flex items-center gap-3 pt-2">
            <a href="https://github.com" target="_blank" rel="noopener" class="p-2 rounded-lg bg-canvas hover:text-accent transition-colors border border-border">
              <Github class="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener" class="p-2 rounded-lg bg-canvas hover:text-accent transition-colors border border-border">
              <Twitter class="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" class="p-2 rounded-lg bg-canvas hover:text-accent transition-colors border border-border">
              <Linkedin class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Col 2: Product -->
        <div>
          <h4 class="font-bold text-ink mb-4 uppercase tracking-wider text-[11px]">Product</h4>
          <ul class="space-y-2.5">
            <li><a href="#features" class="hover:text-accent transition-colors">Core Modules</a></li>
            <li><a href="#demos" class="hover:text-accent transition-colors">Interactive Pipeline</a></li>
            <li><a href="#demos" class="hover:text-accent transition-colors">AI Sales Coach</a></li>
            <li><a href="#roi" class="hover:text-accent transition-colors">ROI Calculator</a></li>
            <li><a href="#pricing" class="hover:text-accent transition-colors">Pricing Tiers</a></li>
          </ul>
        </div>

        <!-- Col 3: Resources -->
        <div>
          <h4 class="font-bold text-ink mb-4 uppercase tracking-wider text-[11px]">Resources</h4>
          <ul class="space-y-2.5">
            <li><RouterLink to="/app/guide" class="hover:text-accent transition-colors">Marketing Playbook</RouterLink></li>
            <li><RouterLink to="/login" class="hover:text-accent transition-colors">Developer Portal</RouterLink></li>
            <li><a href="#faq" class="hover:text-accent transition-colors">FAQ</a></li>
            <li><RouterLink to="/login" class="hover:text-accent transition-colors">Sign In</RouterLink></li>
          </ul>
        </div>

        <!-- Col 4: Settings & Preferences -->
        <div class="space-y-4">
          <h4 class="font-bold text-ink mb-4 uppercase tracking-wider text-[11px]">Preferences</h4>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="toggleLocale"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase text-ink-soft hover:text-ink bg-canvas border border-border transition-all"
            >
              <Globe class="w-3.5 h-3.5 text-accent" />
              <span>Language: {{ locale.toUpperCase() }}</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <div>
          &copy; {{ new Date().getFullYear() }} Winlance Inc. {{ t('home.landing.footer.rights') }}
        </div>
        <div class="flex items-center gap-6">
          <a href="#" class="hover:text-ink transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-ink transition-colors">Terms of Service</a>
          <a href="#" class="hover:text-ink transition-colors">Security</a>
        </div>
      </div>
    </div>
  </footer>
</template>
