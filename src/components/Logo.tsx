import { Leaf } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-soft">
        <Leaf className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold leading-tight text-foreground">
          Krishi<span className="text-primary">Hub</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Nepal
        </span>
      </div>
    </div>
  );
};

export default Logo;
