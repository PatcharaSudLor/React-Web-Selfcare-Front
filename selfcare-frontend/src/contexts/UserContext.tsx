import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../utils/supabase';


export interface UserInfoData {
  username?: string;
  email?: string;
  gender?: 'male' | 'female';
  age?: string;
  height?: string;
  weight?: string;
  bmi?: number;
  bmiCategory?: string;
  bmr?: number;
  tdee?: number;
}

interface UserContextType {
  userInfo: UserInfoData;
  updateUserInfo: (data: Partial<UserInfoData>) => void;
  clearUserInfo: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_USER_INFO: UserInfoData = {
  username: 'User',
  email: undefined,
  gender: undefined,
  age: undefined,
  height: undefined,
  weight: undefined,
  bmi: undefined,
  bmiCategory: undefined,
  bmr: undefined,
  tdee: undefined,
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfoData>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('selfcare_user_info');

      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_USER_INFO, ...parsed };
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
    return DEFAULT_USER_INFO;
  });

  const [loading, setLoading] = useState(true);


  // Save to localStorage whenever userInfo changes
  useEffect(() => {
    try {
      localStorage.setItem('selfcare_user_info', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  }, [userInfo]);

  const updateUserInfo = (data: Partial<UserInfoData>) => {
    setUserInfo(prev => {
      const updated = {
        ...prev, username: data.username ?? prev.username,
        gender: data.gender ?? prev.gender,
        age: data.age ? String(data.age) : prev.age,
        height: data.height ? String(data.height) : prev.height,
        weight: data.weight ? String(data.weight) : prev.weight,
        bmi: data.bmi ?? prev.bmi,
        bmiCategory: data.bmiCategory ?? prev.bmiCategory,
        bmr: data.bmr ?? prev.bmr,
        tdee: data.tdee ?? prev.tdee,
      };

      // Auto-calculate BMI if height and weight are provided
      if (data.height && data.weight) {
        const heightM = parseFloat(data.height) / 100;
        const weightKg = parseFloat(data.weight);
        const calculatedBMI = weightKg / (heightM * heightM);
        updated.bmi = calculatedBMI;

        // Auto-set BMI category
        if (calculatedBMI < 18.5) {
          updated.bmiCategory = 'Underweight';
        } else if (calculatedBMI < 25) {
          updated.bmiCategory = 'Normal';
        } else if (calculatedBMI < 30) {
          updated.bmiCategory = 'Overweight';
        } else {
          updated.bmiCategory = 'Obese';
        }
      }

      return updated;
    });

  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setUserInfo(prev => ({
            ...prev,
            username: data.username ?? prev.username,
            gender: data.gender ?? prev.gender,
            age: data.age ? String(data.age) : prev.age,
            height: data.height ? String(data.height) : prev.height,
            weight: data.weight ? String(data.weight) : prev.weight,
            bmi: data.bmi ?? prev.bmi,
            bmiCategory: data.bmi_category ?? prev.bmiCategory,
            bmr: data.bmr ?? prev.bmr,
            tdee: data.tdee ?? prev.tdee,
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);



  const clearUserInfo = async () => {
    await supabase.auth.signOut();
    setUserInfo(DEFAULT_USER_INFO);
    localStorage.removeItem('selfcare_user_info');
  };


  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, clearUserInfo, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}