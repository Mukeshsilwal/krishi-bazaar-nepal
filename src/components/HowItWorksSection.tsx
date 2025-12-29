import { UserPlus, ListPlus, Handshake, Truck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register Easily",
    description:
      "Sign up with just your mobile number. Add your location and what you grow.",
  },
  {
    icon: ListPlus,
    step: "02",
    title: "List Your Crops",
    description:
      "Take a photo, set your price, and publish. Get suggested prices from live market data.",
  },
  {
    icon: Handshake,
    step: "03",
    title: "Connect & Negotiate",
    description:
      "Chat directly with interested buyers. Agree on price and pickup details.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Deliver & Earn",
    description:
      "Schedule pickup or delivery. Receive payment directly to your account.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-secondary/20 px-4 py-1.5 text-sm font-semibold text-secondary-foreground">
            How It Works
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Start Selling in{" "}
            <span className="text-gradient-warm">4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform is designed for simplicity. Get started in minutes, not
            hours.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mx-auto max-w-5xl">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary via-secondary to-accent md:block" />

          <div className="grid gap-8 md:gap-0">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`relative flex flex-col items-center gap-6 md:flex-row ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Card */}
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                  }`}
                >
                  <div className="rounded-2xl bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-medium md:p-8">
                    <div
                      className={`mb-4 flex items-center gap-3 ${
                        index % 2 === 0 ? "md:justify-end" : ""
                      }`}
                    >
                      <span className="text-sm font-bold text-primary">
                        Step {step.step}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero shadow-medium md:absolute md:left-1/2 md:-translate-x-1/2">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>

                {/* Spacer */}
                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
