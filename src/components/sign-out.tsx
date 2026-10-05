"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
export function SignOut() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <button
        className="button secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const result = await authClient.signOut();
            if (result.error) throw Error();
            window.location.replace("/");
          } catch {
            setError("Could not sign out. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Signing out…" : "Log out"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
