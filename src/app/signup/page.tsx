import { AuthForm } from "@/components/auth-form";
import { redirectSignedInUser } from "@/lib/session";
import { configured } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Page() {
  await redirectSignedInUser();
  return <AuthForm enabled={configured()} signup={true} />;
}
