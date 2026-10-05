import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { configured, getDb } from "./db";
import { getAuth } from "./auth";
export async function currentUser() {
  if (!configured()) return null;
  const session = await getAuth().api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
export async function redirectSignedInUser() {
  const user = await currentUser();
  if (!user) return;
  const profile = await getDb().profile.findUnique({
    where: { userId: user.id },
    select: { userId: true },
  });
  redirect(profile ? "/learn" : "/onboarding");
}
