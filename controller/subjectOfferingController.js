const supabase = require('../config/supabaseClient')
// Fetch all subject offerings
const getAllSubjectOfferings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("subject_offering")
      .select(`
        id,
        semester,
        school_year,
        teacher,
        schedule,
        room,
        slots,
        created_at,
        subject_code,
        subject_name,
        units
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(200).json({
      status: true,
      message: "Subject offerings fetched successfully",
      subject_offerings: data,
    });
  } catch (err) {
    console.error("Error fetching subject offerings:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
// Add new subject offering
const addSubjectOffering = async (req, res) => {
  try {
    const {
      subject_code,
      subject_name,
      units,
      semester,
      school_year,
      teacher,
      schedule,
      room,
      slots,
    } = req.body;

    // ✅ Validation
    if (
      !subject_code ||
      !subject_name ||
      !units ||
      !semester ||
      !school_year ||
      !slots
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please fill in all required fields.",
      });
    }

    // ✅ Insert into subject_offering table
    const { data, error } = await supabase
      .from("subject_offering")
      .insert([
        {
          subject_code,
          subject_name,
          units,
          semester,
          school_year,
          teacher,
          schedule,
          room,
          slots,
        },
      ])
      .select(); // return inserted row

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(201).json({
      status: true,
      message: "Subject offering added successfully",
      offering: data[0],
    });
  } catch (err) {
    console.error("Error adding subject offering:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
    getAllSubjectOfferings,
    addSubjectOffering
}