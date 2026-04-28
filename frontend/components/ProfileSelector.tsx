import { BarChart3, GraduationCap, UserRound } from "lucide-react";
import type { Profile } from "@/lib/types";

const profiles: Array<{
  id: Profile;
  title: string;
  description: string;
  icon: typeof UserRound;
}> = [
  {
    id: "first_time_voter",
    title: "First-time voter",
    description: "A calm guided path for registration, documents, polling day, and next steps.",
    icon: UserRound
  },
  {
    id: "beginner",
    title: "Beginner",
    description: "A structured overview of the full election journey without heavy jargon.",
    icon: GraduationCap
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "A procedural view of checks, roles, verification points, and milestones.",
    icon: BarChart3
  }
];

export function ProfileSelector({
  onSelect,
  highlighted = false
}: {
  onSelect: (profile: Profile) => void;
  highlighted?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border bg-white p-1 shadow-sm transition duration-200 ${
        highlighted ? "border-[#F59E0B] ring-4 ring-[#FDE68A]/60" : "border-[#E5E7EB]"
      }`}
    >
      <div className="p-6 md:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            {highlighted ? "Demo step 1" : "Guided start"}
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[#111827] md:text-4xl">Choose your copilot mode</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6B7280] md:text-base">
            Your profile shapes the explanation depth, examples, and quiz style across the whole dashboard.
          </p>
          {highlighted ? (
            <p className="mt-4 rounded-full bg-[#FFF7ED] px-4 py-2 text-sm font-medium text-[#9A3412]">
              Start the judge flow here by picking any learner mode.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 border-t border-[#E5E7EB] bg-[#F8FAFC] p-5 md:grid-cols-3 md:p-6">
        {profiles.map((profile) => {
          const Icon = profile.icon;
          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => onSelect(profile.id)}
              className={`group rounded-xl border bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${
                highlighted ? "border-[#F59E0B] hover:border-[#D97706]" : "border-[#E5E7EB] hover:border-[#2563EB]"
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#3B82F6] transition duration-200 group-hover:border-[#2563EB] group-hover:text-[#2563EB]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-5 block text-base font-semibold text-[#111827]">{profile.title}</span>
              <span className="mt-2 block text-sm leading-6 text-[#6B7280]">{profile.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
