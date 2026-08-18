<script setup lang="ts">
import LandingHeader from './landing/LandingHeader.vue'
import LandingHero from './landing/LandingHero.vue'
import LandingStatsTicker from './landing/LandingStatsTicker.vue'
import LandingPipelineDemo from './landing/LandingPipelineDemo.vue'
import LandingBentoFeatures from './landing/LandingBentoFeatures.vue'
import LandingAiCoachDemo from './landing/LandingAiCoachDemo.vue'
import LandingProposalWorkflow from './landing/LandingProposalWorkflow.vue'
import LandingRoiCalculator from './landing/LandingRoiCalculator.vue'
import LandingClientPortalSpotlight from './landing/LandingClientPortalSpotlight.vue'
import LandingTestimonials from './landing/LandingTestimonials.vue'
import LandingPricing from './landing/LandingPricing.vue'
import LandingFaq from './landing/LandingFaq.vue'
import LandingCtaBanner from './landing/LandingCtaBanner.vue'
import LandingFooter from './landing/LandingFooter.vue'
</script>

<template>
  <div class="min-h-dvh bg-canvas text-ink selection:bg-accent-soft selection:text-ink">
    <!-- 1. Sticky Navigation Header -->
    <LandingHeader />

    <main>
      <!-- 2. Hero Section -->
      <LandingHero />

      <!-- 3. Social Proof Stats Ticker -->
      <LandingStatsTicker />

      <!-- 4. Interactive Live CRM Pipeline Demo -->
      <LandingPipelineDemo />

      <!-- 5. Bento Box Core Features Grid -->
      <LandingBentoFeatures />

      <!-- 6. Interactive AI Sales Coach Simulator -->
      <LandingAiCoachDemo />

      <!-- 7. Proposal to Contract Workflow -->
      <LandingProposalWorkflow />

      <!-- 8. Interactive Freelancer ROI Calculator -->
      <LandingRoiCalculator />

      <!-- 9. Client Portal Spotlight -->
      <LandingClientPortalSpotlight />

      <!-- 10. Developer Testimonials & Case Studies -->
      <LandingTestimonials />

      <!-- 11. Transparent Pricing Tiers -->
      <LandingPricing />

      <!-- 12. Frequently Asked Questions (FAQ) -->
      <LandingFaq />

      <!-- 13. Final Call to Action Banner -->
      <LandingCtaBanner />
    </main>

    <!-- 14. Footer -->
    <LandingFooter />
  </div>
</template>
