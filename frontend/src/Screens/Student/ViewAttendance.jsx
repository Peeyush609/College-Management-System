import React, { useEffect, useState } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaCheckCircle, FaTimesCircle, FaBook, FaCalendarAlt } from "react-icons/fa";

const COLORS = ["#22c55e", "#ef4444"]; // Tailwind green-500, red-500

const ViewAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        toast.loading("Loading attendance...");
        const response = await axiosWrapper.get("/attendance/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setAttendanceData(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to load attendance");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching attendance");
      } finally {
        setLoading(false);
        toast.dismiss();
      }
    };

    fetchAttendance();
    // eslint-disable-next-line
  }, []);

  // Calculate overall stats
  const totalPresent = attendanceData.reduce((acc, s) => acc + s.present, 0);
  const totalClasses = attendanceData.reduce((acc, s) => acc + s.total, 0);
  const overallPercent = totalClasses ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 sm:px-6 font-sans transition-colors duration-300 dark:bg-gray-900 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-300 tracking-tight drop-shadow-lg">
        <span className="inline-flex items-center gap-3">
          <FaBook className="text-blue-500 dark:text-blue-300" />
          My Attendance Overview
        </span>
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-green-100 via-white to-green-50 dark:from-green-900 dark:to-gray-800 rounded-2xl p-6 shadow hover:shadow-xl flex flex-col items-center">
          <span className="text-3xl font-bold text-green-700 dark:text-green-400">{totalPresent}</span>
          <span className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
            <FaCheckCircle className="text-green-500" /> Presents
          </span>
        </div>
        <div className="bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:from-blue-900 dark:to-gray-800 rounded-2xl p-6 shadow hover:shadow-xl flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalClasses}</span>
          <span className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
            <FaBook className="text-blue-500" /> Total Classes
          </span>
        </div>
        <div className="bg-gradient-to-br from-yellow-100 via-white to-yellow-50 dark:from-yellow-900 dark:to-gray-800 rounded-2xl p-6 shadow hover:shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 mb-2">
            <CircularProgressbar
              value={overallPercent}
              text={`${overallPercent}%`}
              styles={buildStyles({
                pathColor: "#f59e42",
                textColor: "#f59e42",
                trailColor: "#fef3c7",
                backgroundColor: "#fff7ed",
              })}
            />
          </div>
          <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <FaCalendarAlt className="text-yellow-500" /> Overall Attendance
          </span>
        </div>
      </div>

      {/* Subject Cards */}
      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
      ) : attendanceData.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-300">No attendance records found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {attendanceData.map((subject, index) => {
              const percent = subject.total
                ? ((subject.present / subject.total) * 100).toFixed(2)
                : 0;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                      <FaBook className="text-indigo-500" />
                      {subject.subjectName} ({subject.subjectCode})
                    </h2>
                    <div className="flex flex-wrap gap-4 mb-2 mt-4">
                      <span className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                        <FaCheckCircle /> Present: {subject.present}
                      </span>
                      <span className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                        <FaBook /> Total: {subject.total}
                      </span>
                    </div>
                    {/* Enhanced Donut Chart */}
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <defs>
                          <linearGradient id={`presentGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                          <linearGradient id={`absentGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={[
                            { name: "Present", value: subject.present },
                            { name: "Absent", value: subject.total - subject.present },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                          isAnimationActive
                          label={false}
                        >
                          <Cell fill={`url(#presentGradient-${index})`} />
                          <Cell fill={`url(#absentGradient-${index})`} />
                        </Pie>
                        {/* Centered Percentage Label */}
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xl font-bold fill-blue-700 dark:fill-blue-300"
                        >
                          {`${percent}%`}
                        </text>
                        <Tooltip
                          formatter={(value, name) =>
                            name === "Present"
                              ? [`${value} classes present`, "Present"]
                              : [`${value} classes absent`, "Absent"]
                          }
                          contentStyle={{
                            background: "#f9fafb",
                            color: "#1e293b",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          payload={[
                            {
                              value: "Present",
                              type: "circle",
                              color: "#22c55e",
                              id: "present",
                            },
                            {
                              value: "Absent",
                              type: "circle",
                              color: "#ef4444",
                              id: "absent",
                            },
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Attendance Table */}
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2">
            <FaCalendarAlt className="inline mr-2 text-blue-500" />
            Detailed Attendance Records
          </h2>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {attendanceData.map((subject) =>
                  subject.records.map((record, index) => (
                    <tr
                      key={`${subject.subjectCode}-${index}`}
                      className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-100">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                        {subject.subjectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === "present"
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {record.status === "present" ? (
                            <FaCheckCircle />
                          ) : (
                            <FaTimesCircle />
                          )}
                          {record.status === "present" ? "Present" : "Absent"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewAttendance;
