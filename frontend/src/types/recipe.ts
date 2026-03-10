export interface Recipe {
  id: string
  name: string
  name_th: string
  category: string
  category_th: string
  cook_time: string
  cook_time_minutes: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  image_url: string
  calories: number
  servings: number
  rating: number
  review_count: number
  nutrition: {
    protein: number
    carbs: number
    fat: number
  }
  healthy_tags: string[]
}