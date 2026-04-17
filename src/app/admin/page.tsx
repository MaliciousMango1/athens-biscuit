"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] ?? null : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = api.admin.login.useMutation();
  const stats = api.admin.stats.useQuery(undefined, { enabled: isLoggedIn });

  useEffect(() => {
    if (getCookie("admin_token")) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    const result = await loginMutation.mutateAsync({ password });
    if (result.success) {
      setCookie("admin_token", password, 7);
      setIsLoggedIn(true);
    } else {
      setError("Invalid password");
    }
  };

  const handleLogout = () => {
    deleteCookie("admin_token");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-bold text-amber-900">Admin Login</h1>
          {error && (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter admin password"
            className="mb-3 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            onClick={handleLogin}
            disabled={loginMutation.isPending}
            className="w-full rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-900">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-amber-600 hover:text-amber-800"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      {stats.data && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-amber-200 bg-white p-4">
            <p className="text-2xl font-bold text-amber-900">{stats.data.restaurantCount}</p>
            <p className="text-sm text-amber-600">Restaurants</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-white p-4">
            <p className="text-2xl font-bold text-amber-900">{stats.data.biscuitTypeCount}</p>
            <p className="text-sm text-amber-600">Biscuit Types</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-white p-4">
            <p className="text-2xl font-bold text-amber-900">{stats.data.ballotCount}</p>
            <p className="text-sm text-amber-600">Total Ballots</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-white p-4">
            <p className="text-2xl font-bold text-amber-900">{stats.data.suggestionCount}</p>
            <p className="text-sm text-amber-600">Pending Suggestions</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/restaurants"
          className="rounded-lg border border-amber-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-amber-900">Restaurants</h2>
          <p className="text-sm text-amber-600">Add, edit, and manage restaurants</p>
        </Link>
        <Link
          href="/admin/biscuit-types"
          className="rounded-lg border border-amber-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-amber-900">Biscuit Types</h2>
          <p className="text-sm text-amber-600">Manage biscuit categories</p>
        </Link>
        <Link
          href="/admin/ballots"
          className="rounded-lg border border-amber-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-amber-900">Ballots</h2>
          <p className="text-sm text-amber-600">View every submitted ranking</p>
        </Link>
        <Link
          href="/admin/suggestions"
          className="rounded-lg border border-amber-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-amber-900">Suggestions</h2>
          <p className="text-sm text-amber-600">Review community suggestions</p>
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-lg border border-amber-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-amber-900">Settings</h2>
          <p className="text-sm text-amber-600">Tune ranking algorithm</p>
        </Link>
      </div>
    </div>
  );
}
