import { Metadata } from 'next'

export const baseMetadata: Metadata = {
  metadataBase: new URL('https://pam.app'),
  title: {
    default: 'PAM - Parenting Made Simple for the First 1000 Days',
    template: '%s | PAM'
  },
  description: 'PAM is your trusted companion through pregnancy and early parenthood. Track milestones, manage appointments, and never miss what matters most for Australian parents.',
  keywords: ['parenting app', 'baby tracker', 'child development', 'Australian parents', 'baby milestones', 'immunization tracker', 'parenting checklist', 'first 1000 days'],
  authors: [{ name: 'PAM Team' }],
  creator: 'PAM',
  publisher: 'PAM',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://pam.app',
    title: 'PAM - Parenting Made Simple',
    description: 'Your trusted companion through pregnancy and early parenthood. Track milestones, manage appointments, and never miss what matters most.',
    siteName: 'PAM',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PAM - Parenting Made Simple',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PAM - Parenting Made Simple',
    description: 'Your trusted companion through pregnancy and early parenthood.',
    images: ['/twitter-image.png'],
    creator: '@pamapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export const homepageMetadata: Metadata = {
  ...baseMetadata,
  alternates: {
    canonical: 'https://pam.app',
  },
}

export const aboutMetadata: Metadata = {
  title: 'About Us',
  description: 'Learn about PAM\'s mission to make parenting easier for Australian families by providing the right tools and information at the right time.',
  alternates: {
    canonical: 'https://pam.app/about',
  },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'About PAM - Our Story',
    description: 'Learn about PAM\'s mission to make parenting easier for Australian families.',
    url: 'https://pam.app/about',
  },
}

export const featuresMetadata: Metadata = {
  title: 'Features',
  description: 'Discover PAM\'s comprehensive features: smart checklists, baby tracker, calendar sync, AI assistant, growth tracking, and more for Australian parents.',
  alternates: {
    canonical: 'https://pam.app/features',
  },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'PAM Features - Everything You Need for Parenting',
    description: 'Smart checklists, baby tracker, calendar sync, AI assistant, and more.',
    url: 'https://pam.app/features',
  },
}

export const pricingMetadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for PAM. Start free, upgrade when you need more. No hidden fees, cancel anytime.',
  alternates: {
    canonical: 'https://pam.app/pricing',
  },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'PAM Pricing - Simple & Transparent',
    description: 'Start free, upgrade when you need more. No hidden fees, cancel anytime.',
    url: 'https://pam.app/pricing',
  },
}

export const supportMetadata: Metadata = {
  title: 'Support & Help Center',
  description: 'Get help with PAM. Find guides, tutorials, FAQs, and contact our support team for assistance with your parenting app.',
  alternates: {
    canonical: 'https://pam.app/support',
  },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'PAM Support - Help Center',
    description: 'Find guides, tutorials, FAQs, and get help with PAM parenting app.',
    url: 'https://pam.app/support',
  },
}

export const demoMetadata: Metadata = {
  title: 'Demo - See PAM in Action',
  description: 'Experience PAM with our interactive demo. See screenshots and explore features of the Australian parenting app that simplifies your first 1000 days.',
  alternates: {
    canonical: 'https://pam.app/demo',
  },
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'PAM Demo - See the App in Action',
    description: 'Interactive demo and screenshots of PAM parenting app features.',
    url: 'https://pam.app/demo',
  },
}