"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!authError) {
        router.push("/admin");
      } else {
        setError(authError.message);
      }
    } catch (err: any) {
      console.error(err);
      setError("Error de sistema: " + (err.message || "Revisa la consola"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 text-center space-y-4">
        <h1 className="font-serif text-3xl mb-8">Acceso Admin</h1>

        <input
          type="email"
          placeholder="Correo Electrónico"
          className="w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn w-full">Iniciar Sesión</button>
      </form>
    </div>
  );
}
