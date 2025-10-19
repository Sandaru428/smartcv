import Button from "@/components/ui/Button";
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
    </>
  );
};

export default AuthButtons;
