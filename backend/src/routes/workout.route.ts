import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

// GET /api/workout/preferences — โหลด preferences
router.get('/preferences', async (req, res) => {
    try {
        const user_id = (req as any).user.id

        const { data, error } = await supabase
            .from('workout_preferences')
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

// POST /api/workout/preferences — บันทึก preferences
router.post('/preferences', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { dailyTime, bodyType, goal, medicalCondition } = req.body

        if (!dailyTime || !bodyType || !goal) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const validBodyTypes = ['ectomorph', 'mesomorph', 'endomorph']
        const validGoals = ['gain', 'maintain', 'lose']

        if (!validBodyTypes.includes(bodyType)) {
            return res.status(400).json({ error: 'Invalid body type' })
        }

        if (!validGoals.includes(goal)) {
            return res.status(400).json({ error: 'Invalid goal' })
        }

        const { error } = await supabase
            .from('workout_preferences')
            .upsert({
                user_id,
                daily_time: dailyTime,
                body_type: bodyType,
                goal,
                medical_condition: medicalCondition ?? null,
            }, { onConflict: 'user_id' })

        if (error) return res.status(500).json({ error: error.message })

        return res.json({ message: 'Preferences saved successfully' })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// POST /api/workout/schedule — บันทึก schedule
router.post('/schedule', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { schedule } = req.body

        if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
            return res.status(400).json({ error: 'Missing schedule' })
        }

        const payload = schedule.map((item: any) => ({
            user_id,
            day: item.day,
            day_th: item.dayTh,
            workout: item.workout,
            duration: item.duration,
            exercises: item.exercises,
        }))

        // ลบของเก่าก่อนแล้ว insert ใหม่
        const { error: deleteError } = await supabase
            .from('workout_schedules')
            .delete()
            .eq('user_id', user_id)

        if (deleteError) return res.status(500).json({ error: deleteError.message })

        const { error: insertError } = await supabase
            .from('workout_schedules')
            .insert(payload)

        if (insertError) return res.status(500).json({ error: insertError.message })

        return res.json({ message: 'Schedule saved successfully' })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// GET /api/workout/active-plan
router.get('/active-plan', async (req, res) => {
    try {
        const user_id = (req as any).user.id

        const { data, error } = await supabase
            .from('active_workout_plan')
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

// POST /api/workout/active-plan
router.post('/active-plan', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { planData, plan_data } = req.body
        const actualPlanData = planData || plan_data

        if (!actualPlanData || !Array.isArray(actualPlanData)) {
            return res.status(400).json({ error: 'Missing plan data' })
        }

        const { error } = await supabase
            .from('active_workout_plan')
            .upsert({
                user_id,
                plan_data: actualPlanData,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

        if (error) return res.status(500).json({ error: error.message })

        return res.json({ message: 'Active plan saved successfully' })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// DELETE /api/workout/active-plan
router.delete('/active-plan', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        console.log('DELETE active-plan user_id:', user_id)  // เพิ่มบรรทัดนี้
        // ลบทั้งแผน Active และรายการใน Schedule (Wipe total)
        await Promise.all([
            supabase.from('active_workout_plan').delete().eq('user_id', user_id),
            supabase.from('workout_preferences').delete().eq('user_id', user_id),
            supabase.from('workout_schedules').delete().eq('user_id', user_id)
        ])

        return res.json({ message: 'Deleted successfully' })
    } catch (err) {
        console.error('DELETE catch:', err)  // เพิ่มบรรทัดนี้
        return res.status(500).json({ error: 'Server Error' })
    }
})
export default router