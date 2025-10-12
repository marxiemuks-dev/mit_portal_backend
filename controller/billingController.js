const supabase = require("../config/supabaseClient");
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
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
// 💰 Get all billing records with related student & payment details
const getAllBillings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("billing")
      .select(`
        billing_id,
        student_id,
        total_misc,
        previouse_balance,
        subsidized_by_school,
        total_bill,
        current_bill,
        full_payment,
        created_at,
        semester,
        school_year,
        studentEnrollment:studentEnrollment (
          id,
          current_course,
          current_year_level,
          students:students (
            id,
            student_no,
            first_name,
            middle_name,
            last_name
          )
        ),
        studentID,
        students:students (
            id,
            student_no,
            first_name,
            middle_name,
            last_name,
            course
        ),
        payment:payment (
          payment_id,
          payment_date,
          amount_paid,
          reference_no
        )
      `)
      .order("created_at", { ascending: false });

    if (error)
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    // Format data
    const formatted = data.map((item) => ({
      billing_id: item.billing_id,
      student_id: item.student_id,
      students: item.students,
      studentID: item.studentID,
      student_name: item.studentEnrollment?.students
        ? `${item.studentEnrollment.students.last_name}, ${item.studentEnrollment.students.first_name} ${
            item.studentEnrollment.students.middle_name || ""
          }`
        : "N/A",
      student_no: item.studentEnrollment?.students?.student_no || "N/A",
      course: item.studentEnrollment?.current_course || "N/A",
      year_level: item.studentEnrollment?.current_year_level || "N/A",
      school_year: item.school_year || "N/A",
      semester: item.semester || "N/A",
      total_misc: item.total_misc,
      previouse_balance: item.previouse_balance,
      subsidized_by_school: item.subsidized_by_school,
      total_bill: item.total_bill,
      full_payment: item.full_payment,
      current_bill: item.current_bill,
      payments: item.payment || [],
      created_at: item.created_at,
    }));

    res.status(200).json({
      status: true,
      message: "Billings fetched successfully",
      data: formatted,
    });
  } catch (err) {
    console.error("❌ Error fetching billings:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// 🧾 Get billing by student ID (with payments)
const getBillingByStudentId = async (req, res) => {
  try {
    const { student_id } = req.params;

    const { data, error } = await supabase
      .from("billing")
      .select(`
        billing_id,
        student_id,
        total_misc,
        previouse_balance,
        subsidized_by_school,
        total_bill,
        full_payment,
        created_at,
        payment:payment (
          payment_id,
          payment_date,
          amount_paid,
          reference_no
        ),
        studentEnrollment:studentEnrollment (
          id,
          current_course,
          current_year_level,
          students:students (
            id,
            student_no,
            first_name,
            middle_name,
            last_name
          )
        )
      `)
      .eq("student_id", student_id)
      .order("created_at", { ascending: false });

    if (error)
      return res.status(400).json({
        status: "error",
        message: error.message,
      });

    if (!data || data.length === 0)
      return res.status(404).json({
        status: false,
        message: "No billing records found for this student",
      });

    res.status(200).json({
      status: true,
      message: "Billing records fetched successfully",
      data,
    });
  } catch (err) {
    console.error("❌ Error fetching billing by student ID:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// 💳 Get all payments
const getAllPayments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("payment")
      .select(`
        payment_id,
        billing_id,
        payment_date,
        amount_paid,
        reference_no,
        created_at,
        billing:billing (
          billing_id,
          student_id,
          total_bill,
          full_payment
        )
      `)
      .order("payment_date", { ascending: false });

    if (error)
      return res.status(400).json({
        status: "error",
        message: error.message,
      });

    res.status(200).json({
      status: true,
      message: "Payments fetched successfully",
      data,
    });
  } catch (err) {
    console.error("❌ Error fetching payments:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
// 🧾 Add a new billing record
const addBilling = async (req, res) => {
  try {
    const {
      student_id,
      total_misc,
      previouse_balance,
      subsidized_by_school,
      full_payment,
      semester,
      school_year
    } = req.body;

    // Validate required field
    if (!student_id || total_misc === undefined) {
      return res.status(400).json({
        status: "error",
        message: "student_id and full_payment are required.",
      });
    }

    // Insert billing record
    const { data, error } = await supabase
      .from("billing")
      .insert([
        {
          studentID: student_id,
          total_misc,
          previouse_balance,
          subsidized_by_school,
          full_payment,
          semester,
          school_year,
          current_bill: full_payment
        },
      ])
      .select(`
        *,
        students (
          student_email,
          guardian_email,
          last_name,
          first_name
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
    console.log(data)

    const receiverEmail = data.students.student_email;
    const receiverEmail1 = data.students.guardian_email;
    const name = `${data.students.first_name} ${data.students.last_name}`
    const subject = "Billing Notification";
    const content = `Dear Parent/Guardian,

        We would like to inform you about the billing details for your child for the current semester and school year.

        Billing Details:
        - Name: ${name}
        - Semester: ${semester}
        - School Year: ${school_year}
        - Total Miscellaneous Fees: ₱${total_misc.toFixed(2)}
        - Subsidized by School: ₱${subsidized_by_school.toFixed(2)}
        - Total Bill: ₱${full_payment.toFixed(2)}
        - Current Balance: ₱${full_payment.toFixed(2)}

        Please ensure that any remaining balance is settled promptly to avoid any disruption to your child’s enrollment.

        If you have any questions regarding this billing statement or require further assistance, do not hesitate to contact our office.

        Thank you for your prompt attention and cooperation.

        Sincerely,  
        MIT Web-based Portal System`;


    await sendEmail(receiverEmail, subject, content);
    res.status(201).json({
      status: true,
      message: "Billing record added successfully.",
      billing: data,
    });
  } catch (err) {
    console.error("Error adding billing record:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
// 💰 Add a new payment record and update the billing record
const addPayment = async (req, res) => {
  try {
    const { billing_id, payment_date, amount_paid, reference_no } = req.body;

    // 🧩 Validate required fields
    if (!billing_id || amount_paid === undefined) {
      return res.status(400).json({
        status: false,
        message: "billing_id and amount_paid are required.",
      });
    }

    // 1️⃣ Insert the new payment record
    const { data: newPayment, error: insertError } = await supabase
      .from("payment")
      .insert([
        {
          billing_id,
          payment_date: payment_date || new Date().toISOString().split("T")[0],
          amount_paid,
          reference_no,
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 2️⃣ Fetch total payments made for this billing_id
    const { data: payments, error: selectError } = await supabase
      .from("payment")
      .select("amount_paid")
      .eq("billing_id", billing_id);

    if (selectError) {
      throw selectError;
    }

    const totalPaid = payments.reduce(
      (sum, p) => sum + (p.amount_paid || 0),
      0
    );

    // 3️⃣ Get current total_bill from billing
    const { data: billingData, error: billingError } = await supabase
      .from("billing")
      .select("full_payment")
      .eq("billing_id", billing_id)
      .single();

    if (billingError) {
      throw billingError;
    }

    const totalBill = billingData.full_payment || 0;
    const remaining = Math.max(totalBill - totalPaid, 0); // avoid negative balance

    // 4️⃣ Update billing with new full_payment & current_bill
    const { error: updateError } = await supabase
      .from("billing")
      .update({
        total_payment: totalPaid,
        current_bill: remaining,
      })
      .eq("billing_id", billing_id);

    if (updateError) {
      throw updateError;
    }

    // 5️⃣ Return success response
    return res.status(201).json({
      status: true,
      message: "Payment added successfully and billing updated.",
      payment: newPayment,
      updated_billing: {
        billing_id,
        total_bill: totalBill,
        full_payment: totalPaid,
        current_bill: remaining,
      },
    });
  } catch (err) {
    console.error("Error adding payment record:", err);
    res.status(500).json({
      status: false,
      message: "Internal server error: " + err.message,
    });
  }
};
const updateBilling = async (req, res) => {
  try {
    const { billing_id } = req.params; // billing_id from URL parameter
    const {
      total_misc,
      previouse_balance,
      subsidized_by_school,
      full_payment,
      semester,
      school_year,
      current_bill,
    } = req.body;

    // Validate billing_id
    if (!billing_id) {
      return res.status(400).json({
        status: "error",
        message: "billing_id is required.",
      });
    }

    // Prepare fields to update
    const fieldsToUpdate = {};
    if (total_misc !== undefined) fieldsToUpdate.total_misc = total_misc;
    if (previouse_balance !== undefined)
      fieldsToUpdate.previouse_balance = previouse_balance;
    if (subsidized_by_school !== undefined)
      fieldsToUpdate.subsidized_by_school = subsidized_by_school;
    if (full_payment !== undefined) fieldsToUpdate.full_payment = full_payment;
    if (semester !== undefined) fieldsToUpdate.semester = semester;
    if (school_year !== undefined) fieldsToUpdate.school_year = school_year;
    if (current_bill !== undefined) fieldsToUpdate.current_bill = current_bill;

    // Update record in Supabase
    const { data, error } = await supabase
      .from("billing")
      .update(fieldsToUpdate)
      .eq("billing_id", billing_id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Billing record not found.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Billing record updated successfully.",
      billing: data,
    });
  } catch (err) {
    console.error("Error updating billing record:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllBillings,
  getBillingByStudentId,
  getAllPayments,
  addBilling,
  addPayment,
  updateBilling
};
