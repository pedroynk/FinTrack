import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, ScanEye } from "lucide-react";

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const [theme, setTheme] = useState<"light" | "dark">(
    typeof window !== "undefined"
      ? (localStorage.getItem("theme") as "light" | "dark") || "dark"
      : "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1"></div>
        <div className="flex gap-x-12">
          <a
            href="#home"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Home
          </a>
          <a
            href="#work"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Trabalho
          </a>
          <a
            href="#diff"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Diferenciais
          </a>
        </div>
        <div className="flex flex-1 justify-end">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          )}
          <a
            href="/admin"
            className="group relative rounded-full p-2 text-primary hover:bg-primary/20 transition-colors"
          >
            <ScanEye className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" />
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
