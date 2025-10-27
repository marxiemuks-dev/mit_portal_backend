const supabase = require('../config/supabaseClient')
var jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
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

// utils/passwordGenerator.js
const generatePassword = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};


const loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log(username)

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required.", status: false });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found!", status: false });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password.", status: false});
    }

    const token = jwt.sign({ username: user.username  }, process.env.JWT_SECRET, { expiresIn: '3h' });

    res.cookie('authToken', token, {
      httpOnly: true,   
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful!",
      user: {
        user_id: user.id,
        username: user.username,
        role: user.usertype,
        added_date: user.created_at,
        usermainID: user.userID,
        userStudentID: user.studentID,
        instructor_name: user.first_name
        ? `${user.first_name} ${user.middle_name ? user.middle_name + " " : ""
          }${user.last_name}`
        : "N/A",
        profile_pic: user.profile_pic
      },
      status: true,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "An unexpected error occurred.", error: err.message });
  }
};

// GET /users
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false }); // latest first

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(200).json({
      status: true,
      message: "Users retrieved successfully",
      users: data,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
// POST /users
const addUser = async (req, res) => {
  try {
    const { username, password, usertype, userID,first_name,last_name,middle_name} = req.body;

    // Validation
    if (!username || !password || !usertype) {
      return res.status(400).json({
        status: "error",
        message: "Username, password and usertype are required",
      });
    }


    // Insert into Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username: username,
          password,
          usertype: usertype,
          userID: userID || null,
          first_name,
          last_name,
          middle_name

        },
      ])
      .select("*"); // return inserted row

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(201).json({
      status: true,
      message: "User created successfully",
      user: data[0],
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // user id from URL
    const { username, password, usertype, first_name, last_name, middle_name } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    // Build update object
    const updateData = {
      username,
      usertype,
      first_name,
      last_name,
      middle_name,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = password;
    }

    // Perform update
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("*"); // return updated row

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      user: data[0],
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};


// DELETE /users/:id
const removeUser = async (req, res) => {
  const { id } = req.params;
  const { error } = await deleteUser(id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};


const updateProfile = async (req, res) => {
  try {
    const { id } = req.params; // user id from URL
    const { username, password, usertype, first_name, last_name, middle_name } = req.body;

    const profilePicture = req.file ? `assets/${req.file.filename}` : null;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    // Build update object
    const updateData = {
      profile_pic : profilePicture
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = password;
    }

    // Perform update
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("*"); // return updated row

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      user: data[0],
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { username} = req.body;

    console.log(username)

    if (!username) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }
    const { data: user, error1 } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error1) {
      return res.status(500).json({ error: error.message });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found!", status: false });
    }

    const newPass = generatePassword(10)
    // Build update object
    const updateData = {
      password: newPass
    };

    // Perform update
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("username", username)
      .select("*"); // return updated row

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const receiverEmail1 = username;
    const subject = "Password Reset Code";
    const content = `Dear User, this is your temporary login password
                    ${newPass} .
                     You can changes it later when you are logged in.
                     
                    Sincerely,  
                    MIT Web-based Portal System`

    await sendEmail(receiverEmail1, subject, content);

    res.status(200).json({
      status: true,
      message: "User updated successfully! We have sent a temporary login password to your email.",
      user: data[0],
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  addUser,
  updateUser,
  removeUser,
  loginUser,
  getAllUsers,
  updateProfile,
  updateUserPassword,
};
