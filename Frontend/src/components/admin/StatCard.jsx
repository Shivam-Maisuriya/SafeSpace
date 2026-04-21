export default function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-[#1a1f25] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-1">
        {value ?? "-"}
      </p>
    </div>
  );
}