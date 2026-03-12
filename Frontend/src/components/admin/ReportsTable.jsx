import { useEffect, useState } from "react";
import api from "../../services/api";
import timeAgo from "../../utils/timeAgo";

export default function ReportsTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/admin/reports");
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1f25] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Reports Queue
        </h2>
      </div>

      {loading && (
        <div className="p-6 text-gray-500 dark:text-gray-400">
          Loading reports...
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="p-6 text-gray-500 dark:text-gray-400">
          No reports yet.
        </div>
      )}

      {!loading && reports.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-left border-b border-gray-200 dark:border-gray-800">
            <tr className="text-gray-500 dark:text-gray-400">
              <th className="p-4">Type</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Reported By</th>
              <th className="p-4">Time</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr
                key={report._id}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  {report.type}
                </td>

                <td className="p-4 text-gray-700 dark:text-gray-300">
                  {report.reason}
                </td>

                <td className="p-4 text-gray-700 dark:text-gray-300">
                  {report.reportedBy?.username || "Unknown"}
                </td>

                <td className="p-4 text-gray-500 dark:text-gray-400">
                  {timeAgo(report.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}