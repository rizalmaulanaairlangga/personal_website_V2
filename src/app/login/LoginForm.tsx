"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  redirect: string;
}

export function LoginForm({ redirect }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/30 text-danger p-4 text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
