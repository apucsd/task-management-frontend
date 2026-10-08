export function setAuthSession(token: string, user?: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  // Store cookie for Next.js server-side proxy
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  sessionStorage.removeItem("pendingEmail");
  sessionStorage.removeItem("otpType");
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getAuthUser(): any | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}
