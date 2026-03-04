import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import profileRoute from './routes/profile.route'
import { supabase } from './config/supabase'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/profile', profileRoute)

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