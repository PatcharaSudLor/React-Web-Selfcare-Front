import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { authMiddleware } from '../middleware/auth.middleware'

dotenv.config()

const router = express.Router()

// --- API Key Rotation (เพื่อใช้ Key สำรองเมื่อ Key หลัก Quota เกิน) ---
const API_KEYS = [
    process.env.GEMINI_API_KEY || '',
    process.env.GEMINI_API_KEY_2 || ''
].filter(k => k !== '')

let currentKeyIndex = 0

function getGenAI(): GoogleGenerativeAI {
    return new GoogleGenerativeAI(API_KEYS[currentKeyIndex])
}

function rotateKey(): boolean {
    const next = (currentKeyIndex + 1) % API_KEYS.length
    if (next === currentKeyIndex) return false // ไม่มี Key สำรอง
    console.log(`🔄 Rotating API Key: ${currentKeyIndex} → ${next}`)
    currentKeyIndex = next
    return true
}

// Wrapper ที่ rotate key อัตโนมัติเมื่อเจอ 429
async function generateWithRetry(model: string, prompt: string): Promise<string> {
    const maxAttempts = API_KEYS.length
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const genAI = getGenAI()
            const modelInstance = genAI.getGenerativeModel({ model })
            const result = await modelInstance.generateContent(prompt)
            return result.response.text()
        } catch (err: any) {
            if (err?.message?.includes('429') && rotateKey()) {
                console.log(`Retry with new key (attempt ${attempt + 1})`)
                continue
            }
            throw err
        }
    }
    throw new Error('All API keys exceeded quota')
}

// --- Hybrid Logic Helpers ---
function getBaselineStats(goal: string, bodyType: string) {
    let sets = goal === 'gain' ? 4 : 3
    let reps = goal === 'gain' ? '8-10' : goal === 'lose' ? '15-20' : '10-12'

    if (bodyType === 'ectomorph') sets += 1
    if (bodyType === 'endomorph' && goal === 'gain') reps = '10-12'

    return { sets, reps }
}

const EXERCISE_LIBRARY = [
    'Push-up', 'Shoulder Press', 'Pull-up', 'Dips', 'Plank',
    'Squat', 'Lunge', 'Glute Bridge', 'Calf Raise',
    'Jumping Jack', 'Mountain Climber', 'Burpee',
    'Russian Twist', 'Bicycle Crunch', 'Leg Raise'
]

router.post('/generate-workout', authMiddleware, async (req, res) => {
    try {
        const { bodyType, goal, dailyTime, medicalCondition } = req.body
        console.log('AI Request Payload:', { bodyType, goal, dailyTime, medicalCondition })

        if (!bodyType || !goal || !dailyTime) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Check if API Key exists
        if (!process.env.GEMINI_API_KEY) {
            return res.json(generateSmartMockPlan(bodyType, goal, dailyTime, medicalCondition))
        }

        // 1. Hybrid Approach: Calculate baseline stats to guide AI
        const baseline = getBaselineStats(goal, bodyType)

        // 2. Build prompt
        const prompt = `You are a professional fitness trainer focused on safety and scientific accuracy.
        Create a 7-day workout plan for a user with the following profile:
        - Body Type: ${bodyType}
        - Goal: ${goal}
        - Available Time: ${dailyTime} minutes/day
        - Medical Conditions: ${medicalCondition || 'None'}
        - Recommended Sets: ${baseline.sets}, Reps: ${baseline.reps}
        - Exercise Library: ${EXERCISE_LIBRARY.join(', ')}

        Safety Guardrails:
        - If medical condition mentions physical therapy/rehabilitation or specific pain, prioritize therapeutic exercises.
        - If knee issues: AVOID Squats, Lunges, Jumping.
        - If back issues: AVOID Deadlifts, heavy overhead presses.
        - Every day must have Warm-up and Cool-down.
        - Sunday must always be Rest & Recovery.

        Respond ONLY in valid JSON (no markdown):
        {"days":[{"day":"Monday","dayTh":"จันทร์","workout":"Focus Name","duration":${dailyTime},"exercises":[{"name":"Ex Name","sets":${baseline.sets},"reps":"${baseline.reps}"}]}]}
        Include exactly 7 days. Use Thai for dayTh. Sunday = Rest.`

        const text = await generateWithRetry('gemini-2.5-flash', prompt)
        console.log('AI Raw Response:', text.substring(0, 200))

        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()

        try {
            const plan = JSON.parse(cleaned)
            return res.json(plan)
        } catch (parseErr: any) {
            console.error('AI JSON Parse Error:', parseErr, 'Raw Text:', cleaned)
            return res.status(500).json({ error: `Failed to parse AI response: ${parseErr.message}`, raw: cleaned })
        }

    } catch (err: any) {
        console.error('AI Route Error:', err)
        return res.status(500).json({ error: err.message || 'Server Error' })
    }
})

