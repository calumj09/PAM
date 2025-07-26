'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { InformationCircleIcon, LinkIcon } from '@heroicons/react/24/outline'

const resourceCategories = [
  {
    title: 'Government Services',
    items: [
      { name: 'Medicare', url: 'https://www.servicesaustralia.gov.au/medicare', description: 'Health insurance and benefits' },
      { name: 'Centrelink', url: 'https://www.servicesaustralia.gov.au/centrelink', description: 'Family payments and support' },
      { name: 'Child Care Subsidy', url: 'https://www.servicesaustralia.gov.au/child-care-subsidy', description: 'Childcare financial assistance' },
    ]
  },
  {
    title: 'Health & Immunisation',
    items: [
      { name: 'Australian Immunisation Handbook', url: 'https://immunisationhandbook.health.gov.au/', description: 'Official immunisation guidelines' },
      { name: 'Pregnancy, Birth & Baby', url: 'https://www.pregnancybirthbaby.org.au/', description: 'Health information and support' },
    ]
  },
  {
    title: 'Emergency Contacts',
    items: [
      { name: 'Emergency Services', url: 'tel:000', description: 'Police, Fire, Ambulance' },
      { name: 'Poison Information Centre', url: 'tel:13-11-26', description: '24/7 poison advice' },
      { name: 'Parenting Helpline', url: 'tel:1300-301-300', description: 'Parenting support and advice' },
    ]
  }
]

export default function InfoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">
          Info Hub
        </h1>
        <p className="text-gray-600 mt-1">
          Australian government services and parenting resources
        </p>
      </div>

      {resourceCategories.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5 text-pam-red" />
              {category.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {category.items.map((item, itemIndex) => (
              <a
                key={itemIndex}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <LinkIcon className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0 mt-1" />
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-500">
            <p>Location-specific information will be customized based on your state/territory.</p>
            <p className="mt-1">Need help finding something? Contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}