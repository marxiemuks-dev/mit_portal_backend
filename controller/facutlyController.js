const supabase = require('../config/supabaseClient')
// Get all faculty
const getAllFaculty = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, middle_name, username, usertype")
      .eq("usertype", "faculty");

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(200).json({
      status: "success",
      message:"Success",
      data,
    });
  } catch (err) {
    console.error("Error fetching faculty:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
    getAllFaculty
};