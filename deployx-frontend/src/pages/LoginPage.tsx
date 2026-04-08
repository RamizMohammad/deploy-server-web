import { Github, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <Rocket className="h-6 w-6 text-primary-foreground" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">DeployKit</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ship faster. Deploy smarter.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription>
              Sign in with GitHub to connect your repositories.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">

            <Button
              className="w-full gap-2"
              onClick={() => {
                window.location.href = "http://localhost:8001/auth/github/connect";
              }}
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LoginPage;