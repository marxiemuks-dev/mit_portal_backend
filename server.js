require('dotenv').config();
const express = require('express');
const supabase = require('./config/supabaseClient');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

const corsOptions = {
    origin: ["http://127.0.0.1:3000", "http://192.168.1.171:3000", "http://localhost:3000",
        "https://yis-test.onrender.com"
    ], // List of allowed origins
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

require("./routes/userRoutes")(app);
require("./routes/studentRoutes")(app);
require("./routes/subjectOfferingRoutes")(app);
require("./routes/enrollmentRoutes")(app);
require("./routes/facultyRoutes")(app);
require("./routes/scheduleRoutes")(app);
require("./routes/studentGradeRoutes")(app);
require("./routes/billingRoutes")(app);
require("./routes/calendarRoutes")(app);
require("./routes/notificationRoutes")(app);
require("./routes/announcementRoutes")(app);

// ✅ Check Supabase connection
const checkDatabaseConnection = async () => {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error('❌ Failed to connect to Supabase:', error.message);
        return;
    } else {
        console.log('✅ Connected to Supabase database');
        return;
    }
};

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await checkDatabaseConnection();
    return;
});
