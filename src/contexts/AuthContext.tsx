import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    let revision = 0;
    let eventSeen = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const applySession = (nextSession: Session | null) => {
      const current = ++revision;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsAdmin(false);
      if (!nextSession?.user) {
        setLoading(false);
        return;
      }
      // Do not redirect protected deep links before the role lookup finishes.
      setLoading(true);
      // Defer database work outside the Supabase auth callback lock.
      const timer = setTimeout(async () => {
        timers.delete(timer);
        let admin = false;
        try {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", nextSession.user.id)
            .eq("role", "admin")
            .maybeSingle();
          admin = !error && !!data;
        } catch {
          admin = false;
        }
        // A previous lookup must never restore access after sign-out/account change.
        if (active && current === revision) {
          setIsAdmin(admin);
          setLoading(false);
        }
      }, 0);
      timers.add(timer);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        eventSeen = true;
        if (active) applySession(nextSession);
      },
    );
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (active && !eventSeen) applySession(existingSession);
    }).catch(() => {
      if (active && !eventSeen) applySession(null);
    });

    return () => {
      active = false;
      ++revision;
      timers.forEach(clearTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
