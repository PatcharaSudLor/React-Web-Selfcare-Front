import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

function getGoalTags(goal: string) {
  switch (goal) {
    case 'lose': return ['fat-loss', 'endurance']
    case 'gain': return ['muscle-gain', 'strength']
    case 'maintain': return ['fat-loss', 'muscle-gain']
    default: return []
  }
}

function getBodyTypeTags(bodyType: string) {
  switch (bodyType) {
    case 'ectomorph': return ['muscle-gain', 'strength']
    case 'mesomorph': return ['fat-loss', 'muscle-gain']
    case 'endomorph': return ['fat-loss', 'endurance']
    default: return []
  }
}

// GET /api/workout-videos
router.get('/', async (req, res) => {
  try {

    const {
      category,
      difficulty,
      goal,
      bodyType,
      equipment,
      duration,
      page = '1',
      limit = '6'
    } = req.query

    const pageNumber = parseInt(page as string)
    const limitNumber = parseInt(limit as string)

    const from = (pageNumber - 1) * limitNumber
    const to = from + limitNumber

    let query = supabase
      .from('workout_videos')
      .select('*')

    if (category) {
      query = query.eq('primary_category', category as string)
    }

    if (difficulty) {
      const levels = (difficulty as string).split(',')
      query = query.in('difficulty', levels)
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    let videos = data ?? []

    // filter by duration_minutes
    if (duration) {
      const ranges = (duration as string).split(',')
      videos = videos.filter(v => {
        const mins = v.duration_minutes
        return ranges.some(r => {
          if (r === 'under-15') return mins < 15
          if (r === '15-30') return mins >= 15 && mins <= 30
          if (r === 'over-30') return mins > 30
          return false
        })
      })
    }

    // filter array fields
    if (goal) {
      const goals = (goal as string).split(',')
      videos = videos.filter(v =>
        goals.some(g => v.goal_tags?.includes(g))
      )
    }

    if (equipment) {
      const equips = (equipment as string).split(',')
      videos = videos.filter(v =>
        equips.some(e => v.equipment?.includes(e))
      )
    }

    // ====================
    // SMART RECOMMENDATION
    // ====================

    const goalTags = goal ? (goal as string).split(',') : []
    const bodyTags = bodyType ? getBodyTypeTags(bodyType as string) : []
    let scoredVideos = videos.map(video => {

      let score = 0

      // match goal
      if (video.goal_tags?.some((tag: string) => goalTags.includes(tag))) {
        score += 2
      }

      // match body type
      if (video.goal_tags?.some((tag: string) => bodyTags.includes(tag))) {
        score += 1
      }

      // match difficulty
      if (difficulty) {
        const levels = (difficulty as string).split(',')

        if (levels.includes(video.difficulty)) {
          score += 1
        }
      }

      score += Math.random() * 0.3

      return {
        ...video,
        recommendation_score: score
      }

    })

    // sort by score
    scoredVideos.sort(
      (a, b) => b.recommendation_score - a.recommendation_score
    )

    // pagination
    const paginated = scoredVideos.slice(from, to)

    const total = scoredVideos.length
    const totalPages = Math.ceil(total / limitNumber)

    return res.json({
      data: paginated,
      total,
      totalPages,
      page: pageNumber
    })

  } catch (err) {
    return res.status(500).json({ error: 'Server Error' })
  }
})

export default router