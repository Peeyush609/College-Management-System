import React, { useEffect, useState } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import toast from "react-hot-toast";
import CustomButton from "../../components/CustomButton";

const TakeAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const token = localStorage.getItem("userToken");

  // ✅ Fetch branches and faculty subjects on load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const branchRes = await axiosWrapper.get("/branch", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (branchRes.data.success) {
          setBranches(branchRes.data.data);
        }

        const subjectRes = await axiosWrapper.get("/subject/faculty", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subjectRes.data.success) {
          setSubjects(subjectRes.data.data);
        }
      } catch (err) {
        toast.error("Failed to fetch initial data");
      }
    };

    fetchInitialData();
  }, [token]);

  // ✅ Fetch students based on selected branch & semester
  const fetchStudents = async () => {
    try {
      const res = await axiosWrapper.post(
        "/student/filter",
        {
          semester: selectedSemester,
          branch: selectedBranch,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setStudents(res.data.data);
        const initAttendance = {};
        res.data.data.forEach((s) => (initAttendance[s._id] = true));
        setAttendance(initAttendance);
      }
    } catch (err) {
      toast.error("Failed to fetch students");
    }
  };

  // ✅ Submit attendance
  const submitAttendance = async () => {
    try {
      const facultyId = JSON.parse(atob(token.split(".")[1])).userId; // decode from JWT

      const records = Object.entries(attendance).map(([studentId, isPresent]) => ({
        studentId,
        subjectId: selectedSubject,
        branchId: selectedBranch,
        semester: selectedSemester,
        date: new Date(),
        takenBy: facultyId,
        isPresent,
        status: isPresent ? "present" : "absent",
      }));

      const res = await axiosWrapper.post("/attendance", records, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("Attendance recorded successfully");
      } else {
        toast.error("Failed to record attendance");
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      toast.error("Error saving attendance");
    }
  };


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Take Attendance</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Subject Dropdown */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Subject</option>
          {subjects.map((subj) => (
            <option key={subj._id} value={subj._id}>
              {subj.name} ({subj.code})
            </option>
          ))}
        </select>

        {/* Branch Dropdown */}
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>

        {/* Semester Dropdown */}
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(Number(e.target.value))}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>

        <CustomButton onClick={fetchStudents} variant="primary">
          Load Students
        </CustomButton>
      </div>

      {/* Student List + Attendance Checkbox */}
      {students.length > 0 && (
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            {students.map((student) => (
              <div key={student._id} className="flex items-center gap-4 mb-2">
                <label className="flex-1">
                  {student.firstName} {student.lastName}
                </label>
                <input
                  type="checkbox"
                  checked={attendance[student._id] || false}
                  onChange={(e) =>
                    setAttendance({
                      ...attendance,
                      [student._id]: e.target.checked,
                    })
                  }
                />
                <span>{attendance[student._id] ? "Present" : "Absent"}</span>
              </div>
            ))}
          </div>
          <CustomButton onClick={submitAttendance} variant="success">
            Submit Attendance
          </CustomButton>
        </form>
      )}
    </div>
  );
};

export default TakeAttendance;
