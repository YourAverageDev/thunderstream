import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    try {
      // Accessing `supabase` throws synchronously if Supabase env vars aren't
      // configured (e.g. a fresh deploy before secrets are set). Since
      // useAuth runs on every page via <Navbar/>, an uncaught throw here
      // would crash the whole app instead of just disabling sign-in.
      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setUser(data.session?.user ?? null);
        setLoading(false);
      }).catch(() => {
        if (mounted) setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
      });
      return () => {
        mounted = false;
        sub.subscription.unsubscribe();
      };
    } catch {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
  }, []);

  return { user, loading };
}
