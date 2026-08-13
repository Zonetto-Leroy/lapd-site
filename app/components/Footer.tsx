import Image from "next/image";
import logo from "@/public/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background-elevated py-8 text-center text-sm text-foreground-muted">
      <Image src={logo} alt="" width={40} height={40} className="mx-auto mb-3 rounded-full ring-1 ring-border" />
      <p className="font-display uppercase tracking-widest text-foreground/80">
        Los Angeles Police Department
      </p>
      <p className="mt-2">© {new Date().getFullYear()} LAPD — To Protect and to Serve</p>
    </footer>
  );
}
