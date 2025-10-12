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

module.exports = {
  addStudentGrade,
  getStudentGrades,
  getStudentGradesBySchedule,
  updateStudentGrade,
  getStudentGradesByStudentId
};
