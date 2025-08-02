const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please run with: NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key node scripts/delete-user.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function deleteUser(email) {
  try {
    console.log(`Attempting to delete user: ${email}`)
    
    // First, find the user in profiles
    console.log('1. Looking up user in profiles...')
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
    
    if (profileError) {
      console.error('Error finding profile:', profileError)
      return
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No profile found with that email')
      
      // Try to find by auth.users table through a child record
      console.log('2. Checking for any children records...')
      const { data: allChildren, error: childrenError } = await supabase
        .from('children')
        .select('user_id')
      
      if (childrenError) {
        console.error('Error checking children:', childrenError)
      } else {
        console.log(`Found ${allChildren?.length || 0} total children records`)
      }
      
      console.log('\nNOTE: To fully delete a user, you need:')
      console.log('1. Supabase Dashboard access or service role key')
      console.log('2. Delete from auth.users table (requires admin access)')
      console.log('3. Delete from profiles table')
      console.log('4. Delete related records (children, checklist_items, etc.)')
      return
    }
    
    const userId = profiles[0].id
    console.log(`Found user with ID: ${userId}`)
    
    // Delete related data in order (due to foreign key constraints)
    console.log('3. Deleting related data...')
    
    // Delete checklist items
    const { error: checklistError } = await supabase
      .from('checklist_items')
      .delete()
      .eq('user_id', userId)
    
    if (checklistError) {
      console.error('Error deleting checklist items:', checklistError)
    } else {
      console.log('✓ Checklist items deleted')
    }
    
    // Delete children
    const { error: childrenDeleteError } = await supabase
      .from('children')
      .delete()
      .eq('user_id', userId)
    
    if (childrenDeleteError) {
      console.error('Error deleting children:', childrenDeleteError)
    } else {
      console.log('✓ Children records deleted')
    }
    
    // Delete profile
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError)
    } else {
      console.log('✓ Profile deleted')
    }
    
    console.log('\n⚠️  IMPORTANT: Auth user still exists!')
    console.log('The user can still log in but will have no profile data.')
    console.log('To fully delete, you need to:')
    console.log('1. Go to Supabase Dashboard > Authentication > Users')
    console.log('2. Find the user and click "Delete user"')
    console.log('\nAlternatively, the user can sign up again with the same email.')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the deletion
deleteUser('calum@cjadvisory.com.au')