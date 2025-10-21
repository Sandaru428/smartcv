import Button from "@/components/ui/Button";
import { signout } from "@/hooks/authActions";
import { useRouter } from "next/navigation";

const AuthButtons = () => {
  const router = useRouter();

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
        onClick={signout}
      >
        Sign Out
      </Button>
    </>
  );
};

export default AuthButtons;
