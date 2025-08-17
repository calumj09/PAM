export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PAM',
  url: 'https://pam.app',
  logo: 'https://pam.app/logo.png',
  description: 'PAM is your trusted companion through pregnancy and early parenthood.',
  sameAs: [
    'https://twitter.com/pamapp',
    'https://www.facebook.com/pamapp',
    'https://www.instagram.com/pamapp'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+61-1800-PAM-APP',
    contactType: 'customer service',
    areaServed: 'AU',
    availableLanguage: 'English'
  }
}

export const mobileAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: 'PAM - Parent Admin Manager',
  operatingSystem: 'iOS, Android',
  applicationCategory: 'HealthApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'AUD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250'
  }
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I try PAM Premium before paying?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We offer a 14-day free trial of PAM Premium. No credit card required. You can cancel anytime during the trial without being charged.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I switch between plans?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. You can upgrade to Premium anytime from your account settings. If you downgrade, you\'ll keep Premium features until the end of your billing period.'
      }
    },
    {
      '@type': 'Question',
      name: 'What happens to my data if I cancel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your data is always yours. If you cancel Premium, you\'ll still have access to all your data through the free plan. Premium features will be disabled but your core tracking data remains accessible.'
      }
    }
  ]
}

export const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'PAM Premium',
  description: 'Everything you need for stress-free parenting',
  offers: {
    '@type': 'Offer',
    price: '9.99',
    priceCurrency: 'AUD',
    priceValidUntil: '2025-12-31',
    availability: 'https://schema.org/InStock'
  }
}