import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user's children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!children || children.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Children Added</h1>
          <p className="text-gray-600 mb-6">Add a child first to see their analytics and patterns.</p>
          <a 
            href="/dashboard/children" 
            className="inline-flex items-center px-4 py-2 bg-pam-red text-white rounded-lg hover:bg-pam-red/90"
          >
            Add Your First Child
          </a>
        </div>
      </div>
    )
  }

  // Use the first child by default (could add child selector later)
  const selectedChild = children[0]

  return (
    <AnalyticsDashboard 
      childId={selectedChild.id} 
      childName={selectedChild.name}
    />
  )
}