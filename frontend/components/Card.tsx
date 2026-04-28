import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Card({ children, className = "", id }: CardProps) {
  return (
    <section
      id={id}
      className={`rounded-xl border border-[#E5E7EB] bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}