router.post('/generate-meal', authMiddleware, async (req, res) => {
    try {
        const { likedMeals, allergicFoods, budget, goal } = req.body
        console.log('AI Meal Request Payload:', { likedMeals, allergicFoods, budget, goal })

        if (!likedMeals || !budget || !goal) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API Key missing' })
        }

        const prompt = `You are a professional nutritionist. Create a 7-day healthy meal plan.
        - Liked Meal Types: ${likedMeals.join(', ')}
        - Allergic Foods: ${allergicFoods.join(', ') || 'None'}
        - Budget per Meal: ฿${budget}
        - Fitness Goal: ${goal}

        Rules: 7 days Mon-Sun. dayTh in Thai (จันทร์-อาทิตย์). Each day has breakfast/lunch/dinner with id, name, name_th, type, price (<=฿${budget}), ingredients.
        Color: Mon:bg-yellow-50, Tue:bg-pink-50, Wed:bg-green-50, Thu:bg-orange-50, Fri:bg-blue-50, Sat:bg-purple-50, Sun:bg-red-50.
        Respond ONLY in valid JSON (no markdown):
        {"days":[{"day":"Monday","dayTh":"จันทร์","color":"bg-yellow-50","breakfast":{"id":"m1","name":"...","name_th":"...","type":"...","price":50,"ingredients":[""]},"lunch":{...},"dinner":{...}}]}`

        const mealText = await generateWithRetry('gemini-2.5-flash', prompt)
        console.log('AI Meal Raw Response:', mealText.substring(0, 200))

        const cleaned = mealText.replace(/```json/g, '').replace(/```/g, '').trim()

        try {
            const plan = JSON.parse(cleaned)
            return res.json(plan)
        } catch (parseErr: any) {
            console.error('AI Meal JSON Parse Error:', parseErr, 'Raw Text:', cleaned)
            return res.status(500).json({ error: `Failed to parse AI response: ${parseErr.message}`, raw: cleaned })
        }

    } catch (err: any) {
        console.error('AI Meal Route Error:', err)
        return res.status(500).json({ error: err.message || 'Server Error' })
    }
})

