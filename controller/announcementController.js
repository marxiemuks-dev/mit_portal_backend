const supabase = require("../config/supabaseClient");

/**
 * 🟢 Add an announcement
 */
const addAnnouncement = async (req, res) => {
  try {
    const { title, description, isRead, targetUser, visibility } = req.body;

    // ✅ Validation
    if (!title || !description) {
      return res.status(400).json({
        status: "error",
        message: "Required fields (title, description) are missing",
      });
    }

    const { data, error } = await supabase
      .from("announcement")
      .insert([
        {
          title,
          description,
          isRead: isRead || false,
          targetUser: targetUser || null,
          visibility: visibility || "ALL", // e.g. ALL, ADMIN, FACULTY, STUDENT
        },
      ])
      .select("*");

    if (error) throw error;

    res.status(201).json({
      status: "success",
      message: "Announcement added successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error adding announcement:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

/**
 * 📦 Get all announcements (optionally filtered by target user)
 */
const getAnnouncements = async (req, res) => {
  try {
    const { user_id } = req.query;

    let query = supabase
      .from("announcement")
      .select(
        `
        id,
        title,
        description,
        isRead,
        targetUser,
        visibility,
        created_at,
        users (
          id,
          first_name,
          middle_name,
          last_name
        )
      `
      )
      .order("created_at", { ascending: false });

    // ✅ If user_id provided → fetch announcements visible to that user or public ones
    if (user_id) {
      query = query.or(`visibility.eq.ALL,targetUser.eq.${user_id}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formattedData = data.map((item) => ({
      ...item,
      user_name: item.users
        ? `${item.users.first_name} ${
            item.users.middle_name ? item.users.middle_name + " " : ""
          }${item.users.last_name}`
        : null,
    }));

    res.status(200).json({
      status: true,
      message: "Fetched announcements successfully",
      data: formattedData,
    });
  } catch (err) {
    console.error("Error fetching announcements:", err.message);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * 🟡 Mark announcement as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Missing announcement ID",
      });
    }

    const { data, error } = await supabase
      .from("announcement")
      .update({ isRead: "true" })
      .eq("id", id)
      .select("*");

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Announcement marked as read",
      data: data[0],
    });
  } catch (err) {
    console.error("Error marking announcement as read:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

/**
 * 🗑️ Delete announcement
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({
        status: "error",
        message: "Missing announcement ID",
      });

    const { error } = await supabase.from("announcement").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Announcement deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting announcement:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

/**
 * ✏️ Update announcement
 */
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isRead, targetUser, visibility } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Missing announcement ID",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isRead !== undefined) updateData.isRead = isRead;
    if (targetUser !== undefined) updateData.targetUser = targetUser;
    if (visibility !== undefined) updateData.visibility = visibility;

    const { data, error } = await supabase
      .from("announcement")
      .update({
          title,
          description,
          isRead: isRead || false,
          targetUser: targetUser || null,
          visibility: visibility || "ALL", // e.g. ALL, ADMIN, FACULTY, STUDENT
      })
      .eq("id", id)
      .select("*");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Announcement updated successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error updating announcement:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addAnnouncement,
  getAnnouncements,
  markAsRead,
  deleteAnnouncement,
  updateAnnouncement,
};
