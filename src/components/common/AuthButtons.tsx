import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const AuthButtons = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/signout", { method: "POST" });
      // If the server responds with a redirect URL use it, otherwise fallback to /signin
      if (res.redirected) {
        router.push(res.url);
        return;
      }
      if (res.ok) {
        router.push("/signin");
        return;
      }
      console.error("Sign out failed:", res.status, await res.text());
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="xs"
        onClick={() => router.push("/signup")}
      >
        Sign Up
      </Button>
      <Button
        variant="outline"
        size="xs"
        onClick={() => router.push("/signin")}
      >
        Sign In
      </Button>
      <Button
        variant="outline"
        size="xs"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </>
  );
};

export default AuthButtons;
