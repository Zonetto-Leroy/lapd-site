import Link from "next/link";
import RegisterForm from "./RegisterForm";

export default function InscriptionPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Créer un compte</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-lapd-gold underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
