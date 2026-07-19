export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pb-2.5 pt-5">
      <h2 className="text-[17px] font-extrabold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
