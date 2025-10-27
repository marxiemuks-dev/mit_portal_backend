const supabase = require('../config/supabaseClient')
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'mitportalsystem@gmail.com', // Use environment variables for sensitive data
      pass: 'roln chmn dyju mncm',
    },
  });
  // Utility function to send email
  const sendEmail = async (to, subject, text) => {
    const mailOptions = {
      from: 'mitportalsystem@gmail.com',
      to,
      subject,
      text,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      return true

    } catch (error) {
      console.error('Error sending email:', error.message);
      return false
    }
  };


// enrollStudent.js (API/controller)
const enrollStudent = async (req, res) => {
  try {
    const { 
      studentID,
      currentCourse,
      currentYearLevel,
      currentSemester,
      currentSchoolYear,
      enrollmentStatus,
      guardianEmail,
      studentEmail
    } = req.body

    console.log(guardianEmail)
    // Validation
    if (!studentID || !currentCourse || !currentYearLevel || !currentSemester || !currentSchoolYear || !enrollmentStatus || !guardianEmail) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      })
    }

    // Insert into Supabase
    const { data, error } = await supabase.from("studentEnrollment")
      .insert([
        {
          student_id: studentID,
          current_course: currentCourse,
          current_year_level: currentYearLevel,
          current_semester: currentSemester,
          current_school_year: currentSchoolYear,
          enrollment_status: enrollmentStatus,
        },
      ])
      .select("*") // return inserted row

      console.log(studentID)
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      })
    }

    const receiverEmail = guardianEmail
    const subject = 'Enrollment Confirmation'

    if(enrollmentStatus == 'Offically Enrolled'){
      const content = `Dear Parent/Guardian,

                    We are pleased to inform you that your child has been successfully enrolled for the upcoming school year.

                    Enrollment Details:
                    - Course/Year Level: ${currentCourse} / ${currentYearLevel}
                    - Semester: ${currentSemester}
                    - School Year: ${currentSchoolYear}

                    Thank you for completing the enrollment process. We look forward to supporting your child’s academic journey.

                    If you have any questions or require further assistance, please don’t hesitate to contact our office.

                    Sincerely,
                    MIT Web-based Portal System`;
        const sentEmail = await sendEmail(receiverEmail, subject, content)
        console.log(sentEmail)
    }else{
      const content1 = `Dear Parent/Guardian,

                    We would like to inform you that your child has been temporarily marked as UNOFFICIALLY ENROLLED for the upcoming school year. This status means that some enrollment requirements are still pending or need to be verified.

                    Enrollment Details:
                    - Course/Year Level: ${currentCourse} / ${currentYearLevel}
                    - Semester: ${currentSemester}
                    - School Year: ${currentSchoolYear}

                    Please ensure that all necessary documents and requirements are submitted at the Registrar’s Office to complete the enrollment process. Once completed, your child’s status will be updated to OFFICIALLY ENROLLED.

                    If you have any questions or require further assistance, please don’t hesitate to contact our office.

                    Sincerely,
                    MIT Web-based Portal System`;
        const sentEmail = await sendEmail(receiverEmail, subject, content1)
        console.log(sentEmail)
    }

    res.status(201).json({
      status: true,
      message: "Student enrolled successfully",
      enrollment: data[0],
    })

    
  } catch (err) {
    console.error("Error enrolling student:", err)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

// Fetch all enrollments
const getAllEnrollments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("studentEnrollment")
      .select(`
        id,
        current_course,
        current_year_level,
        current_semester,
        current_school_year,
        enrollment_status,
        created_at,
        students (
          id,
          student_no,
          first_name,
          last_name,
          middle_name,
          guardian_email
        )
      `)
      .order("created_at", { ascending: false })
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
        enrollments:[]
      })
    }

    res.status(200).json({
      status: true,
      message: "Enrollments fetched successfully",
      enrollments: data,
    })
  } catch (err) {
    console.error("Error fetching enrollments:", err)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

const updateEnrollment = async (req, res) => {
  try {
    console.log('Calledd')
    const { 
      enrollmentID,
      currentCourse,
      currentYearLevel,
      currentSemester,
      currentSchoolYear,
      enrollmentStatus,
      guardianEmail,
      studentEmail
    } = req.body;

    // Validation
    if (!enrollmentID || !currentCourse || !currentYearLevel || !currentSemester || !currentSchoolYear || !enrollmentStatus || !guardianEmail) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from("studentEnrollment")
      .update({
        current_course: currentCourse,
        current_year_level: currentYearLevel,
        current_semester: currentSemester,
        current_school_year: currentSchoolYear,
        enrollment_status: enrollmentStatus,
      })
      .eq("id", enrollmentID)
      .select("*"); // return updated row

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    const receiverEmail = guardianEmail;
    const subject = "Enrollment Update Notification";

    if (enrollmentStatus === "Officially Enrolled") {
      const content = `Dear Parent/Guardian,

                      We are pleased to inform you that your child's enrollment status has been UPDATED to OFFICIALLY ENROLLED for the upcoming school year.

                      Enrollment Details:
                      - Course/Year Level: ${currentCourse} / ${currentYearLevel}
                      - Semester: ${currentSemester}
                      - School Year: ${currentSchoolYear}

                      Thank you for completing the enrollment process. We look forward to supporting your child’s academic journey.

                      If you have any questions or require further assistance, please don’t hesitate to contact our office.

                      Sincerely,  
                      MIT Web-based Portal System`;

      await sendEmail(receiverEmail, subject, content);
    } else {
      const content1 = `Dear Parent/Guardian,

                        We would like to inform you that your child's enrollment status has been UPDATED to UNOFFICIALLY ENROLLED for the upcoming school year. This status means that some enrollment requirements are still pending or need to be verified.

                        Enrollment Details:
                        - Course/Year Level: ${currentCourse} / ${currentYearLevel}
                        - Semester: ${currentSemester}
                        - School Year: ${currentSchoolYear}

                        Please ensure that all necessary documents and requirements are submitted at the Registrar’s Office to complete the enrollment process. Once completed, your child’s status will be updated to OFFICIALLY ENROLLED.

                        If you have any questions or require further assistance, please don’t hesitate to contact our office.

                        Sincerely,  
                        MIT Web-based Portal System`;

      await sendEmail(receiverEmail, subject, content1);
    }

    res.status(200).json({
      status: true,
      message: "Enrollment updated successfully",
      enrollment: data[0],
    });
  } catch (err) {
    console.error("Error updating enrollment:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getEnrollmentsBySemesterAndYear = async (req, res) => {
  try {
    const { semester, schoolYear } = req.query; // or use req.params if you prefer

    // ✅ Validate inputs
    if (!semester || !schoolYear) {
      return res.status(400).json({
        status: "error",
        message: "Semester and School Year are required.",
        enrollments: [],
      });
    }

    // 📡 Fetch from Supabase with filters
    const { data, error } = await supabase
      .from("studentEnrollment")
      .select(`
        id,
        current_course,
        current_year_level,
        current_semester,
        current_school_year,
        enrollment_status,
        created_at,
        students (
          id,
          student_no,
          first_name,
          last_name,
          middle_name,
          guardian_email
        )
      `)
      .eq("current_semester", semester)
      .eq("current_school_year", schoolYear)
      .order("created_at", { ascending: false });

    // ❌ Handle DB errors
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
        enrollments: [],
      });
    }

    // ✅ Success
    res.status(200).json({
      status: true,
      message: "Enrollments fetched successfully",
      enrollments: data,
    });
  } catch (err) {
    console.error("❌ Error fetching enrollments:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      enrollments: [],
    });
  }
};

