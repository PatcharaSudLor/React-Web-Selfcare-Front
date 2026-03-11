import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase, setAuthCallback, clearAuthCallback } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

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
  bloodType?: string;
  avatarUrl?: string;
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
  bloodType: undefined,
  avatarUrl: undefined,
};

export function UserProvider({ children }: { children: ReactNode }) {
  const navigateRef = useRef<ReturnType<typeof useNavigate>>(null!);
  navigateRef.current = useNavigate();

  const [userInfo, setUserInfo] = useState<UserInfoData>(DEFAULT_USER_INFO);
  const [loading, setLoading] = useState(true);

  const setUserInfoRef = useRef(setUserInfo);
  const setLoadingRef = useRef(setLoading);
  useEffect(() => {
    setUserInfoRef.current = setUserInfo;
    setLoadingRef.current = setLoading;
  });

  useEffect(() => {
    let isLoadingProfile = false;

    async function loadProfile(userId: string, email: string, event: string) {
      console.log('🔍 loadProfile event:', event)
      try {
        const { data: profile, error } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) { console.error(error); return; }

        if (!profile) {
          await supabase.from('user_profile').insert({
            user_id: userId,
            email,
            username: 'User',
            is_setup_completed: false,
          });
          navigateRef.current('/userinfo');
          return;
        }

        setUserInfoRef.current(prev => ({
          ...prev,
          username: profile.username ?? prev.username,
          gender: profile.gender ?? prev.gender,
          age: profile.age ?? prev.age,
          height: profile.height ?? prev.height,
          weight: profile.weight ?? prev.weight,
          bmi: profile.bmi ?? prev.bmi,
          bmiCategory: profile.bmi_category ?? prev.bmiCategory,
          bmr: profile.bmr ?? prev.bmr,
          tdee: profile.tdee ?? prev.tdee,
          bloodType: profile.blood_type ?? prev.bloodType,
          avatarUrl: profile.avatar_url
            ? `${supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl}?t=${Date.now()}`
            : prev.avatarUrl,
        }));

        if (event === 'SIGNED_IN') {
          const currentPath = window.location.pathname
          const isAuthPage = currentPath === '/' || currentPath === '/login' || currentPath === '/signup'

          if (isAuthPage) {
            // login ใหม่จริงๆ → navigate
            if (profile.is_setup_completed) {
              navigateRef.current('/home')
            } else {
              navigateRef.current('/userinfo')
            }
          }

          // อยู่หน้าอื่น = refresh → ไม่ navigate
        } else if (event === 'INITIAL_SESSION' && !profile.is_setup_completed) {
          navigateRef.current('/userinfo')
        }
      } catch (err) {
        console.error('loadProfile error:', err)
      } finally {
        setLoadingRef.current(false)
      }
    }

    setAuthCallback(async (event, session) => {
      console.log('🎯 Auth event:', event, '| has session:', !!session)

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        if (isLoadingProfile) return;
        isLoadingProfile = true;
        try {
          await loadProfile(session.user.id, session.user.email ?? '', event);
        } finally {
          isLoadingProfile = false;
        }
      }
      if (event === 'SIGNED_OUT') {
        isLoadingProfile = false;
        setUserInfoRef.current(DEFAULT_USER_INFO);
        navigateRef.current('/');
      }
      if (event === 'INITIAL_SESSION' && !session) {
        setLoadingRef.current(false);
      }
    });

    return () => { clearAuthCallback(); };
  }, []);

  const updateUserInfo = (data: Partial<UserInfoData>) => {
    setUserInfo(prev => ({
      ...prev,
      username: data.username ?? prev.username,
      gender: data.gender ?? prev.gender,
      age: data.age ? String(data.age) : prev.age,
      height: data.height ? String(data.height) : prev.height,
      weight: data.weight ? String(data.weight) : prev.weight,
      bmi: data.bmi ?? prev.bmi,
      bmiCategory: data.bmiCategory ?? prev.bmiCategory,
      bmr: data.bmr ?? prev.bmr,
      tdee: data.tdee ?? prev.tdee,
      bloodType: data.bloodType ?? prev.bloodType,
      avatarUrl: data.avatarUrl ?? prev.avatarUrl,
    }));
  };

  const clearUserInfo = async () => {
    await supabase.auth.signOut();
    setUserInfoRef.current(DEFAULT_USER_INFO);
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