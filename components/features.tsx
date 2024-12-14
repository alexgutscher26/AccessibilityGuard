import {
  ShieldCheckIcon,
  ActivityIcon,
  CodeIcon,
  BrainCircuitIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const features = [
  {
    icon: ShieldCheckIcon,
    title: "WCAG Compliance",
    description:
      "Comprehensive analysis based on WCAG 2.1 guidelines ensuring your website meets accessibility standards.",
    color: "from-primary/40 to-primary/80",
  },
  {
    icon: ActivityIcon,
    title: "Real-Time Analysis",
    description:
      "Instant feedback on accessibility issues with detailed reports and metrics.",
    color: "from-primary/50 to-primary/90",
  },
  {
    icon: CodeIcon,
    title: "API Integration",
    description:
      "RESTful API endpoints for seamless integration with your development workflow.",
    color: "from-primary/60 to-primary",
  },
  {
    icon: BrainCircuitIcon,
    title: "AI-Powered Insights",
    description:
      "Smart recommendations and automated fixes powered by advanced AI algorithms.",
    color: "from-primary/70 to-primary",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <div className="flex w-full justify-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full"
      >
        {features.map((feature) => (
          <motion.div key={feature.title} variants={item} className="flex">
            <Card className="relative overflow-hidden p-6 hover:shadow-lg transition-all duration-300 flex flex-col w-full bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/20">
              <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${feature.color}`} />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-primary/5 p-3">
                  <feature.icon className={`h-8 w-8 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                </div>
                <h3 className={`text-xl font-semibold mb-3 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}