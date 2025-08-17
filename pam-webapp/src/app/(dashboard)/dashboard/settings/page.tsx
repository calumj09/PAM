import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { CalendarSyncSettings } from '@/components/settings/CalendarSyncSettings'
import { ChildrenManagement } from '@/components/settings/ChildrenManagement'
import { AccountManagement } from '@/components/settings/AccountManagement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { UserIcon, CogIcon } from '@heroicons/react/24/outline'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Get user profile and subscription status
  const [profileResult, subscriptionResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('plan_type', 'premium')
      .single()
  ])

  const profile = profileResult.data
  const isPremium = !!subscriptionResult.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CogIcon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <div className="px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground">
                {user.email}
              </div>
            </div>
            
            {profile && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    State/Territory
                  </label>
                  <div className="px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground">
                    {profile.state_territory || 'Not specified'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Postcode
                  </label>
                  <div className="px-3 py-2 bg-muted border border-border rounded-lg text-muted-foreground">
                    {profile.postcode || 'Not specified'}
                  </div>
                </div>
              </>
            )}
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Account created: {new Date(user.created_at).toLocaleDateString('en-AU')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Children Management */}
        <ChildrenManagement userId={user.id} />

        {/* Notification Settings */}
        <NotificationSettings userId={user.id} />

        {/* Calendar Integration */}
        <CalendarSyncSettings userId={user.id} isPremium={isPremium} />

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg"></span>
              About PAM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">Parenting Assistance Mobile</h3>
              <p className="text-sm text-muted-foreground mb-4">
                PAM is designed specifically for Australian parents with children aged 0-3 years, 
                providing automated checklists, baby tracking, and reminders tailored to Australian 
                healthcare and government requirements.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-1">Features</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Automated immunisation schedule</li>
                  <li>• Government registration tasks</li>
                  <li>• Baby activity tracking</li>
                  <li>• Voice recognition support</li>
                  <li>• Push notifications</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-1">Australian Compliance</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• DD/MM/YYYY date format</li>
                  <li>• Australian English</li>
                  <li>• State-specific links</li>
                  <li>• Local healthcare guidelines</li>
                  <li>• Privacy Act compliant</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Version 1.0.0 • Built with ❤️ for Australian families
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">Your Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All your data is securely stored and encrypted. You have full control over your information.
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data storage:</span>
                  <span className="font-medium text-foreground">Encrypted in Australia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data sharing:</span>
                  <span className="font-medium text-foreground">Never shared with third parties</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data retention:</span>
                  <span className="font-medium text-foreground">Until you delete your account</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                PAM complies with the Australian Privacy Principles and GDPR where applicable.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <AccountManagement userId={user.id} userEmail={user.email || ''} />
      </div>
    </div>
  )
}