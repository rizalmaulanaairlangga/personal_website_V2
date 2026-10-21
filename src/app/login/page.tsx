import { LoginForm } from "./LoginForm";

interface PageProps {
  searchParams: { redirect?: string };
}

export default function LoginPage({ searchParams }: PageProps) {
  const redirect = searchParams.redirect || "/";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-text">Portfolio CMS</h1>
          <p className="mt-2 text-text-muted">Sign in to manage your projects</p>
        </div>

        <LoginForm redirect={redirect} />

        <p className="mt-6 text-center text-xs text-text-text-dim">
          This is a private admin interface. Do not share credentials.
        </p>
      </div>
    </div>
  );
}
