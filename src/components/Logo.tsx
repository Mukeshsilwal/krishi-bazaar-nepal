import { Leaf } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero shadow-soft">
        <Leaf className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-tight text-foreground">
          कृषि<span className="text-primary">हब</span>
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          KrishiHub Nepal
        </span>
      </div>
    </div>
  );
};

export default Logo;
