import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get all checklist items for user's children
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('user_id', user.id)

    if (!children || children.length === 0) {
      return NextResponse.json({ error: 'No children found' }, { status: 404 })
    }

    const childIds = children.map((c: any) => c.id)

    // Get all checklist items
    const { data: items, error } = await supabase
      .from('checklist_items')
      .select('*')
      .in('child_id', childIds)
      .order('due_date')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Find duplicates
    const duplicates: any[] = []
    const seen = new Map<string, any>()

    items?.forEach((item: any) => {
      const key = `${item.child_id}-${item.title}-${item.due_date}`
      if (seen.has(key)) {
        duplicates.push(item)
      } else {
        seen.set(key, item)
      }
    })

    // Delete duplicates (keep the first occurrence)
    if (duplicates.length > 0) {
      const duplicateIds = duplicates.map(d => d.id)
      const { error: deleteError } = await supabase
        .from('checklist_items')
        .delete()
        .in('id', duplicateIds)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }
    }

    // Fix metadata for optional tasks
    const optionalTitles = [
      'Add baby to private health insurance',
      'Book baby chiropractor',
      'Book a lactation consultant',
      'Track milk supply'
    ]

    const { error: updateError } = await supabase
      .from('checklist_items')
      .update({ 
        metadata: { 
          source: 'optional_admin_checklist',
          fixed: true 
        } 
      })
      .in('child_id', childIds)
      .in('title', optionalTitles)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      duplicatesRemoved: duplicates.length,
      message: `Removed ${duplicates.length} duplicates and fixed metadata for optional tasks`
    })

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}