router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { messages, context, existingWorkoutPlan, existingMealPlan } = req.body
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages are required' })
        }

        const lastUserMessage = messages[messages.length - 1]?.content || ''

        // คำที่บ่งบอกว่าต้องการตาราง (เฉพาะเจาะจงขึ้น)
        const workoutKeywords = /(ออกกำลังกาย|workout|exercise|ตาราง.*ออก|แผน.*ออก|เจนแผน|สร้างแผน|วางแผนออก)/i
        const workoutAdaptKeywords = /(ปรับแผน|แก้แผน|เปลี่ยนแผน.*ออก|ปรับตาราง|เพิ่มความหนัก|ลดความหนัก)/i
        const injuryAdaptKeywords = /(เจ็บ|ปวด|บาดเจ็บ|เมื่อย|ล้า)/i // คำที่ใช้ปรับตารางเมื่อบาดเจ็บ
        const mealKeywords = /(แผนอาหาร|เมนูอาหาร|ตาราง.*อาหาร|meal plan|diet plan|จัดอาหาร|วางแผนอาหาร)/i
        const mealAdaptKeywords = /(ปรับแผน.*อาหาร|เปลี่ยนเมนู|แก้เมนู)/i

        // คำที่บ่งบอกว่าเป็นอาการป่วยทั่วไป (ห้าม trigger ตารางใหม่ ถ้าไม่มีการพูดถึงการปรับตาราง)
        const symptomKeywords = /(ท้องเสีย|ท้องอืด|คลื่นไส้|อาเจียน|ไข้|หวัด|ไอ|เจ็บคอ|ป่วย)/i

        const hasExistingWorkout = Array.isArray(existingWorkoutPlan) && existingWorkoutPlan.length > 0
        const hasExistingMeal = Array.isArray(existingMealPlan) && existingMealPlan.length > 0

        // ตรรกะการ Trigger
        const wantsWorkout = workoutKeywords.test(lastUserMessage) && !symptomKeywords.test(lastUserMessage)
        const wantsMeal = mealKeywords.test(lastUserMessage) && !symptomKeywords.test(lastUserMessage)

        // อนุญาตให้ปรับแผนได้ ถ้ามี keyword ปรับแผนโดยตรง หรือมี keyword อาการบาดเจ็บ+มีแผนเดิมอยู่แล้ว
        const wantsWorkoutAdapt =
            (workoutAdaptKeywords.test(lastUserMessage) || (hasExistingWorkout && injuryAdaptKeywords.test(lastUserMessage)))
            && !symptomKeywords.test(lastUserMessage)

        const wantsMealAdapt = mealAdaptKeywords.test(lastUserMessage) && !symptomKeywords.test(lastUserMessage)

        // สร้าง prompt สำหรับ AI
        let fullPrompt = `คุณคือผู้ช่วยสุขภาพ AI ที่เชี่ยวชาญ ตอบเป็นภาษาไทยเสมอ ตอบกระชับ ใจความสำคัญ
ข้อมูลผู้ใช้: ${JSON.stringify(context || {})}`

        // เพิ่มแผนเดิมในบริบท (ถ้ามี)
        if (hasExistingWorkout) {
            const summary = existingWorkoutPlan.slice(0, 3).map((d: any) => `${d.day}: ${d.workout}`).join(', ')
            fullPrompt += `\nแผนออกกำลังกายเดิมของผู้ใช้ (สรุป): ${summary} ...และอีก ${existingWorkoutPlan.length - 3} วัน`
            fullPrompt += `\n(ข้อมูลแผนเต็ม: ${JSON.stringify(existingWorkoutPlan).substring(0, 800)})`
        }
        if (hasExistingMeal) {
            const summary = existingMealPlan.slice(0, 2).map((d: any) => `${d.day}: ${d.breakfast?.name_th || d.breakfast?.name}`).join(', ')
            fullPrompt += `\nแผนอาหารเดิมของผู้ใช้ (สรุป): ${summary} ...`
        }

        fullPrompt += `\n\nคำถาม/ปัญหาของผู้ใช้: ${lastUserMessage}`

        // เพิ่ม instruction เฉพาะเมื่อผู้ใช้ต้องการสร้าง/ปรับแผนจริงๆ
        if (wantsWorkout || (wantsWorkoutAdapt && hasExistingWorkout)) {
            fullPrompt += `\n\n[คำสั่งพิเศษ: ${hasExistingWorkout && wantsWorkoutAdapt ? 'วิเคราะห์แผนเดิม แล้วสร้างแผนใหม่ที่ปรับให้เข้ากับความต้องการของผู้ใช้' : 'สร้างแผนออกกำลังกายให้ผู้ใช้'}
ตอบด้วยข้อความสั้นๆ อธิบายว่าปรับอะไรบ้าง แล้วต่อท้ายด้วย [WORKOUT_DATA] ตามด้วย JSON (ไม่ใช้ code block):
{"days":[{"day":"Monday","dayTh":"จันทร์","workout":"ชื่อโปรแกรม","duration":30,"exercises":[{"name":"ชื่อท่า","sets":3,"reps":"12"}]},...ครบ 7 วัน]}
ต้องครบ 7 วัน วันอาทิตย์เป็น Rest ห้าม wrap ด้วย markdown]`
        } else if (wantsMeal || (wantsMealAdapt && hasExistingMeal)) {
            fullPrompt += `\n\n[คำสั่งพิเศษ: ${hasExistingMeal && wantsMealAdapt ? 'วิเคราะห์แผนอาหารเดิม แล้วสร้างแผนใหม่ที่ปรับตามคำขอ' : 'สร้างแผนอาหารให้ผู้ใช้'}
ตอบด้วยข้อความสั้นๆ แล้วต่อท้ายด้วย [MEAL_DATA] ตามด้วย JSON (ไม่ใช้ code block):
{"days":[{"day":"Monday","dayTh":"จันทร์","breakfast":{"name_th":"ชื่ออาหาร","price":50},"lunch":{"name_th":"ชื่ออาหาร","price":60},"dinner":{"name_th":"ชื่ออาหาร","price":50}},...ครบ 7 วัน]}
ต้องครบ 7 วัน ห้าม wrap ด้วย markdown]`
        }

        const text = await generateWithRetry('gemini-2.5-flash', fullPrompt)

        console.log('AI Chat Response (first 300 chars):', text.substring(0, 300))

        return res.json({ message: text })

    } catch (err: any) {
        console.error('AI Chat Error:', err)
        return res.status(500).json({ error: err.message || 'Server Error' })
    }
})

// Fallback logic for safety/mocking
function generateSmartMockPlan(bodyType: string, goal: string, dailyTime: number, medicalCondition: string) {
    const stats = getBaselineStats(goal, bodyType)
    const days = [
        { day: 'Monday', dayTh: 'จันทร์', focus: 'Upper Body Activation' },
        { day: 'Tuesday', dayTh: 'อังคาร', focus: 'Lower Body Strength' },
        { day: 'Wednesday', dayTh: 'พุธ', focus: 'Active Recovery' },
        { day: 'Thursday', dayTh: 'พฤหัสบดี', focus: 'Core & Stability' },
        { day: 'Friday', dayTh: 'ศุกร์', focus: 'Total Body Flow' },
        { day: 'Saturday', dayTh: 'เสาร์', focus: 'Light Cardio' },
        { day: 'Sunday', dayTh: 'อาทิตย์', focus: 'Rest' },
    ]

    return {
        days: days.map(d => ({
            day: d.day,
            dayTh: d.dayTh,
            workout: d.focus,
            duration: d.focus === 'Rest' ? 0 : dailyTime,
            exercises: d.focus === 'Rest' ? [] : [
                { name: `${d.focus} Move 1`, sets: stats.sets, reps: stats.reps },
                { name: `${d.focus} Move 2`, sets: stats.sets, reps: stats.reps }
            ]
        }))
    }
}

export default router
