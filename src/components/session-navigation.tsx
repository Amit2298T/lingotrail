"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export function SessionNavigation() {
  const router = useRouter();
  const { data, isPending, error, refetch } = authClient.useSession();
  const previousUser = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (isPending || error) return;
    const userId = data?.user.id ?? null;
    if (previousUser.current !== undefined && previousUser.current !== userId)
      router.refresh();
    previousUser.current = userId;
  }, [data?.user.id, isPending, error, router]);
  useEffect(() => {
    const historyChanged = () => {
      void refetch({ query: { disableCookieCache: true } }).then(() =>
        router.refresh(),
      );
    };
    const pageShown = (event: PageTransitionEvent) => {
      // A restored document can contain a snapshot from before login/logout.
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("popstate", historyChanged);
    window.addEventListener("pageshow", pageShown);
    return () => {
      window.removeEventListener("popstate", historyChanged);
      window.removeEventListener("pageshow", pageShown);
    };
  }, [refetch, router]);
  return null;
}
