import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import profileRoute from './routes/profile.route'
import { supabase } from './config/supabase'
import { authMiddleware } from './middleware/auth.middleware'
import workoutRoute from './routes/workout.route'
import mealRoute from './routes/meal.route'
import workoutVideosRoute from './routes/workout-videos.route'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/profile', authMiddleware, profileRoute)
app.use('/api/workout', authMiddleware, workoutRoute)
app.use('/api/meal', authMiddleware, mealRoute)
// authMiddleware ไม่จำเป็นสำหรับ public content
app.use('/api/workout-videos', workoutVideosRoute)

app.get('/',  (req, res) => {
    res.send('Backend is running🚀')
})

app.get('/test', async (req, res) =>{
    const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .limit(1)

    if(error){
        return res.status(500).json({error})
    }

    res.json(data)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}🚀`)
})