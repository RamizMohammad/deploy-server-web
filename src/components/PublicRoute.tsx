import { Navigate } from "react-router-dom";
import { getToken } from "@/lib/api";

export const PublicRoute = ({ children }: any) => {
  const token = getToken();

  if (token) {
    return <Navigate to="/app" replace />;
  }

  return children;
};