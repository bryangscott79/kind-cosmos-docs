import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { TierKey, getTierFromProductId } from "@/lib/tiers";

interface Profile {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  company_name: string | null;
  website_url: string | null;
  business_summary: string | null;
  ai_summary: string | null;
  target_industries: string[] | null;
  company_size: string | null;
  role_title: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  // AI Impact Intelligence fields
  entity_type: string | null;
  user_persona: string | null;
  customer_industries: string[] | null;
  ai_maturity_self: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  tier: TierKey;
  subscriptionEnd: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<TierKey>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Subscription check error:", error);
        return;
      }
      if (data?.subscribed) {
        setTier(getTierFromProductId(data.product_id));
        setSubscriptionEnd(data.subscription_end);
      } else {
        setTier("free");
        setSubscriptionEnd(null);
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            refreshSubscription();
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setTier("free");
          setSubscriptionEnd(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        refreshSubscription();
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Periodic refresh every 60s
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setTier("free");
    setSubscriptionEnd(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, tier, subscriptionEnd, isAdmin, signOut, refreshProfile, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
