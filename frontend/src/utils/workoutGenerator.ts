export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

export interface DayWorkout {
  day: string;
  exercises: Exercise[];
  duration: number;
  focus: string;
}

export interface WeeklyWorkoutPlan {
  days: DayWorkout[];
}