const getEnrollmentById = async (req, res) => {
  try {
    const { student_id } = req.params; // Get student ID from URL parameter

    if (!student_id) {
      return res.status(400).json({
        status: "error",
        message: "Student ID is required",
      });
    }

    const { data, error } = await supabase
      .from("studentEnrollment")
      .select(`
        id,
        current_course,
        current_year_level,
        current_semester,
        current_school_year,
        enrollment_status,
        created_at,
        students (
          id,
          student_no,
          first_name,
          last_name,
          middle_name,
          guardian_email
        )
      `)
      .eq("student_id", student_id)     // Filter by student ID
      .order("created_at", { ascending: false }) // Latest first

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
        enrollment: null,
      });
    }

    res.status(200).json({
      status: true,
      message: "Latest enrollment fetched successfully",
      enrollment: data,
    });
  } catch (err) {
    console.error("Error fetching latest enrollment:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }

};
const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params; // enrollment ID from URL parameter

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Enrollment ID is required",
      });
    }

    const { data, error } = await supabase
      .from("studentEnrollment")
      .delete()
      .eq("id", id)
      .select("*");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Enrollment not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Enrollment deleted successfully",
      deletedEnrollment: data[0],
    });
  } catch (err) {
    console.error("Error deleting enrollment:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  enrollStudent,
  getAllEnrollments,
  updateEnrollment,
  getEnrollmentsBySemesterAndYear,
  getEnrollmentById,
  deleteEnrollment
}
