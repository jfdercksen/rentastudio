"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/client";

// Metadata cannot be exported from 'use client' — defined separately below
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  async function onSubmit(data: LoginInput) {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0e0d0b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: 28,
              fontWeight: 300,
              color: "#faf7f2",
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Kyalami Studio
          </div>
          <div
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#c8984a",
            }}
          >
            Admin Portal
          </div>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "#1a1a18",
            border: "1px solid #2a2a28",
            borderRadius: 12,
            padding: "36px 32px",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#a09890",
                  marginBottom: 8,
                  letterSpacing: "0.02em",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "#0e0d0b",
                  border: errors.email ? "1px solid #c0392b" : "1px solid #2a2a28",
                  borderRadius: 6,
                  color: "#faf7f2",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.email && (
                <p style={{ marginTop: 6, fontSize: 12, color: "#e74c3c" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#a09890",
                  marginBottom: 8,
                  letterSpacing: "0.02em",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "#0e0d0b",
                  border: errors.password
                    ? "1px solid #c0392b"
                    : "1px solid #2a2a28",
                  borderRadius: 6,
                  color: "#faf7f2",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.password && (
                <p style={{ marginTop: 6, fontSize: 12, color: "#e74c3c" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Auth error */}
            {authError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(192,57,43,0.12)",
                  border: "1px solid rgba(192,57,43,0.3)",
                  borderRadius: 6,
                  marginBottom: 20,
                  fontSize: 13,
                  color: "#e74c3c",
                }}
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px 24px",
                background: isSubmitting ? "#5a5850" : "#c8984a",
                color: "#0e0d0b",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Metadata must be exported from a server component — use generateMetadata or a separate layout
export const dynamic = "force-dynamic";
