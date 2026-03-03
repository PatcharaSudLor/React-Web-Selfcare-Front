import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

export function useAuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('useAuthRedirect mounted, hash:', window.location.hash);

    // ✅ วิธีที่ถูก: ให้ Supabase JS parse hash เอง แล้ว fire SIGNED_IN ให้
    // ไม่ต้อง getSession() เอง เพราะ detectSessionInUrl: true จัดการให้แล้ว
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: import('@supabase/supabase-js').AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => {
        console.log('🔔 Auth event:', event, '| user:', session?.user?.email ?? 'none');

        if (event === 'SIGNED_IN' && session?.user) {
          // ล้าง hash ออกจาก URL
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          // ป้องกัน redirect ซ้ำถ้าอยู่ในหน้า protected แล้ว
          const protectedPaths = ['/home', '/userinfo', '/bmiresults', '/profile'];
          if (protectedPaths.some(p => window.location.pathname.startsWith(p))) {
            console.log('Already on protected page, skipping redirect');
            return;
          }

          await routeByProfile(session.user.id, session.user.email ?? '', navigate);
        }

        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

async function routeByProfile(
  userId: string,
  email: string,
  navigate: ReturnType<typeof useNavigate>
) {
  console.log('routeByProfile called for:', email);
  try {
    const { data: profile, error } = await supabase
      .from('user_profile')
      .select('is_setup_completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      return;
    }

    console.log('Profile:', profile);

    if (!profile) {
      await supabase.from('user_profile').insert({
        user_id: userId,
        email,
        is_setup_completed: false,
      });
      console.log('New user → /userinfo');
      navigate('/userinfo');
    } else if (profile.is_setup_completed) {
      console.log('Existing user → /home');
      navigate('/home');
    } else {
      console.log('Incomplete profile → /userinfo');
      navigate('/userinfo');
    }
  } catch (err) {
    console.error('routeByProfile error:', err);
  }
}