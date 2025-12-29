import { useState } from "react";
import { Menu, X, ShoppingCart, TrendingUp, BookOpen, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

const navLinks = [
  { name: "सुविधाहरू", nameEn: "Features", href: "#features", icon: BookOpen },
  { name: "कसरी काम गर्छ", nameEn: "How It Works", href: "#how-it-works", icon: Info },
  { name: "बजार भाउ", nameEn: "Prices", href: "#prices", icon: TrendingUp },
  { name: "हाम्रो बारेमा", nameEn: "About", href: "#about", icon: ShoppingCart },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex h-18 items-center justify-between px-4 md:h-20">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
            >
              <link.icon className="h-4 w-4" />
              <span className="flex flex-col leading-tight">
                <span className="font-semibold">{link.name}</span>
                <span className="text-xs opacity-70">{link.nameEn}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="lg" className="text-base">
            <span className="flex flex-col items-center leading-tight">
              <span>लग इन</span>
              <span className="text-xs opacity-70">Login</span>
            </span>
          </Button>
          <Button variant="default" size="lg" className="text-base">
            <span className="flex flex-col items-center leading-tight">
              <span>सुरु गर्नुहोस्</span>
              <span className="text-xs opacity-70">Get Started</span>
            </span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[72px] border-b border-border bg-background/95 backdrop-blur-lg lg:hidden">
          <div className="container flex flex-col gap-2 px-4 py-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-4 rounded-xl bg-muted/50 p-4 text-foreground transition-colors hover:bg-primary/10"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <link.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">{link.name}</span>
                  <span className="text-sm text-muted-foreground">{link.nameEn}</span>
                </div>
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" size="lg" className="h-14 w-full justify-center text-lg">
                <span className="flex flex-col items-center leading-tight">
                  <span>लग इन</span>
                  <span className="text-xs opacity-70">Login</span>
                </span>
              </Button>
              <Button variant="default" size="lg" className="h-14 w-full justify-center text-lg">
                <span className="flex flex-col items-center leading-tight">
                  <span>सुरु गर्नुहोस्</span>
                  <span className="text-xs opacity-70">Get Started</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
