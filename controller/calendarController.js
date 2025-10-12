const supabase = require("../config/supabaseClient");

/**
 * 🟢 Add new calendar event
 */
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

    // ✅ Validation
    if (!title || !event_type || !start_date || !semester || !school_year) {
      return res.status(400).json({
        status: "error",
        message: "Required fields are missing",
      });
    }

    // ✅ Insert event
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

    res.status(201).json({
      status: true,
      message: "Calendar event added successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error adding calendar event:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: [],
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
