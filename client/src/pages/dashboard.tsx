import { MigrationControl } from "@/components/MigrationControl";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <MigrationControl />
      </div>
    </div>
  );
}
