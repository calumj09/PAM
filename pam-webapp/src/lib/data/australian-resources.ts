// Australian Government Resources and Services by State/Territory

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  phone?: string;
  category: 'registration' | 'childcare' | 'health' | 'emergency' | 'support' | 'financial';
}

export interface StateResources {
  state: string;
  stateCode: string;
  resources: Resource[];
  emergencyContacts: {
    title: string;
    phone: string;
    description: string;
  }[];
}

// National resources available to all states
export const nationalResources: Resource[] = [
  // Registration Services
  {
    id: 'medicare',
    title: 'Medicare - Enrol Your Baby',
    description: 'Register your newborn for Medicare to access healthcare benefits',
    url: 'https://www.servicesaustralia.gov.au/enrol-newborn-child-medicare',
    phone: '132 011',
    category: 'registration'
  },
  {
    id: 'centrelink-family',
    title: 'Centrelink - Family Payments',
    description: 'Apply for Family Tax Benefit, Parenting Payment, and other support',
    url: 'https://www.servicesaustralia.gov.au/family-payments',
    phone: '136 150',
    category: 'financial'
  },
  {
    id: 'mygov',
    title: 'myGov - Digital Services',
    description: 'Access all government services online in one place',
    url: 'https://my.gov.au',
    category: 'registration'
  },
  {
    id: 'child-care-subsidy',
    title: 'Child Care Subsidy',
    description: 'Financial assistance to help with child care costs',
    url: 'https://www.servicesaustralia.gov.au/child-care-subsidy',
    phone: '136 150',
    category: 'childcare'
  },
  {
    id: 'immunisation-register',
    title: 'Australian Immunisation Register',
    description: 'Track your child\'s immunisation history',
    url: 'https://www.servicesaustralia.gov.au/australian-immunisation-register',
    phone: '1800 653 809',
    category: 'health'
  },
  {
    id: 'raising-children',
    title: 'Raising Children Network',
    description: 'Australia\'s parenting website - expert advice and resources',
    url: 'https://raisingchildren.net.au',
    category: 'support'
  },
  {
    id: 'pregnancy-birth-baby',
    title: 'Pregnancy, Birth and Baby',
    description: 'Free advice and support through pregnancy and parenting',
    url: 'https://www.pregnancybirthbaby.org.au',
    phone: '1800 882 436',
    category: 'support'
  },
  {
    id: 'healthdirect',
    title: 'Healthdirect Helpline',
    description: '24/7 health advice from registered nurses',
    url: 'https://www.healthdirect.gov.au',
    phone: '1800 022 222',
    category: 'health'
  },
  {
    id: 'beyond-blue',
    title: 'Beyond Blue - Perinatal Support',
    description: 'Mental health support for new parents',
    url: 'https://www.beyondblue.org.au/who-does-it-affect/pregnancy-and-early-parenthood',
    phone: '1300 22 4636',
    category: 'support'
  },
  {
    id: 'panda',
    title: 'PANDA - Perinatal Anxiety & Depression',
    description: 'Support for families affected by anxiety and depression during pregnancy and early parenthood',
    url: 'https://panda.org.au',
    phone: '1300 726 306',
    category: 'support'
  }
];

