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

const addStudent = async (req, res) => {
  const {
    student_no,
    lrn,
    date_enrolled,
    last_name,
    first_name,
    middle_name,
    extension_name,
    gender,
    date_of_birth,
    student_email,
    // Academic Information
    course,
    year_level,
    scholarship_status,
    // Guardian Information
    father_name,
    mother_name,
    guardian_contact,
    guardian_email,
    // Educational Background
    elementary_school,
    elementary_year_graduated,
    junior_high_school,
    junior_high_year_graduated,
    senior_high_school,
    senior_high_year_graduated,
    college_school,
    college_year_graduated,
    last_school_attended,
    last_school_year_attended
  } = req.body;

  // Required field validation
  if (!student_no || !last_name || !first_name || !gender || !date_of_birth || 
      !student_email || !course || !year_level || !guardian_contact) {
    return res.status(400).json({
      status: false,
      message: "Missing required fields: student_no, last_name, first_name, gender, date_of_birth, student_email, course, year_level, and guardian_contact are required.",
    });
  }

  // LRN validation (must be 12 digits if provided)
  if (lrn && (lrn.length !== 12 || !/^\d+$/.test(lrn))) {
    return res.status(400).json({
      status: false,
      message: "LRN must be a 12-digit number.",
    });
  }
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(student_email)) {
    return res.status(400).json({
      status: false,
      message: "Invalid student email format.",
    });
  }

  if (guardian_email && !emailRegex.test(guardian_email)) {
    return res.status(400).json({
      status: false,
      message: "Invalid guardian email format.",
    });
  }

  try {
    // Check if student already exists based on student number or email
    const { data: existing, error: checkError } = await supabase
      .from('students')
      .select('student_no, student_email')
      .or(`student_no.eq.${student_no},student_email.eq.${student_email}`)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existing) {
      if (existing.student_no === student_no) {
        return res.status(400).json({
          status: false,
          message: "Student with this student number already exists.",
        });
      }
      if (existing.student_email === student_email) {
        return res.status(400).json({
          status: false,
          message: "Student with this email already exists.",
        });
      }
    }

    // Check if LRN already exists (if provided)
    if (lrn) {
      const { data: existingLRN, error: lrnError } = await supabase
        .from('students')
        .select('lrn')
        .eq('lrn', lrn)
        .maybeSingle();

      if (lrnError) {
        throw lrnError;
      }

      if (existingLRN) {
        return res.status(400).json({
          status: false,
          message: "Student with this LRN already exists.",
        });
      }
    }

    // Insert the new student
    const { data, error } = await supabase
      .from('students')
      .insert([{
        student_no,
        lrn,
        date_enrolled,
        last_name,
        first_name,
        middle_name,
        extension_name,
        gender,
        date_of_birth,
        student_email,
        course,
        year_level,
        scholarship_status,
        father_name,
        mother_name,
        guardian_contact,
        guardian_email,
        elementary_school,
        elementary_year_graduated,
        junior_high_school,
        junior_high_year_graduated,
        senior_high_school,
        senior_high_year_graduated,
        college_school,
        college_year_graduated,
        last_school_attended,
        last_school_year_attended
      }])
      .select();

    if (error) {
      throw error;
    }

    if(data){
      const { data1, error1 } = await supabase
        .from("users")
        .insert([
          {
            username: student_email,
            password: student_no,
            usertype: 'student',
            userID: null,
            first_name,
            last_name,
            middle_name,
            studentID: data[0].id
          },
        ])
        .select("*"); // return inserted row

      if (error1) {
        return res.status(400).json({
          status: "error",
          message: error1.message,
        });
      }
      
      const receiverEmail = student_email
      const subject = 'Welcome to MIT Web-based Portal System - Your Account Details'
      let content = `Dear ${first_name } ${last_name},
                  We are excited to inform you that you have successfully registered for the MIT Web-based Portal System. You can now access your account and explore the features available to you.

                  Your login credentials are:

                  Username: ${student_email}
                  Password: ${student_no}

                  For your convenience, you will also receive SMS notifications for important updates and announcements related to your account.
                  We recommend that you change your password upon your first login to keep your account secure.
                  If you encounter any issues or have questions, please contact our support team at [Support Email/Contact Number].
                  Welcome aboard, and we hope you enjoy using MIT Web-base Portal!

                  Best regards,`
      const sentEmail = await sendEmail(receiverEmail, subject, content)
      console.log(sentEmail)

    }
    return res.status(201).json({
      status: true,
      message: "Student registered successfully!",
      students: data[0],
    });
  } catch (err) {
    console.error("❌ Error adding student:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
      students:[]
    });
  }
};

// Additional controller function to get all students
const getAllStudents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: true,
      message: "Students retrieved successfully!",
      students: data,
    });
  } catch (err) {
    console.error("❌ Error retrieving students:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

// Controller function to get a single student by ID
const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return res.status(404).json({
          status: false,
          message: "Student not found.",
        });
      }
      throw error;
    }

    return res.status(200).json({
      status: true,
      message: "Student retrieved successfully!",
      data: data,
    });
  } catch (err) {
    console.error("❌ Error retrieving student:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

// Controller function to update a student
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Check if student exists
    const { data: existing, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          status: false,
          message: "Student not found.",
        });
      }
      throw checkError;
    }

    // Perform the update
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: true,
      message: "Student updated successfully!",
      data: data[0],
    });
  } catch (err) {
    console.error("❌ Error updating student:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

// Controller function to delete a student
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if student exists
    const { data: existing, error: checkError } = await supabase
      .from('students')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          status: false,
          message: "Student not found.",
        });
      }
      throw checkError;
    }

    // Perform the deletion
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      status: true,
      message: "Student deleted successfully!",
    });
  } catch (err) {
    console.error("❌ Error deleting student:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};