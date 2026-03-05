import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

router.post('/setup', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { username, gender, height, weight, age, bloodType } = req.body
        // validation ฝั่ง server
        if (!user_id || !username || !gender || !height || !weight || !age || !bloodType) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        //validate
        const h = Number(height)
        const w = Number(weight)
        const a = Number(age)

        if (isNaN(h) || isNaN(w) || isNaN(a)) {
            return res.status(400).json({ error: 'height, weight, age must be numbers' })
        }

        if (h <= 0 || w <= 0 || a <= 0) {
            return res.status(400).json({ error: 'height, weight, age must be greater than 0' })
        }

        //คำนวณ bmi ที่ backend
        const heightInMeters = h / 100
        const bmiValue = w / (heightInMeters * heightInMeters)
        const bmi = parseFloat(bmiValue.toFixed(1))

        let bmiCategory = ''
        if (bmiValue < 18.5) bmiCategory = 'UnderWeight'
        else if (bmiValue < 25) bmiCategory = 'Normal'
        else if (bmiValue < 30) bmiCategory = 'OverWeight'
        else if (bmiValue < 35) bmiCategory = 'Obese'
        else bmiCategory = 'Morbidly Obese'

        const { error } = await supabase
            .from('user_profile')
            .upsert([{
                user_id,
                username,
                gender,
                height,
                weight,
                age,
                blood_type: bloodType,
                bmi,
                bmi_category: bmiCategory,
                is_setup_completed: true
            }], { onConflict: 'user_id' })

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        return res.json({
            message: 'Profile Save Successfully',
            bmi,
            bmiCategory
        })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

router.post('/bmr', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { gender, height, weight, age } = req.body

        if (!user_id || !gender || !height || !weight || !age) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const h = Number(height)
        const w = Number(weight)
        const a = Number(age)

        if (isNaN(h) || isNaN(w) || isNaN(a)) {
            return res.status(400).json({ error: 'height, weight, age must be numbers' })
        }

        if (h <= 0 || w <= 0 || a <= 0) {
            return res.status(400).json({ error: 'height, weight, age must be greater than 0' })
        }

        let bmr: number
        if (gender === 'male') {
            bmr = (10 * w) + (6.25 * h) - (5 * a) + 5
        } else {
            bmr = (10 * w) + (6.25 * h) - (5 * a) - 161
        }
        bmr = Math.round(bmr)

        const { error } = await supabase
            .from('user_profile')
            .update({ bmr })
            .eq('user_id', user_id)

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        return res.json({ bmr })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

router.post('/tdee', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { bmr, activityLevel } = req.body

        if (!user_id || !bmr || !activityLevel) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const multipliers: Record<string, number> = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            very: 1.725,
            extra: 1.9,
        }

        const multiplier = multipliers[activityLevel]
        if (!multiplier) {
            return res.status(400).json({ error: 'Invalid activity level' })
        }

        const tdee = Math.round(bmr * multiplier)

        const { error } = await supabase
            .from('user_profile')
            .update({ tdee })
            .eq('user_id', user_id)

        if (error) {
            return res.status(500).json({ error: error.message })
        }

        return res.json({ tdee })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

{/*GET /api/profile — ดึงข้อมูล profile*/ }
router.get('/', async (req, res) => {
    const user_id = (req as any).user.id
    const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', user_id)
        .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
})

{/*PATCH /api/profile — อัปเดต profile*/ }
router.patch('/', async (req, res) => {
    try {
        const user_id = (req as any).user.id
        const { username, gender, age, bloodType, avatarUrl } = req.body

        if (!username || !gender || !age || !bloodType) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const ageNum = Number(age)
        if (isNaN(ageNum) || ageNum <= 0) {
            return res.status(400).json({ error: 'Invalid age' })
        }

        const updatePayload: any = {
            username,
            gender: gender.toLowerCase(),
            age: ageNum,
            blood_type: bloodType,
        }

        if (avatarUrl) {
            updatePayload.avatar_url = avatarUrl
        }

        const { error } = await supabase
            .from('user_profile')
            .update(updatePayload)
            .eq('user_id', user_id)

        if (error) return res.status(500).json({ error: error.message })
        return res.json({ message: 'Profile updated successfully' })
    } catch (err) {
        return res.status(500).json({ error: 'Server Error' })
    }
})

export default router