import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Github, ArrowRight, Zap, RotateCcw, Globe, Terminal, Code2, GitBranch } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const PIPELINE_STEPS = ["Push to GitHub", "Build", "Deploy", "Live"];
const FAKE_LOGS = [
  { text: "$ launchly deploy --prod", type: "info" as const },
  { text: "Cloning repository...", type: "info" as const },
  { text: "Installing dependencies...", type: "info" as const },
  { text: "$ npm install", type: "info" as const },
  { text: "added 1,247 packages in 8.3s", type: "info" as const },
  { text: "Building project...", type: "info" as const },
  { text: "$ npm run build", type: "info" as const },
  { text: "Creating optimized production build...", type: "info" as const },
  { text: "Compiled successfully.", type: "success" as const },
  { text: "Deploying to edge network...", type: "info" as const },
  { text: "Propagating to 34 edge locations...", type: "info" as const },
  { text: "✓ Deployment successful!", type: "success" as const },
  { text: "→ https://my-app.launchly.systems", type: "success" as const },
];

const FEATURES = [
  { icon: GitBranch, title: "Git-based Workflows", desc: "Push to deploy. Every branch gets a preview URL automatically." },
  { icon: RotateCcw, title: "Instant Rollbacks", desc: "Roll back to any previous deployment with a single click." },
  { icon: Globe, title: "Global Edge Network", desc: "Deployed to 34+ edge locations worldwide for minimal latency." },
  { icon: Zap, title: "Zero-config Builds", desc: "Auto-detects your framework and configures the build pipeline." },
];

const LiveTerminal = () => {
  const [lines, setLines] = useState<typeof FAKE_LOGS>([]);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (i < FAKE_LOGS.length) {
        const log = FAKE_LOGS[i];
        if (log) {
          setLines((prev) => [...prev, log]);
        }
        i++;
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
        timeout = setTimeout(tick, 600);
      } else {
        setDone(true);
        timeout = setTimeout(() => {
          setLines([]);
          setDone(false);
        }, 4000);
      }
    };
    timeout = setTimeout(tick, 600);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div className="glass rounded-xl overflow-hidden max-w-2xl mx-auto">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
        <div className="w-3 h-3 rounded-full bg-destructive/60" />
        <div className="w-3 h-3 rounded-full bg-warning/60" />
        <div className="w-3 h-3 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">launchly deploy</span>
      </div>
      <div ref={ref} className="terminal-bg p-4 h-72 overflow-y-auto space-y-1">
        {lines.map((line, i) => (
          <motion.p
            key={`${i}-${line.text}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-sm font-mono ${
              line.type === "success" ? "text-success" : "text-muted-foreground"
            }`}
          >
            {line.text}
          </motion.p>
        ))}
        {!done && lines.length > 0 && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [activePipeline, setActivePipeline] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipeline((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-40 border-b border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground tracking-tight">Launchly</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90" onClick={() => navigate("/login")}>
              Start Deploying
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-4xl mx-auto text-center">
          {/* Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-secondary/50 text-xs text-muted-foreground mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Now with global edge deployment
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            Deploy from GitHub{" "}
            <span className="gradient-text">in seconds</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-10"
          >
            Push your code. We handle the rest. Automatic builds, global CDN, instant rollbacks — the deployment platform developers love.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-center gap-4 mb-16">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 gap-2" onClick={() => navigate("/login")}>
              Start Deploying <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-border/50 hover:bg-secondary/50" onClick={() => navigate("/login")}>
              <Github className="h-4 w-4" /> Login with GitHub
            </Button>
          </motion.div>

          {/* Pipeline animation */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="flex items-center justify-center gap-2 md:gap-4 mb-4"
          >
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 md:gap-4">
                <div className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-500 ${
                  i <= activePipeline
                    ? "border-primary/50 bg-primary/10 text-primary shadow-[0_0_20px_-8px_hsl(var(--primary)/0.5)]"
                    : "border-border/30 bg-secondary/30 text-muted-foreground"
                }`}>
                  {step}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className={`h-4 w-4 transition-colors duration-500 ${i < activePipeline ? "text-primary" : "text-muted-foreground/30"}`} />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Live terminal */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-foreground text-center mb-3">Watch it deploy</h2>
          <p className="text-muted-foreground text-center mb-10">Real-time build logs. See every step of your deployment.</p>
          <LiveTerminal />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">Built for developers</h2>
            <p className="text-muted-foreground">Everything you need to ship with confidence.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-hover rounded-xl p-6 group cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer experience */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">CLI + Dashboard</h2>
            <p className="text-muted-foreground">Deploy from the terminal or the browser. Your choice.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">Terminal</span>
              </div>
              <div className="terminal-bg p-5 space-y-2">
                <p className="text-sm font-mono text-muted-foreground"><span className="text-primary">$</span> npx launchly init</p>
                <p className="text-sm font-mono text-muted-foreground"><span className="text-primary">$</span> launchly deploy --prod</p>
                <p className="text-sm font-mono text-success">✓ Deployed to https://my-app.launchly.systems</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">Dashboard</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm font-medium text-foreground">Production</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2m ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                    <span className="text-sm font-medium text-foreground">Preview</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Building...</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to launch?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of developers shipping faster with Launchly.</p>
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 gap-2" onClick={() => navigate("/login")}>
            Start Deploying <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Launchly</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Launchly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
