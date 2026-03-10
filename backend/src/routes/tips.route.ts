import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

// GET /api/tips?category=&goal=&search=
router.get('/', async (req, res) => {
    try {
        const { category, goal, search } = req.query

        let query = supabase.from('tips').select('*').order('created_at', { ascending: false })

        if (category && category !== 'All') {
            query = query.eq('category', category as string)
        }
        if (search) {
            query = query.or(`title_th.ilike.%${search}%,excerpt_th.ilike.%${search}%`)
        }

        const { data, error } = await query
        if (error) return res.status(500).json({ error: error.message })

        let filtered = data ?? []

        // filter goal_tags ใน backend เพราะเป็น array
        if (goal) {
            const goals = (goal as string).split(',')
            filtered = filtered.filter(t =>
                goals.some(g => t.goal_tags?.includes(g))
            )
        }

        return res.json(filtered)
    } catch {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// ⚠️ ต้องวางก่อน /:id เสมอ ไม่งั้น Express จะ match "bookmarks" เป็น :id
// GET /api/tips/bookmarks/list
router.get('/bookmarks/list', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { data, error } = await supabase
            .from('tip_bookmarks')
            .select('tip_id, tips(*)')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })

        if (error) return res.status(500).json({ error: error.message })
        return res.json(data?.map((b: any) => b.tips) ?? [])
    } catch {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// POST /api/tips/bookmarks/toggle
router.post('/bookmarks/toggle', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { tip_id } = req.body

        if (!tip_id) return res.status(400).json({ error: 'tip_id is required' })

        const { data: existing } = await supabase
            .from('tip_bookmarks')
            .select('id')
            .eq('user_id', user_id)
            .eq('tip_id', tip_id)
            .maybeSingle()  // ใช้ maybeSingle แทน single เพื่อไม่ error เมื่อไม่มีข้อมูล

        if (existing) {
            await supabase.from('tip_bookmarks').delete()
                .eq('user_id', user_id).eq('tip_id', tip_id)
            return res.json({ bookmarked: false })
        } else {
            await supabase.from('tip_bookmarks').insert({ user_id, tip_id })
            return res.json({ bookmarked: true })
        }
    } catch {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// GET /api/tips/:id — ต้องอยู่หลัง /bookmarks/*
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tips')
            .select('*')
            .eq('id', req.params.id)
            .single()

        if (error) return res.status(404).json({ error: 'Not found' })
        return res.json(data)
    } catch {
        return res.status(500).json({ error: 'Server Error' })
    }
})

export default router