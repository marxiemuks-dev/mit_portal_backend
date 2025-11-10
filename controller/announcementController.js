const supabase = require("../config/supabaseClient");

/**
 * 🟢 Add an announcement
 */
// const addAnnouncement = async (req, res) => {
//   try {
//     const { title, description, isRead, targetUser, visibility,category, image } = req.body;

//     if (!title || !description) {
//       return res.status(400).json({
//         status: "error",
//         message: "Required fields (title, description) are missing",
//       });
//     }

//     const { data, error } = await supabase
//       .from("announcement")
//       .insert([
//         {
//           title,
//           description,
//           isRead: isRead || false,
//           targetUser: targetUser || null,
//           visibility: visibility || "ALL",
//           type: category,
//           photo_url: image || null
//         },
//       ])
//       .select("*");

//     if (error) throw error;

//     res.status(201).json({
//       status: "success",
//       message: "Announcement added successfully",
//       data: data[0],
//     });
//   } catch (err) {
//     console.error("Error adding announcement:", err.message);
//     res.status(500).json({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   }
// };
const addAnnouncement = async (req, res) => {
  try {
    const { title, description, isRead, targetUser, visibility, category } = req.body;
    const file = req.file; // Image uploaded via multer

    // ✅ Validation
    if (!title || !description) {
      return res.status(400).json({
        status: "error",
        message: "Required fields (title, description) are missing",
      });
    }

    // ✅ Get image URL (from local storage path)
    let imageUrl = null;
    if (file) {
      // Assuming "public" is your static root (e.g., app.use('/public', express.static('public')))
      imageUrl = `assets/${file.filename}`;
    }

    // ✅ Insert record into database
    const { data, error } = await supabase
      .from("announcement")
      .insert([
        {
          title,
          description,
          isRead: isRead || false,
          targetUser: targetUser || null,
          visibility: visibility || "ALL",
          type: category || "Announcement", // e.g., "Announcement" or "Activity"
          photo_url: imageUrl,
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
      details: err.message,
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
        photo_url,
        type,
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
    const { title, description, isRead, targetUser, visibility,category } = req.body;
    const file = req.file; // Image uploaded via multer
    
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Missing announcement ID",
      });
    }

    let imageUrl = null;
    if (file) {
      // Assuming "public" is your static root (e.g., app.use('/public', express.static('public')))
      imageUrl = `assets/${file.filename}`;
    }

    const { data, error } = await supabase
      .from("announcement")
      .update({
          title,
          description,
          isRead: isRead || false,
          targetUser: targetUser || null,
          visibility: visibility || "ALL", // e.g. ALL, ADMIN, FACULTY, STUDENT
          type: category || "Announcement", // e.g., "Announcement" or "Activity"
          photo_url: imageUrl,
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
