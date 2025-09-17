// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          ¡Ups! Página no encontrada
        </p>
        <Link href="/" className="text-primary underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
