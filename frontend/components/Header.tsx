import { RefreshCw, UserRound } from "lucide-react";
import { profileLabels } from "@/lib/constants";
import type { Profile } from "@/lib/types";

export function Header({
  pageTitle,
  profile,
  eli10Enabled,
  onToggleEli10,
  onResetProfile
}: {
  pageTitle: string;
  profile: Profile | null;
  eli10Enabled: boolean;
  onToggleEli10: (nextValue: boolean) => void;
  onResetProfile: () => void;
}) {
  const profileLabel = profile ? profileLabels[profile] : "Guest";

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB]/10 bg-[#0A192F] px-4 py-4 text-white md:px-6 xl:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <h1 className="truncate text-xl font-semibold md:text-2xl">{pageTitle}</h1>

        <div className="flex items-center gap-3">
          {profile ? (
            <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">ELI10</span>
              <button
                type="button"
                role="switch"
                aria-checked={eli10Enabled}
                onClick={() => onToggleEli10(!eli10Enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  eli10Enabled ? "bg-[#2563EB]" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    eli10Enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          ) : null}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{profileLabel}</p>
            <p className="text-xs text-white/70">Profile</p>
          </div>
          {profile ? (
            <button
              type="button"
              onClick={onResetProfile}
              className="rounded-xl border border-white/10 p-2 text-white/70 transition duration-200 hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Change profile"
              title="Change profile"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          ) : null}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB]">
            <UserRound className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
