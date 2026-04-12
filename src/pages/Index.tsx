import { Rocket, Github, ArrowRight, Zap, Globe, Terminal, Shield, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithGithub, isAuthenticated } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const LandingNavbar = () => {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">DeployX</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#preview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Preview</a>
        </div>
        <div className="flex items-center gap-3">
          {authed ? (
            <Button onClick={() => navigate("/dashboard")} size="sm">Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={loginWithGithub} className="text-muted-foreground hover:text-foreground">
                Login
              </Button>
              <Button size="sm" onClick={loginWithGithub} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
    {/* Background grid */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: "linear-gradient(hsl(199, 89%, 48%) 1px, transparent 1px), linear-gradient(90deg, hsl(199, 89%, 48%) 1px, transparent 1px)",
      backgroundSize: "60px 60px"
    }} />
    {/* Glow */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
    <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[100px]" />

    <div className="container relative z-10 mx-auto px-4 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 mb-8 text-sm text-muted-foreground animate-fade-up">
        <Zap className="h-3.5 w-3.5 text-primary" />
        Now with zero-config deployments
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        Deploy your apps
        <br />
        <span className="gradient-text">in seconds</span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
        Push your code, and DeployX handles the rest. Lightning-fast builds, global edge network, and real-time logs — all from a single dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <Button size="lg" onClick={loginWithGithub} className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base font-semibold animate-pulse-glow">
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button size="lg" variant="outline" onClick={loginWithGithub} className="h-12 px-8 text-base border-border hover:bg-secondary">
          <Github className="mr-2 h-5 w-5" /> Login with GitHub
        </Button>
      </div>

      {/* Terminal preview */}
      <div className="mt-16 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: "0.5s" }}>
        <div className="glass rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">deployx deploy</span>
          </div>
          <div className="terminal-bg p-5 text-left text-muted-foreground leading-relaxed">
            <p><span className="text-success">✓</span> Connected to GitHub</p>
            <p><span className="text-success">✓</span> Repository cloned: <span className="text-primary">my-app</span></p>
            <p><span className="text-success">✓</span> Dependencies installed</p>
            <p><span className="text-success">✓</span> Build completed in <span className="text-foreground">3.2s</span></p>
            <p><span className="text-success">✓</span> Deployed to <span className="text-primary">my-app.deployx.dev</span></p>
            <p className="mt-2 text-foreground">🚀 Live at https://my-app.deployx.dev</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const features = [
  { icon: Github, title: "GitHub Integration", desc: "Connect your repos and deploy with every push. Zero configuration needed." },
  { icon: Zap, title: "One-Click Deploy", desc: "Select a repo and hit deploy. We handle the build pipeline automatically." },
  { icon: Terminal, title: "Real-time Logs", desc: "Stream build and runtime logs directly in your browser, live." },
  { icon: Globe, title: "Custom Domains", desc: "Attach your own domain with automatic SSL certificates." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC2 compliant infrastructure with encrypted secrets management." },
  { icon: Server, title: "Auto Scaling", desc: "Scale from zero to millions. Pay only for what you use." },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 relative">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship fast</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built for developers who want to focus on code, not infrastructure.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="glass-hover rounded-xl p-6 group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const steps = [
  { num: "01", title: "Connect GitHub", desc: "Authorize DeployX to access your repositories securely." },
  { num: "02", title: "Select Repository", desc: "Choose which project you want to deploy from your repo list." },
  { num: "03", title: "Deploy Instantly", desc: "Hit deploy and watch your app go live in seconds." },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 relative">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
        <p className="text-muted-foreground text-lg">Three steps from code to production.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="text-center relative">
            <div className="text-5xl font-extrabold gradient-text mb-4">{s.num}</div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 -right-4 w-8">
                <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PreviewSection = () => (
  <section id="preview" className="py-24">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">A dashboard you'll love</h2>
        <p className="text-muted-foreground text-lg">Monitor, manage, and deploy — all in one place.</p>
      </div>
      <div className="glass rounded-2xl p-6 max-w-5xl mx-auto shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Projects", value: "12" },
            { label: "Deployments", value: "148" },
            { label: "Uptime", value: "99.9%" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["my-saas-app", "landing-page", "api-service", "docs-site"].map((name) => (
            <div key={name} className="rounded-lg border border-border/30 bg-secondary/30 p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">Last deployed 2h ago</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">Live</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border/30 py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">DeployX</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          <a href="#" className="hover:text-foreground transition-colors">Status</a>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 DeployX. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const Index = () => (
  <div className="min-h-screen bg-background">
    <LandingNavbar />
    <HeroSection />
    <FeaturesSection />
    <HowItWorksSection />
    <PreviewSection />
    <Footer />
  </div>
);

export default Index;
