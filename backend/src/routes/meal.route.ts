import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

// GET /api/meal/preferences
router.get('/preferences', async (req, res) => {
    try {
        const user_id = (req as any).user.id

        const { data, error } = await supabase
            .from('meal_preferences')
            .select('*')
            .eq('user_id', user_id)
            .single()

        if (error && error.code !== 'PGRST116') {
            return res.status(500).json({ error: error.message })
        }

        return res.json(data ?? null)
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// POST /api/meal/preferences
router.post('/preferences', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { likedMeals, allergicFoods, excludedProteins, budget } = req.body

        if (!likedMeals || !budget) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const budgetNum = Number(budget)
        if (isNaN(budgetNum) || budgetNum <= 0) {
            return res.status(400).json({ error: 'Invalid budget' })
        }

        const { error } = await supabase
            .from('meal_preferences')
            .upsert({
                user_id,
                liked_meals: likedMeals,
                allergic_foods: allergicFoods ?? [],
                excluded_proteins: excludedProteins ?? [],
                budget: budgetNum,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

        if (error) return res.status(500).json({ error: error.message })

        return res.json({ message: 'Meal preferences saved successfully' })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// GET /api/meal/active-plan
router.get('/active-plan', async (req, res) => {
    try {
        const user_id = (req as any).user.id

        const { data, error } = await supabase
            .from('active_meal_plan')
            .select('*')
            .eq('user_id', user_id)
            .single()

        if (error && error.code !== 'PGRST116') {
            return res.status(500).json({ error: error.message })
        }

        return res.json(data ?? null)
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// POST /api/meal/active-plan
router.post('/active-plan', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { planData, plan_data } = req.body
        const actualPlanData = planData || plan_data

        if (!actualPlanData || !Array.isArray(actualPlanData)) {
            return res.status(400).json({ error: 'Missing plan data' })
        }

        const { error } = await supabase
            .from('active_meal_plan')
            .upsert({
                user_id,
                plan_data: actualPlanData,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

        if (error) return res.status(500).json({ error: error.message })

        return res.json({ message: 'Active meal plan saved successfully' })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// POST /api/meal/schedule
router.post('/schedule', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { schedule, plan } = req.body

        if (!schedule) {
            return res.status(400).json({ error: 'Missing schedule' })
        }

        const { error } = await supabase
            .from('meal_schedules')
            .upsert({
                user_id,
                schedule,
                plan: plan || null,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

        if (error) return res.status(500).json({ error: error.message })

        return res.json({ message: 'Meal schedule saved successfully' })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// GET /api/meal/items — ดึงเมนูทั้งหมด filter ตาม preferences
router.get('/items', async (req, res) => {
    try {
        const { types, allergies, budget } = req.query

        let query = supabase.from('meal_items').select('*')

        if (budget) {
            query = query.lte('price', Number(budget))
        }

        const { data, error } = await query

        if (error) return res.status(500).json({ error: error.message })

        // filter ingredients ใน backend
        let filtered = data ?? []

        if (types) {
            const typeList = (types as string).split(',')
            filtered = filtered.filter(m => typeList.includes(m.type))
        }

        if (allergies) {
            const allergyList = (allergies as string).split(',')
            filtered = filtered.filter(m =>
                !m.ingredients.some((ing: string) => allergyList.includes(ing))
            )
        }

        return res.json(filtered)
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// DELETE /api/meal/active-plan
router.delete('/active-plan', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        // ลบทั้งแผน Active และรายการใน Schedule (Wipe total)
        await Promise.all([
            supabase.from('active_meal_plan').delete().eq('user_id', user_id),
            supabase.from('meal_schedules').delete().eq('user_id', user_id)
        ])

        return res.json({ message: 'Deleted successfully' })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})
export default router