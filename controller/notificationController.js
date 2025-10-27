const supabase = require("../config/supabaseClient");

/**
 * 🟢 Add a notification
 */
const addNotification = async (req, res) => {
  try {
    const { title, message, target_type, target_user_id, is_read } = req.body;

    // ✅ Validation
    if (!title || !message || !target_type) {
      return res.status(400).json({
        status: "error",
        message: "Required fields (title, message, target_type) are missing",
      });
    }

    const { data, error } = await supabase
      .from("notification")
      .insert([
        {
          title,
          message,
          target_type, // e.g. 'ALL', 'USER', 'FACULTY', 'STUDENT'
          target_user_id: target_user_id || null,
          is_read: is_read || false,
        },
      ])
      .select("*");

    if (error) throw error;

    res.status(201).json({
      status: "success",
      message: "Notification added successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error adding notification:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

/**
 * 📦 Get all notifications (optionally filtered by user)
 */
const getNotifications = async (req, res) => {
  try {
    const { user_id } = req.query;

    let query = supabase
      .from("notification")
      .select(
        `
        notification_id,
        title,
        message,
        target_type,
        target_user_id,
        is_read,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    // ✅ If user_id is provided → fetch user-specific + public notifications
    if (user_id) {
      query = query.or(`target_type.eq.ALL,target_user_id.eq.${user_id}`);
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
      message: "Fetched notifications successfully",
      data: formattedData,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * 🟡 Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Missing notification ID",
      });
    }

    const { data, error } = await supabase
      .from("notification")
      .update({ is_read: true })
      .eq("notification_id", id)
      .select("*");

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
      data: data[0],
    });
  } catch (err) {
    console.error("Error marking notification as read:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

/**
 * 🗑️ Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({
        status: "error",
        message: "Missing notification ID",
      });

    const { error } = await supabase
      .from("notification")
      .delete()
      .eq("notification_id", id);

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting notification:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
/**
 * ✏️ Update notification
 */
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params; // notification_id from URL
    const { title, message, target_type, target_user_id, is_read } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Missing notification ID",
      });
    }

    // ✅ Validation: at least one field should be provided
    if (!title && !message && !target_type && target_user_id === undefined && is_read === undefined) {
      return res.status(400).json({
        status: "error",
        message: "No fields provided to update",
      });
    }
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (target_type !== undefined) updateData.target_type = target_type;
    if (target_user_id !== undefined) updateData.target_user_id = target_user_id;
    if (is_read !== undefined) updateData.is_read = is_read;

    const { data, error } = await supabase
      .from("notification")
      .update({
          title,
          message,
          target_type, // e.g. 'ALL', 'USER', 'FACULTY', 'STUDENT'
          target_user_id: target_user_id || null,
          is_read: is_read || false,
      })
      .eq("notification_id", id)
      .select("*");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Notification updated successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error updating notification:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
  updateNotification,
};
