const supabase = require("../config/supabaseClient");

// Add schedule
const addSchedule = async (req, res) => {
  try {
    const {
      course,
      semester,
      schoolYear,
      subjectCode,
      descriptiveTitle,
      units,
      time,
      day,
      room,
      instructor
    } = req.body;

    // Validate
    if (!course || !semester || !schoolYear || !subjectCode || !descriptiveTitle) {
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing",
      });
    }
    const { data, error } = await supabase
      .from("schedule")
      .insert([
        {
          course,
          semester,
          school_year: schoolYear,
          subject_code: subjectCode,
          desc_title: descriptiveTitle,
          units,
          time,
          day,
          room,
          instructor
        },
      ])
      .select("*");

    if (error) throw error;

    res.status(201).json({
      status: "success",
      message: "Schedule added successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error adding schedule:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data:[]
    });
  }
};
// 📦 GET all schedules with instructor info
const getSchedules = async (req, res) => {
  try {
    // Join schedule with users table to include instructor details
    const { data, error } = await supabase
      .from("schedule")
      .select(`
        schedule_id,
        created_at,
        subject_code,
        desc_title,
        units,
        time,
        day,
        room,
        course,
        school_year,
        semester,
        instructor,
        instructor:users (
          id,
          first_name,
          middle_name,
          last_name
        )
      `);

    if (error) throw error;

    // ✅ Format the instructor name (optional)
    const formattedData = data.map((item) => ({
      ...item,
      instructor_name: item.instructor 
      ? `${item.instructor .first_name} ${item.instructor .middle_name ? item.instructor .middle_name + " " : ""
          }${item.instructor .last_name}`
        : "N/A",
    }));

    res.status(200).json({
      status: true,
      message: "Fetched schedules with instructor names",
      data: formattedData,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message,
      data:[],
    });
  }
};
const updateSchedule = async (req, res) => {
  try {
    const {
      id,
      course,
      semester,
      schoolYear,
      subjectCode,
      descriptiveTitle,
      units,
      time,
      day,
      room,
      instructor
    } = req.body;

    // Validate required fields
    if (!id || !course || !semester || !schoolYear || !subjectCode || !descriptiveTitle) {
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing",
      });
    }

    const { data, error } = await supabase
      .from("schedule")
      .update({
        course,
        semester,
        school_year: schoolYear,
        subject_code: subjectCode,
        desc_title: descriptiveTitle,
        units,
        time,
        day,
        room,
        instructor
      })
      .eq("schedule_id", id)
      .select("*");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Schedule not found",
        data: []
      });
    }

    res.status(200).json({
      status: "success",
      message: "Schedule updated successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error updating schedule:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: []
    });
  }
};
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params; // schedule_id from URL

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Schedule ID is required",
      });
    }

    const { data, error } = await supabase
      .from("schedule")
      .delete()
      .eq("schedule_id", id)
      .select("*");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Schedule not found",
        data: [],
      });
    }

    res.status(200).json({
      status: "success",
      message: "Schedule deleted successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error deleting schedule:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: [],
    });
  }
};

module.exports = { addSchedule, getSchedules, updateSchedule, deleteSchedule };
