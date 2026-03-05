import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

// GET /api/alerts/checkins?date=2024-01-01
router.get('/checkins', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const date = (req.query.date as string) || new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('daily_checkins')
            .select('*')
            .eq('user_id', user_id)
            .eq('date', date)

        if (error) return res.status(500).json({ error: error.message })
        return res.json(data ?? [])
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// POST /api/alerts/checkins
router.post('/checkins', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { category, answered, date } = req.body

        const { data, error } = await supabase
            .from('daily_checkins')
            .upsert({
                user_id,
                date: date || new Date().toISOString().split('T')[0],
                category,
                answered,
            }, { onConflict: 'user_id,date,category' })
            .select()
            .single()

        if (error) return res.status(500).json({ error: error.message })
        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

// GET /api/alerts/streak
router.get('/streak', async (req, res) => {
    try {
        const user_id = (req as any).user.id

        const { data, error } = await supabase
            .from('daily_checkins')
            .select('date, answered')
            .eq('user_id', user_id)
            .eq('answered', true)
            .order('date', { ascending: false })

        if (error) return res.status(500).json({ error: error.message })

        // นับ streak — วันติดต่อกันที่มี checkin อย่างน้อย 1 รายการ
        const uniqueDates = [...new Set((data ?? []).map(d => d.date))].sort().reverse()
        let streak = 0
        const today = new Date().toISOString().split('T')[0]

        for (let i = 0; i < uniqueDates.length; i++) {
            const expected = new Date()
            expected.setDate(expected.getDate() - i)
            const expectedStr = expected.toISOString().split('T')[0]
            if (uniqueDates[i] === expectedStr) {
                streak++
            } else {
                break
            }
        }

        // ถ้าวันนี้ยังไม่มี checkin แต่เมื่อวานมี ก็ยัง streak อยู่
        const hasToday = uniqueDates[0] === today
        return res.json({ streak, hasToday })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

export default router