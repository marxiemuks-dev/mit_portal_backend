const supabase = require("../config/supabaseClient");
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
/**
 * 🟢 Add new calendar event
 */
// const addCalendarEvent = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       event_type,
//       start_date,
//       end_date,
//       semester,
//       school_year,
//       status,
//       visibility,
//       created_by,
//     } = req.body;

//     // ✅ Validation
//     if (!title || !event_type || !start_date || !semester || !school_year) {
//       return res.status(400).json({
//         status: "error",
//         message: "Required fields are missing",
//       });
//     }

//     // ✅ Insert event
//     const { data, error } = await supabase
//       .from("school_calendar")
//       .insert([
//         {
//           title,
//           description,
//           event_type,
//           start_date,
//           end_date,
//           semester,
//           school_year,
//           status,
//           visibility,
//           created_by,
//         },
//       ])
//       .select("*");

//     if (error) throw error;

//     res.status(201).json({
//       status: true,
//       message: "Calendar event added successfully",
//       data: data[0],
//     });
//   } catch (err) {
//     console.error("Error adding calendar event:", err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//       data: [],
//     });
//   }
// };
// const addCalendarEvent = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       event_type,
//       start_date,
//       end_date,
//       semester,
//       school_year,
//       status,
//       visibility,
//       created_by,
//     } = req.body;

//     // ✅ Validate required fields
//     if (!title || !event_type || !start_date || !semester || !school_year) {
//       return res.status(400).json({
//         status: "error",
//         message: "Required fields are missing",
//       });
//     }

//     // ✅ Insert the event
//     const { data, error } = await supabase
//       .from("school_calendar")
//       .insert([
//         {
//           title,
//           description,
//           event_type,
//           start_date,
//           end_date,
//           semester,
//           school_year,
//           status,
//           visibility,
//           created_by,
//         },
//       ])
//       .select("*");

//     if (error) throw error;
//     const event = data[0];

//     // ✅ If visibility is Public or Student → send emails
//     if (visibility === "Public" || visibility === "Student") {
//       const { data: students, error: studentError } = await supabase
//         .from("students")
//         .select("student_email, first_name, last_name")
//         .order("created_at", { ascending: false });

//       if (studentError) throw studentError;

//       if (students && students.length > 0) {
//         console.log(`📢 Sending event email to ${students.length} students...`);

//         const subject = `New School Event: ${title}`;
//         const message = `
//         Dear Student,

//         You are updated for a new school event!

//         📅 Event: ${title}
//         📝 Description: ${description || "No description provided."}
//         📚 Type: ${event_type}
//         📆 Date: ${start_date} ${end_date ? ` - ${end_date}` : ""}
//         🎓 School Year: ${school_year}
//         🏫 Semester: ${semester}

//         Thank you,
//         MIT Portal System
//         `;

//         // Send emails asynchronously (one by one)
//         for (const student of students) {
//           if (student.student_email) {
//             await sendEmail(student.student_email, subject, message);
//           }
//         }
//       }
//     }

//     res.status(201).json({
//       status: true,
//       message: "Calendar event added successfully",
//       data: event,
//     });
//   } catch (err) {
//     console.error("❌ Error adding calendar event:", err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// };
const addCalendarEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      event_type,
      start_date,
      end_date,
      semester,
      school_year,
      status,
      visibility,
      created_by,
    } = req.body;

    // ✅ Validate required fields
    if (!title || !event_type || !start_date || !semester || !school_year) {
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing",
      });
    }

    // ✅ Insert the event
    const { data, error } = await supabase
      .from("school_calendar")
      .insert([
        {
          title,
          description,
          event_type,
          start_date,
          end_date,
          semester,
          school_year,
          status,
          visibility,
          created_by,
        },
      ])
      .select("*");

    if (error) throw error;
    const event = data[0];

    // ✅ Email to all students if visibility is "Public" or "Student"
    if (visibility === "Public" || visibility === "Student") {
      const { data: students, error: studentError } = await supabase
        .from("students")
        .select("student_email, first_name, last_name")
        .order("created_at", { ascending: false });

      if (studentError) throw studentError;

      if (students && students.length > 0) {
        console.log(`📢 Sending event email to ${students.length} students...`);

        const subject = `New School Event: ${title}`;
        const message = `
Dear Student,

You are updated for a new school event!

📅 Event: ${title}
📝 Description: ${description || "No description provided."}
📚 Type: ${event_type}
📆 Date: ${start_date}${end_date ? ` - ${end_date}` : ""}
🎓 School Year: ${school_year}
🏫 Semester: ${semester}

Thank you,
MIT Portal System
`;

        // Send emails asynchronously (in sequence)
        for (const student of students) {
          if (student.student_email) {
            await sendEmail(student.student_email, subject, message);
          }
        }
      }
    }

    // ✅ Insert notification if visibility is Public / Faculty / Admin Only
    if (["Public", "Faculty", "Admin Only"].includes(visibility)) {
      const message = `New calendar event: ${title} - ${event_type}`;
      const target_type =
        visibility === "Public"
          ? "ALL"
          : visibility === "Faculty"
          ? "FACULTY"
          : "ADMIN";

      const { data: notifData, error: notifError } = await supabase
        .from("notification")
        .insert([
          {
            title,
            message,
            target_type, // 'ALL', 'FACULTY', 'ADMIN'
            target_user_id: null,
            is_read: false,
          },
        ])
        .select("*");

      if (notifError) throw notifError;
      console.log("🔔 Notification added:", notifData);
    }

    res.status(201).json({
      status: true,
      message: "Calendar event added successfully",
      data: event,
    });
  } catch (err) {
    console.error("❌ Error adding calendar event:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};


/**
 * 📦 Get all calendar events with creator info
 */
const getCalendarEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("school_calendar")
      .select(`
        school_calendar_id,
        title,
        description,
        event_type,
        start_date,
        end_date,
        semester,
        school_year,
        status,
        visibility,
        created_at,
        created_by,
        users (
          id,
          first_name,
          middle_name,
          last_name
        )
      `)
      .order("start_date", { ascending: true });

    if (error) throw error;

    const formattedData = data.map((item) => ({
      ...item,
      created_by_name: item.users
        ? `${item.users.first_name} ${
            item.users.middle_name ? item.users.middle_name + " " : ""
          }${item.users.last_name}`
        : "Unknown",
    }));

    res.status(200).json({
      status: true,
      message: "Fetched calendar events successfully",
      data: formattedData,
    });
  } catch (err) {
    console.error("Error fetching calendar events:", err.message);
    res.status(500).json({
      status: false,
      message: err.message,
      data: [],
    });
  }
};

/**
 * 🟡 Update calendar event
 */
const updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      event_type,
      start_date,
      end_date,
      semester,
      school_year,
      status,
      visibility,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Missing event ID",
      });
    }

    // ✅ Update the record
    const { data, error } = await supabase
      .from("school_calendar")
      .update({
        title,
        description,
        event_type,
        start_date,
        end_date,
        semester,
        school_year,
        status,
        visibility,
      })
      .eq("school_calendar_id", id)
      .select("*");

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Calendar event not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Calendar event updated successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error updating calendar event:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

/**
 * 🗑️ Delete calendar event
 */
const deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({
        status: "error",
        message: "Missing event ID",
      });

    const { error } = await supabase
      .from("school_calendar")
      .delete()
      .eq("school_calendar_id", id);

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Calendar event deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting calendar event:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
};
