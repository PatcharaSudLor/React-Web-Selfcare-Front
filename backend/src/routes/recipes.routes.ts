import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

// GET /api/recipes?category=&difficulty=&healthy_tag=&search=&sort=&page=&limit=
router.get('/', async (req, res) => {
    try {
        const { category, difficulty, healthy_tag, search, sort, page, limit } = req.query

        const pageNum = parseInt(page as string) || 1
        const limitNum = parseInt(limit as string) || 12
        const offset = (pageNum - 1) * limitNum

        let query = supabase.from('recipes').select('*', { count: 'exact' })

        if (category) query = query.eq('category', category as string)
        if (difficulty) query = query.eq('difficulty', difficulty as string)
        if (search) query = query.or(`name_th.ilike.%${search}%,name.ilike.%${search}%`)

        // sort
        switch (sort) {
            case 'rating':     query = query.order('rating', { ascending: false }); break
            case 'calories':   query = query.order('calories', { ascending: true }); break
            case 'cook_time':  query = query.order('cook_time_minutes', { ascending: true }); break
            case 'difficulty':
                query = query.order('cook_time_minutes', { ascending: true }); break
            default:           query = query.order('created_at', { ascending: false })
        }

        query = query.range(offset, offset + limitNum - 1)

        const { data, error, count } = await query
        if (error) return res.status(500).json({ error: error.message })

        let filtered = data ?? []

        // filter healthy_tag (array field) in JS
        if (healthy_tag) {
            filtered = filtered.filter((r: any) => r.healthy_tags?.includes(healthy_tag))
        }

        return res.json({
            data: filtered,
            total: count ?? 0,
            totalPages: Math.ceil((count ?? 0) / limitNum),
            page: pageNum,
        })
    } catch {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// GET /api/recipes/bookmarks/list  ⚠️ ต้องอยู่เหนือ /:id
router.get('/bookmarks/list', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { data, error } = await supabase
            .from('recipe_bookmarks')
            .select('recipe_id, recipes(*)')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })

        if (error) return res.status(500).json({ error: error.message })
        return res.json(data?.map((b: any) => b.recipes) ?? [])
    } catch {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// POST /api/recipes/bookmarks/toggle
router.post('/bookmarks/toggle', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { recipe_id } = req.body

        if (!recipe_id) return res.status(400).json({ error: 'recipe_id is required' })

        const { data: existing } = await supabase
            .from('recipe_bookmarks')
            .select('id')
            .eq('user_id', user_id)
            .eq('recipe_id', recipe_id)
            .maybeSingle()

        if (existing) {
            await supabase.from('recipe_bookmarks').delete()
                .eq('user_id', user_id).eq('recipe_id', recipe_id)
            return res.json({ bookmarked: false })
        } else {
            await supabase.from('recipe_bookmarks').insert({ user_id, recipe_id })
            return res.json({ bookmarked: true })
        }
    } catch {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('recipes')
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