import { SignIn } from "@/components/SignIn";
import { Profile } from "@/components/profile/profile";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
      <SignIn />
      <Profile />
    </main>
  );
}
