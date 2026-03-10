// src/routes/WorkoutVideoBookmarks.routes.ts
import { Router, Request, Response } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

// GET /api/workout-videos/bookmarks/list
router.get('/list', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const { data, error } = await supabase
      .from('workout_video_bookmarks')
      .select(`
        video_id,
        workout_videos (
          id,
          title,
          title_th,
          description,
          youtube_url,
          thumbnail_url,
          primary_category,
          goal_tags,
          equipment,
          duration_minutes,
          duration_range,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const videos = (data ?? [])
      .map((row: any) => row.workout_videos)
      .filter(Boolean)

    res.json(videos)
  } catch (err) {
    console.error('Error fetching video bookmarks:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/workout-videos/bookmarks/toggle
router.post('/toggle', async (req: Request, res: Response) => {
  const { video_id } = req.body
  const userId = (req as any).user?.id

  if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  if (!video_id) return res.status(400).json({ error: 'video_id is required' })

  try {
    const { data: existing, error: checkError } = await supabase
      .from('workout_video_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('video_id', video_id)
      .maybeSingle()

    if (checkError) throw checkError

    if (existing) {
      const { error: deleteError } = await supabase
        .from('workout_video_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('video_id', video_id)

      if (deleteError) throw deleteError
      return res.json({ bookmarked: false, video_id })
    } else {
      const { error: insertError } = await supabase
        .from('workout_video_bookmarks')
        .insert({ user_id: userId, video_id })

      if (insertError) throw insertError
      return res.json({ bookmarked: true, video_id })
    }
  } catch (err) {
    console.error('Error toggling video bookmark:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router