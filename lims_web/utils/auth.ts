import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile, setUserInfo, findOrCreateUser } from './api'
import { supabase, getUser } from './supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

const defaultLocalUser: UserProfile = {
  uid: 'default_user',
  display_name: 'Default User',
  email: 'local@lims.app',
};

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState<'local' | 'supabase' | null>(null)
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabaseUser = await getUser()
        
        if (supabaseUser) {
          console.log('🔐 Supabase mode activated:', supabaseUser.id);
          setMode('supabase');
          
          let profile: UserProfile = {
            uid: supabaseUser.id,
            display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'User',
            email: supabaseUser.email || 'no-email@example.com',
          };
          
          try {
            profile = await findOrCreateUser(profile);
            console.log('✅ Supabase user created/verified:', profile);
          } catch (error) {
            console.error('❌ Supabase user creation/verification failed:', error);
          }

          setUser(profile);
          setUserInfo(profile);
        } else {
          console.log('🏠 Local mode activated');
          setMode('local');
          
          setUser(defaultLocalUser);
          setUserInfo(defaultLocalUser);
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setMode('local');
        setUser(defaultLocalUser);
        setUserInfo(defaultLocalUser);
      } finally {
        setIsLoading(false);
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkUser()
      } else if (event === 'SIGNED_OUT') {
        setMode('local');
        setUser(defaultLocalUser);
        setUserInfo(defaultLocalUser);
        setIsLoading(false);
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading, mode }
}

export const useRedirectIfNotAuth = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // This hook is now simplified. It doesn't redirect for local mode.
    // If you want to force login for hosting mode, you'd add logic here.
    // For example: if (!isLoading && !user) router.push('/login');
    // But for now, we allow both modes.
  }, [user, isLoading, router])

  return user
}