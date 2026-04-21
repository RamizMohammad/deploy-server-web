export { getToken, isAuthenticated } from "@/lib/api";

export async function logout() {
  const { logoutRequest, removeToken } = await import("@/lib/api");
  await logoutRequest();
  removeToken();
  window.location.href = "/login";
}
