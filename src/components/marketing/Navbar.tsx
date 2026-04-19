import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { session } = useAuth();
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all",
        scrolled ? "glass-strong border-b border-white/5" : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold font-display text-sm font-bold text-primary-foreground">
            入
          </div>
          <span className="font-display text-lg font-semibold tracking-wide">入行</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" className={cn("hover:text-foreground transition", loc.pathname === "/" && "text-foreground")}>
            首页
          </Link>
          <a href="/#how" className="hover:text-foreground transition">
            运作方式
          </a>
          <Link
            to="/pricing"
            className={cn("hover:text-foreground transition", loc.pathname === "/pricing" && "text-foreground")}
          >
            定价
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm" className="bg-gradient-gold text-primary-foreground hover:opacity-95">
              <Link to="/dashboard">进入控制台</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hover:bg-white/5">
                <Link to="/login">登录</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-gold text-primary-foreground hover:opacity-95">
                <Link to="/register">注册</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
