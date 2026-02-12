export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph';
export type Goal = 'gain' | 'maintain' | 'lose';


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


interface GenerateWorkoutInput {
  bodyType: BodyType;
  goal: Goal;
  dailyTime: number;
  medicalCondition?: string;
}

const EXERCISE_LIBRARY: Record<string, string[]> = {
  'Upper body': ['Push-up', 'Shoulder Press', 'Pull-up'],
  'Lower body': ['Squat', 'Lunge', 'Glute Bridge'],
  'Cardio': ['Jumping Jack', 'Mountain Climber'],
  'Core & Cardio': ['Plank', 'Russian Twist', 'Bicycle Crunch'],
};


export function generateWorkoutPlan({
  bodyType,
  goal,
  dailyTime,
  medicalCondition = '',
}: GenerateWorkoutInput): WeeklyWorkoutPlan {

  // base sets / reps ตาม goal
  let sets = goal === 'gain' ? 4 : goal === 'maintain' ? 3 : 3;
  let reps =
    goal === 'gain'
      ? '8–10'
      : goal === 'maintain'
      ? '10–12'
      : '15–20';

  // body type adjustment
  if (bodyType === 'ectomorph') sets += 1;
  if (bodyType === 'endomorph') reps = goal === 'gain' ? '10–12' : '18–20';

  const weekTemplate: DayWorkout[] = [
    { day: 'Monday', focus: 'Upper body' },
    { day: 'Tuesday', focus: 'Lower body' },
    { day: 'Wednesday', focus: 'Cardio' },
    { day: 'Thursday', focus: 'Upper body' },
    { day: 'Friday', focus: 'Lower body' },
    { day: 'Saturday', focus: 'Core & Cardio' },
    { day: 'Sunday', focus: 'Rest' },
  ].map(d => {
    if (d.focus === 'Rest') {
      return {
        day: d.day,
        focus: d.focus,
        duration: 0,
        exercises: [],
      };
    }

    // ✅ ดึง exercise ตาม focus
    let exercisesForDay = [...(EXERCISE_LIBRARY[d.focus] || [])];

    // 🩺 medical condition
    if (medicalCondition.toLowerCase().includes('knee')) {
      exercisesForDay = exercisesForDay.filter(
        e => !['Squat', 'Lunge', 'Jumping Jack'].includes(e)
      );
    }

    // 🎲 สุ่ม exercise (เอา 2–3 ท่า)
    exercisesForDay = exercisesForDay
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return {
      day: d.day,
      focus: d.focus,
      duration: dailyTime,
      exercises: exercisesForDay.map(name => {
        // 🧘‍♂️ plank = time based
        if (name === 'Plank') {
          return {
            name,
            sets: 3,
            reps: goal === 'gain' ? '45–60s' : '30–45s',
          };
        }

        return {
          name,
          sets,
          reps,
        };
      }),
    };
  });

  return { days: weekTemplate };
}