// State-specific resources
export const stateResources: StateResources[] = [
  {
    state: 'New South Wales',
    stateCode: 'NSW',
    resources: [
      {
        id: 'nsw-births',
        title: 'NSW Registry of Births, Deaths & Marriages',
        description: 'Register your baby\'s birth in NSW',
        url: 'https://www.nsw.gov.au/births-deaths-marriages',
        phone: '13 77 88',
        category: 'registration'
      },
      {
        id: 'nsw-health-child',
        title: 'NSW Health - Child and Family Health Services',
        description: 'Free health checks and support for families',
        url: 'https://www.health.nsw.gov.au/kidsfamilies',
        category: 'health'
      },
      {
        id: 'nsw-parenting',
        title: 'Resourcing Parents',
        description: 'NSW parenting support and education programs',
        url: 'https://www.resourcingparents.nsw.gov.au',
        category: 'support'
      }
    ],
    emergencyContacts: [
      {
        title: 'Sydney Children\'s Hospital (Randwick)',
        phone: '(02) 9382 1111',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'The Children\'s Hospital at Westmead',
        phone: '(02) 9845 0000',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'Mothersafe Medication Helpline',
        phone: '(02) 9382 6539',
        description: 'Medication safety during pregnancy and breastfeeding'
      }
    ]
  },
  {
    state: 'Victoria',
    stateCode: 'VIC',
    resources: [
      {
        id: 'vic-births',
        title: 'Births, Deaths and Marriages Victoria',
        description: 'Register your baby\'s birth in Victoria',
        url: 'https://www.bdm.vic.gov.au',
        phone: '1300 369 367',
        category: 'registration'
      },
      {
        id: 'vic-mchn',
        title: 'Maternal & Child Health Service',
        description: 'Free service supporting families with children 0-6 years',
        url: 'https://www.health.vic.gov.au/maternal-child-health',
        phone: '13 22 29',
        category: 'health'
      },
      {
        id: 'vic-kindergarten',
        title: 'Victorian Kindergarten Programs',
        description: 'Information about funded kindergarten programs',
        url: 'https://www.vic.gov.au/kinder',
        category: 'childcare'
      }
    ],
    emergencyContacts: [
      {
        title: 'Royal Children\'s Hospital Melbourne',
        phone: '(03) 9345 5522',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'Monash Children\'s Hospital',
        phone: '(03) 8572 3000',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'Maternal & Child Health Line',
        phone: '13 22 29',
        description: '24/7 support for parents of children 0-6 years'
      }
    ]
  },
  {
    state: 'Queensland',
    stateCode: 'QLD',
    resources: [
      {
        id: 'qld-births',
        title: 'Queensland Registry of Births, Deaths and Marriages',
        description: 'Register your baby\'s birth in Queensland',
        url: 'https://www.qld.gov.au/law/births-deaths-marriages',
        phone: '13 74 68',
        category: 'registration'
      },
      {
        id: 'qld-child-health',
        title: 'Child Health Services Queensland',
        description: 'Free health checks and parenting support',
        url: 'https://www.childrens.health.qld.gov.au',
        category: 'health'
      },
      {
        id: 'qld-parenting',
        title: 'Parentline Queensland',
        description: 'Confidential phone counselling for parents',
        url: 'https://www.parentline.com.au',
        phone: '1300 301 300',
        category: 'support'
      }
    ],
    emergencyContacts: [
      {
        title: 'Queensland Children\'s Hospital',
        phone: '(07) 3068 1111',
        description: 'Emergency department open 24/7'
      },
      {
        title: '13 HEALTH',
        phone: '13 43 25 84',
        description: '24/7 health advice line'
      },
      {
        title: 'Pregnancy, Birth & Baby Helpline',
        phone: '1800 882 436',
        description: '24/7 support for expecting and new parents'
      }
    ]
  },
  {
    state: 'Western Australia',
    stateCode: 'WA',
    resources: [
      {
        id: 'wa-births',
        title: 'WA Registry of Births, Deaths and Marriages',
        description: 'Register your baby\'s birth in Western Australia',
        url: 'https://www.wa.gov.au/organisation/department-of-justice/births-deaths-and-marriages',
        phone: '1300 305 021',
        category: 'registration'
      },
      {
        id: 'wa-child-health',
        title: 'Child and Adolescent Health Service',
        description: 'Community health services for WA families',
        url: 'https://cahs.health.wa.gov.au',
        category: 'health'
      },
      {
        id: 'wa-parenting',
        title: 'Parenting WA',
        description: 'Free parenting support line',
        url: 'https://www.communities.wa.gov.au/services/parenting',
        phone: '1800 654 432',
        category: 'support'
      }
    ],
    emergencyContacts: [
      {
        title: 'Perth Children\'s Hospital',
        phone: '(08) 6456 2222',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'Ngala Parenting Line',
        phone: '(08) 9368 9368',
        description: 'Parenting support 8am-8pm, 7 days'
      },
      {
        title: 'Crisis Care',
        phone: '1800 199 008',
        description: '24/7 crisis support'
      }
    ]
  },
  {
    state: 'South Australia',
    stateCode: 'SA',
    resources: [
      {
        id: 'sa-births',
        title: 'SA Births, Deaths and Marriages',
        description: 'Register your baby\'s birth in South Australia',
        url: 'https://www.sa.gov.au/topics/family-and-community/births-deaths-and-marriages',
        phone: '131 882',
        category: 'registration'
      },
      {
        id: 'sa-child-health',
        title: 'Child and Family Health Service',
        description: 'Free health checks and parenting support',
        url: 'https://www.cyh.com',
        phone: '1300 733 606',
        category: 'health'
      },
      {
        id: 'sa-parenting',
        title: 'Parenting SA',
        description: 'Information and support for South Australian parents',
        url: 'https://parenting.sa.gov.au',
        category: 'support'
      }
    ],
    emergencyContacts: [
      {
        title: 'Women\'s and Children\'s Hospital',
        phone: '(08) 8161 7000',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'Parent Helpline',
        phone: '1300 364 100',
        description: '24/7 telephone counselling and support'
      },
      {
        title: 'Mental Health Triage',
        phone: '13 14 65',
        description: '24/7 mental health support'
      }
    ]
  },
  {
    state: 'Tasmania',
    stateCode: 'TAS',
    resources: [
      {
        id: 'tas-births',
        title: 'Tasmanian Registry of Births, Deaths and Marriages',
        description: 'Register your baby\'s birth in Tasmania',
        url: 'https://www.justice.tas.gov.au/bdm',
        phone: '1300 135 513',
        category: 'registration'
      },
      {
        id: 'tas-child-health',
        title: 'Child Health and Parenting Service',
        description: 'Free health and development checks',
        url: 'https://www.health.tas.gov.au/health-topics/child-health',
        category: 'health'
      },
      {
        id: 'tas-family-support',
        title: 'Gateway Services',
        description: 'Support services for Tasmanian families',
        url: 'https://www.communities.tas.gov.au/children/gateway-services',
        phone: '1800 171 233',
        category: 'support'
      }
    ],
    emergencyContacts: [
      {
        title: 'Royal Hobart Hospital',
        phone: '(03) 6166 8308',
        description: 'Paediatric emergency care'
      },
      {
        title: 'Launceston General Hospital',
        phone: '(03) 6777 6777',
        description: 'Paediatric emergency care'
      },
      {
        title: 'Parent Line Tasmania',
        phone: '1300 808 178',
        description: '24/7 parenting support'
      }
    ]
  },
  {
    state: 'Australian Capital Territory',
    stateCode: 'ACT',
    resources: [
      {
        id: 'act-births',
        title: 'Access Canberra - Birth Registration',
        description: 'Register your baby\'s birth in the ACT',
        url: 'https://www.accesscanberra.act.gov.au/s/article/birth-registration-tab-overview',
        phone: '13 22 81',
        category: 'registration'
      },
      {
        id: 'act-child-health',
        title: 'Maternal and Child Health Services',
        description: 'Free health checks and immunisations',
        url: 'https://www.health.act.gov.au/services-and-programs/women-youth-and-children',
        category: 'health'
      },
      {
        id: 'act-parenting',
        title: 'Parentlink',
        description: 'Parenting information and support',
        url: 'https://www.parentlink.act.gov.au',
        phone: '(02) 6207 0515',
        category: 'support'
      }
    ],
    emergencyContacts: [
      {
        title: 'Canberra Hospital',
        phone: '(02) 5124 0000',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'CALMS (Canberra After Hours)',
        phone: '1300 422 567',
        description: 'After hours medical service'
      },
      {
        title: 'Maternal and Child Health',
        phone: '(02) 5124 1493',
        description: 'Business hours support'
      }
    ]
  },
  {
    state: 'Northern Territory',
    stateCode: 'NT',
    resources: [
      {
        id: 'nt-births',
        title: 'NT Births, Deaths and Marriages',
        description: 'Register your baby\'s birth in the Northern Territory',
        url: 'https://nt.gov.au/law/bdm',
        phone: '1300 305 021',
        category: 'registration'
      },
      {
        id: 'nt-child-health',
        title: 'NT Child and Family Health Services',
        description: 'Health checks and family support',
        url: 'https://nt.gov.au/wellbeing/healthy-children-and-families',
        category: 'health'
      },
      {
        id: 'nt-family-support',
        title: 'Parenting NT',
        description: 'Territory-wide parenting support services',
        url: 'https://nt.gov.au/wellbeing/healthy-children-and-families/parenting',
        phone: '1800 171 233',
        category: 'support'
      }
    ],
    emergencyContacts: [
      {
        title: 'Royal Darwin Hospital',
        phone: '(08) 8922 8888',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'Alice Springs Hospital',
        phone: '(08) 8951 7777',
        description: 'Emergency department open 24/7'
      },
      {
        title: 'Crisis Line',
        phone: '1800 019 116',
        description: '24/7 crisis support'
      }
    ]
  }
];

