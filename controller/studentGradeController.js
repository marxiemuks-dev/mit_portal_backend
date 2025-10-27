const supabase = require("../config/supabaseClient");

// ➕ Add Student Grade
const addStudentGrade = async (req, res) => {
  try {
    const { premid,midterm,prefinal,finalterm,student_id,subject_schedule_id} = req.body;

    // ✅ Validation
    if (!student_id || !subject_schedule_id) {
      return res.status(400).json({
        status: "error",
        message: "student_id and subject_schedule_id are required",
      });
    }
    const { data, error } = await supabase
      .from("student_grade")
      .insert([
        {
          premid,
          midterm,
          prefinal,
          finalterm,
          student_id,
          subject_schedule_id,
        },
      ])
      .select("*");
    if (error) throw error;
    res.status(201).json({
      status: "success",
      message: "Student grade added successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("❌ Error adding student grade:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: [],
    });
  }
};

// 📋 Get all student grades with student & subject details
const getStudentGrades = async (req, res) => {
  try {
        const { data, error } = await supabase
      .from("student_grade")
      .select(`
        id,
        created_at,
        premid,
        midterm,
        prefinal,
        finalterm,
        studentEnrollment:studentEnrollment (
          id,
          current_course,
          current_year_level,
          students:students (
            id,
            student_no,
            first_name,
            middle_name,
            last_name
          )
        ),
        schedule:schedule (
          schedule_id,
          subject_code,
          desc_title,
          units,
          course,
          semester,
          school_year,
          time,
          day,
          room
        )
      `)
      .eq("subject_schedule_id", subject_schedule_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No student grades found for this subject",
        data: [],
      });
    }
    const formattedData = data.map((item) => ({
      ...item,
      student_name: item.student
        ? `${item.student.first_name} ${
            item.student.middle_name ? item.student.middle_name + " " : ""
          }${item.student.last_name}`
        : "N/A",
      subject_title: item.schedule
        ? `${item.schedule.subject_code} - ${item.schedule.desc_title}`
        : "N/A",
    }));

    res.status(200).json({
      status: "success",
      message: "Fetched student grades for the subject schedule",
      data: formattedData,
    });
  } catch (err) {
    console.error("❌ Error fetching grades by subject_schedule_id:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: [],
    });
  }
};

// 📊 Get all student grades by subject_schedule_id
const getStudentGradesBySchedule = async (req, res) => {
  try {
    const { subject_schedule_id } = req.params;

    if (!subject_schedule_id) {
      return res.status(400).json({
        status: "error",
        message: "subject_schedule_id is required",
      });
    }

    // 👇 Join student_grade → studentEnrollment → students
    const { data, error } = await supabase
      .from("student_grade")
      .select(`
        id,
        created_at,
        premid,
        midterm,
        prefinal,
        finalterm,
        studentEnrollment:studentEnrollment (
          id,
          current_course,
          current_year_level,
          students:students (
            id,
            student_no,
            first_name,
            middle_name,
            last_name
          )
        ),
        schedule:schedule (
          schedule_id,
          subject_code,
          desc_title,
          units,
          course,
          semester,
          school_year,
          time,
          day,
          room
        )
      `)
      .eq("subject_schedule_id", subject_schedule_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // ✅ Format the response nicely
    const formattedData = data.map((item) => {
      const student = item.studentEnrollment?.students;
      return {
        id: item.id,
        created_at: item.created_at,
        premid: item.premid,
        midterm: item.midterm,
        prefinal: item.prefinal,
        finalterm: item.finalterm,
        student_id: student?.id || null,
        student_no: student?.student_no || "N/A",
        student_name: student
          ? `${student.first_name} ${
              student.middle_name ? student.middle_name + " " : ""
            }${student.last_name}`
          : "N/A",
        course: item.studentEnrollment?.current_course || "N/A",
        year_level: item.studentEnrollment?.current_year_level || "N/A",
        subject_title: item.schedule
          ? `${item.schedule.subject_code} - ${item.schedule.desc_title}`
          : "N/A",
        schedule: item.schedule,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Fetched student grades successfully",
      data: formattedData,
    });
  } catch (err) {
    console.error("❌ Error fetching student grades:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: [],
    });
  }
};

// ✏️ Update a student's grade
const updateStudentGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const {premid,midterm,prefinal,finalterm } = req.body;

    // ✅ Validate requiredd fields
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Grade ID is required",
      });
    }

    // ⚠️ Optional: validate numeric values
    if (
      (premid !== undefined && isNaN(premid)) ||
      (midterm !== undefined && isNaN(midterm)) ||
      (prefinal !== undefined && isNaN(prefinal)) ||
      (finalterm !== undefined && isNaN(finalterm))
    ) {
      return res.status(400).json({
        status: "error",
        message: "Prelim, Midterm, and Final must be numbers",
      });
    }

    // 🔄 Update the grade record
    const { data, error } = await supabase
      .from("student_grade")
      .update({
        premid,
        midterm,
        prefinal,
        finalterm,
        updated_at: new Date(), // if you have an updated_at column
      })
      .eq("id", id)
      .select(`
        id,
        premid,
        midterm,
        prefinal,
        finalterm,
        studentEnrollment:studentEnrollment (
          id,
          current_course,
          current_year_level,
          students:students (
            id,
            student_no,
            first_name,
            middle_name,
            last_name
          )
        )
      `)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Grade not found",
      });
    }
    // ✅ Return the updated grade
    const student = data.studentEnrollment?.students;

    res.status(200).json({
      status: "success",
      message: "Student grade updated successfully",
      data: {
        id: data.id,
        premid: data.premid,
        midterm: data.midterm,
        prefinal: data.prefinal,
        finalterm: data.finalterm,
        student_id: student?.id || null,
        student_no: student?.student_no || "N/A",
        student_name: student
          ? `${student.first_name} ${
              student.middle_name ? student.middle_name + " " : ""
            }${student.last_name}`
          : "N/A",
        course: data.studentEnrollment?.current_course || "N/A",
        year_level: data.studentEnrollment?.current_year_level || "N/A",
      },
    });
  } catch (err) {
    console.error("❌ Error updating student grade:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

// 📋 Get all grades for a specific student by student_id
const getStudentGradesByStudentId = async (req, res) => {
  try {
    const { student_id } = req.params;

    console.log(student_id)
    if (!student_id) {
      return res.status(400).json({
        status: "error",
        message: "Student ID is required",
        data: [],
      });
    }

    const { data, error } = await supabase
      .from("student_grade")
      .select(`
        id,
        created_at,
        premid,
        midterm,
        prefinal,
        finalterm,
        studentEnrollment:studentEnrollment (
          id,
          current_course,
          current_year_level,
          student_id,
          students:students (
            id,
            student_no,
            first_name,
            middle_name,
            last_name
          )
        ),
        schedule:schedule (
          schedule_id,
          subject_code,
          desc_title,
          units,
          course,
          semester,
          school_year,
          time,
          day,
          room
        )
      `)
      .eq("studentEnrollment.students.id", student_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No grades found for this student",
        data: [],
      });
    }


    res.status(200).json({
      status: "success",
      message: "Fetched student grades successfully",
      data: data,
    });
  } catch (err) {
    console.error("❌ Error fetching grades by student_id:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: [],
    });
  }
};

