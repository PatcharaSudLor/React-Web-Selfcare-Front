import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

router.post('/setup', async (req, res) => {
    try {
        const {
            user_id,
            username,
            gender,
            height,
            weight,
            age,
            bloodType
        } = req.body
        // validation ฝั่ง server
        if (!user_id || !username || !gender || !height || !weight || !age || !bloodType) {
            return res.status(400).json({ error: 'Missing required fields' })
        }
        //คำนวณ bmi ที่ backend
        const heightInMeters = height / 100
        const bmiValue = weight / (heightInMeters * heightInMeters)
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
export default router