import { navItems } from "@/components/Sidebar";
import type { PageId } from "@/lib/view-state";


export function MobileNav({
  activePage,
  demoTargetPage,
  onPageChange
}: {
  activePage: PageId;
  demoTargetPage: PageId | null;
  onPageChange: (page: PageId) => void;
}) {
  return (
    <div className="border-b border-[#E5E7EB]/10 bg-[#0A192F] px-3 py-2 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          const highlighted = demoTargetPage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition duration-200 ${
                active
                  ? "bg-[#2563EB] text-white"
                  : highlighted
                    ? "bg-white/10 text-white ring-2 ring-[#F59E0B]/70"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