// Get state code from coordinates (simplified - in production use a proper geocoding service)
export function getStateFromCoordinates(latitude: number, longitude: number): string {
  // Major city coordinates for state detection
  const stateCoordinates = [
    { state: 'NSW', lat: -33.8688, lng: 151.2093, range: 3 }, // Sydney
    { state: 'VIC', lat: -37.8136, lng: 144.9631, range: 3 }, // Melbourne
    { state: 'QLD', lat: -27.4698, lng: 153.0251, range: 3 }, // Brisbane
    { state: 'WA', lat: -31.9505, lng: 115.8605, range: 3 }, // Perth
    { state: 'SA', lat: -34.9285, lng: 138.6007, range: 3 }, // Adelaide
    { state: 'TAS', lat: -42.8821, lng: 147.3272, range: 3 }, // Hobart
    { state: 'ACT', lat: -35.2809, lng: 149.1300, range: 1 }, // Canberra
    { state: 'NT', lat: -12.4634, lng: 130.8456, range: 5 }, // Darwin
  ];

  // Find closest state
  let closestState = 'NSW'; // Default
  let minDistance = Infinity;

  for (const coord of stateCoordinates) {
    const distance = Math.sqrt(
      Math.pow(latitude - coord.lat, 2) + Math.pow(longitude - coord.lng, 2)
    );
    
    if (distance < minDistance && distance < coord.range) {
      minDistance = distance;
      closestState = coord.state;
    }
  }

  return closestState;
}

// Get resources for a specific state
export function getResourcesForState(stateCode: string) {
  const state = stateResources.find(s => s.stateCode === stateCode);
  return {
    national: nationalResources,
    state: state || stateResources[0], // Default to NSW if not found
  };
}