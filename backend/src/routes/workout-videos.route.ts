import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

// GET /api/workout-videos
router.get('/', async (req, res) => {
    try {
        const { category, difficulty, goal, equipment, duration } = req.query

        let query = supabase.from('workout_videos').select('*')

        if (category) {
            query = query.eq('primary_category', category as string)
        }
        if (difficulty) {
            const levels = (difficulty as string).split(',')
            query = query.in('difficulty', levels)
        }
        if (duration) {
            const ranges = (duration as string).split(',')
            query = query.in('duration_range', ranges)
        }

        const { data, error } = await query

        if (error) return res.status(500).json({ error: error.message })

        let filtered = data ?? []

        // filter goal_tags และ equipment ใน backend เพราะเป็น array
        if (goal) {
            const goals = (goal as string).split(',')
            filtered = filtered.filter(v =>
                goals.some(g => v.goal_tags?.includes(g))
            )
        }
        if (equipment) {
            const equips = (equipment as string).split(',')
            filtered = filtered.filter(v =>
                equips.some(e => v.equipment?.includes(e))
            )
        }

        return res.json(filtered)
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

export default router