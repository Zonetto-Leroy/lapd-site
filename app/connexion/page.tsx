import Link from "next/link";
import LoginForm from "./LoginForm";

export default function ConnexionPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Se connecter</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-lapd-gold underline underline-offset-4">
            Créer un compte
          </Link>
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