const getStudentGradeEvaluation = async (req, res) => {
  try {
    const { student_id } = req.params; // From "students" table

    if (!student_id) {
      return res.status(400).json({
        status: "error",
        message: "Student ID is required",
      });
    }

    // ✅ Step 1: Check if student exists
    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id, student_no, first_name, middle_name, last_name, student_email, course, year_level")
      .eq("id", student_id)
      .single();

    if (studentErr || !student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // ✅ Step 2: Get all enrollment IDs linked to this student
    const { data: enrollments, error: enrollErr } = await supabase
      .from("studentEnrollment")
      .select("id, current_course, current_year_level, current_semester, current_school_year")
      .eq("student_id", student_id);

    if (enrollErr) throw enrollErr;

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No enrollment records found for this student",
      });
    }

    const enrollmentIds = enrollments.map((e) => e.id);

    // ✅ Step 3: Get all grades tied to those enrollments with schedule
    const { data: grades, error: gradeErr } = await supabase
      .from("student_grade")
      .select(`
        id,
        premid,
        midterm,
        prefinal,
        finalterm,
        updated_at,
        studentEnrollment:studentEnrollment (
          id,
          current_course,
          current_year_level,
          current_semester,
          current_school_year
        ),
        schedule:schedule (
          schedule_id,
          subject_code,
          desc_title,
          units,
          time,
          day,
          room,
          course,
          school_year,
          semester,
          section,
          year_level
        )
      `)
      .in("studentEnrollment.id", enrollmentIds);

    if (gradeErr) throw gradeErr;

    if (!grades || grades.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No grade records found for this student",
      });
    }

    // ✅ Step 4: Sort and group by School Year → Semester
    grades.sort((a, b) => {
      const syA = a.schedule?.school_year || "";
      const syB = b.schedule?.school_year || "";
      const semA = a.schedule?.semester || "";
      const semB = b.schedule?.semester || "";

      if (syA < syB) return -1;
      if (syA > syB) return 1;

      const semOrder = { "1st Semester": 1, "2nd Semester": 2, "Summer": 3 };
      return (semOrder[semA] || 99) - (semOrder[semB] || 99);
    });

    const grouped = {};

    grades.forEach((item) => {
      const sy = item.schedule?.school_year || "Unknown SY";
      const sem = item.schedule?.semester || "Unknown Semester";
      const key = `${sy} - ${sem}`;

      if (!grouped[key]) {
        grouped[key] = {
          school_year: sy,
          semester: sem,
          subjects: [],
          totalUnits: 0,
          average: 0,
        };
      }

      const premid = parseFloat(item.premid) || 0;
      const midterm = parseFloat(item.midterm) || 0;
      const prefinal = parseFloat(item.prefinal) || 0;
      const finalterm = parseFloat(item.finalterm) || 0;

      // ✅ Compute subject average (ignore 0 grades)
      const gradesArray = [premid, midterm, prefinal, finalterm].filter((g) => g > 0);
      const subjectAverage =
        gradesArray.length > 0
          ? gradesArray.reduce((a, b) => a + b, 0) / gradesArray.length
          : 0;

      const units = parseFloat(item.schedule?.units) || 0;

      grouped[key].subjects.push({
        subject_code: item.schedule?.subject_code || "N/A",
        desc_title: item.schedule?.desc_title || "N/A",
        units: units,
        premid: item.premid ?? "-",
        midterm: item.midterm ?? "-",
        prefinal: item.prefinal ?? "-",
        finalterm: item.finalterm ?? "-",
        subjectAverage: subjectAverage ? subjectAverage.toFixed(2) : "-",
      });

      // ✅ Add to semester totals
      grouped[key].totalUnits += units;
    });

    // ✅ Step 5: Compute average grade per semester
    Object.values(grouped).forEach((g) => {
      const totalGrades = g.subjects
        .map((s) => parseFloat(s.subjectAverage))
        .filter((v) => !isNaN(v) && v > 0);
      const total = totalGrades.reduce((a, b) => a + b, 0);
      g.average = totalGrades.length > 0 ? (total / totalGrades.length).toFixed(2) : "-";
    });

    // ✅ Step 6: Return response
    res.status(200).json({
      status: true,
      message: "Student grade evaluation retrieved successfully",
      data: {
        student: {
          id: student.id,
          name: `${student.last_name}, ${student.first_name} ${student.middle_name || ""}`.trim(),
          student_no: student.student_no,
          course: student.course,
          year_level: student.year_level,
          email: student.student_email,
        },
        evaluation: Object.values(grouped),
      },
    });
  } catch (err) {
    console.error("❌ Error fetching student grade evaluation:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getGradeForEverySchedule = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_grade")
      .select(`
        id,
        created_at,
        premid,
        midterm,
        prefinal,
        finalterm,
        studentEnrollment:studentEnrollment (
          id,
          current_course,
          current_year_level,
          students:students (
            id,
            student_no,
            first_name,
            middle_name,
            last_name
          )
        ),
        schedule:schedule (
          schedule_id,
          subject_code,
          desc_title,
          units,
          course,
          semester,
          school_year,
          time,
          day,
          room
        )
      `)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // ✅ Step 1: Format each grade record
    const formattedData = data.map((item) => {
      const student = item.studentEnrollment?.students;
      const schedule = item.schedule;

      return {
        id: item.id,
        student_id: student?.id || null,
        student_enrollment_id: item.studentEnrollment?.id || null,
        student_no: student?.student_no || "N/A",
        student_name: student
          ? `${student.first_name} ${
              student.middle_name ? student.middle_name + " " : ""
            }${student.last_name}`
          : "N/A",
        course: item.studentEnrollment?.current_course || "N/A",
        year_level: item.studentEnrollment?.current_year_level || "N/A",
        subject_code: schedule?.subject_code || "N/A",
        desc_title: schedule?.desc_title || "N/A",
        semester: schedule?.semester || "N/A",
        school_year: schedule?.school_year || "N/A",
        units: schedule?.units || null,
        premid: item.premid,
        midterm: item.midterm,
        prefinal: item.prefinal,
        finalterm: item.finalterm,
      };
    });

    // ✅ Step 2: Group by student_id
    const groupedData = formattedData.reduce((acc, grade) => {
      const studentId = grade.student_id;

      if (!acc[studentId]) {
        acc[studentId] = {
          student_id: grade.student_id,
          student_no: grade.student_no,
          student_name: grade.student_name,
          course: grade.course,
          year_level: grade.year_level,
          subjects: [],
        };
      }

      acc[studentId].subjects.push({
        subject_code: grade.subject_code,
        desc_title: grade.desc_title,
        semester: grade.semester,
        school_year: grade.school_year,
        units: grade.units,
        premid: grade.premid,
        midterm: grade.midterm,
        prefinal: grade.prefinal,
        finalterm: grade.finalterm,
      });

      return acc;
    }, {});

    // ✅ Step 3: Sort grouped results by name or year level
    const result = Object.values(groupedData).sort((a, b) =>
      a.student_name.localeCompare(b.student_name)
    );

    res.status(200).json({
      status: "success",
      message: "Fetched all student grades successfully (grouped by student)",
      data: result,
    });
  } catch (err) {
    console.error("❌ Error fetching student grades:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: [],
    });
  }
};


module.exports = {
  addStudentGrade,
  getStudentGrades,
  getStudentGradesBySchedule,
  updateStudentGrade,
  getStudentGradesByStudentId,
  getStudentGradeEvaluation,
  getGradeForEverySchedule
};
