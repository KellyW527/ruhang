import { LucideIcon, Check } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  icon: LucideIcon;
  tag: string;
  title: string;
  desc: string;
  tasks: string[];
  pro?: boolean;
};

export function TrackCard({ icon: Icon, tag, title, desc, tasks, pro }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group glass relative flex flex-col overflow-hidden rounded-2xl p-6"
    >
      {pro && (
        <span className="absolute right-4 top-4 rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
          PRO
        </span>
      )}
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-gradient-gold group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-primary">{tag}</div>
      <h3 className="mt-1 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <ul className="mt-5 space-y-1.5">
        {tasks.map((t) => (
          <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {t}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
