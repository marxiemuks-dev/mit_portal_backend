const { supabase } = require('../config/supabaseClient'); // adjust the path if needed

checkDuplicateUsername = async (req, res, next) => {
  try {
    const username = req.body.username;

    if (!username) {
      return res.status(400).send({
        message: "Username cannot be null or empty!",
        status: false,
      });
    }

    // Supabase query to check if username exists
    const { data, error } = await supabase
      .from('users') // 👈 change to your actual table name
      .select('username')
      .eq('username', username)
      .maybeSingle(); // returns single or null

    if (error) {
      console.error("Error querying Supabase:", error);
      return res.status(500).send({
        message: "Error querying the database.",
        error: error.message,
        status: false,
      });
    }

    if (data) {
      return res.status(400).send({
        message: "Registration failed, username is already in use!",
        status: false,
      });
    }

    // Proceed to the next middleware or controller
    next();
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).send({
      message: "An unexpected error occurred.",
      error: err.message,
      status: false,
    });
  }
};

const verifySignUp = {
    checkDuplicateUsername
}


module.exports = verifySignUp;
