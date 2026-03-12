type BadgeVariant = "budget" | "mid-range" | "luxury" | "default";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  budget: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "mid-range": "bg-blue-50 text-blue-700 border-blue-200",
  luxury: "bg-purple-50 text-purple-700 border-purple-200",
  default: "bg-surface text-text-secondary border-border",
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
}
