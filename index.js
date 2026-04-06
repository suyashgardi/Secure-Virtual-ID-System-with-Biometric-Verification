import express from "express";
import bodyparser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import session from "express-session";
import { validate } from "deep-email-validator";
import nodemailer from "nodemailer";
import crypto from "crypto";
const app = express();
const port = 5000;
import dotenv from "dotenv";
dotenv.config();

app.use(cors({
  origin:   process.env.FRONTEND_URL || "https://localhost:5173" ,
  credentials: true
}));
// app.use(cors({
//   origin: "*",
//   methods: "*",
//   allowedHeaders: "*"
// }));

// app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  }),
);

const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// async function verifyEmail(email) {
//   const result = await validate({
//     email: email,
//     validateRegex: true,
//     validateMx: false,
//     validateTypo: false,
//     validateDisposable: false,
//     validateSMTP: false,
//   });
//   if (!result.valid) {
//     console.log(` Validation Failed For: "${email}"`);
//     console.log(JSON.stringify(result.validators, null, 2));
//   }
//   if (result.valid) {
//     return true;
//   }

//   return false;
// }

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));

app.get("/api", async (req, res) => {});

app.post("/api/sessions", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const query = "SELECT * FROM logins_db WHERE phone = $1";
    const result = await db.query(query, [phone]);

    if (result.rowCount > 0) {
      const user = result.rows[0];
      const isVerified = await bcrypt.compare(password, user.Pass);
      if (isVerified) {
        req.session.user = {
          phone: user.phone,
          f_name: user.f_name,
          l_name: user.l_name,
        };
        res
          .status(200)
          .json({ message: "Login Successful", user: req.session.user });
      } else {
        res.status(401).json({ error: "Incorrect Password" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/api/me", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post("/api/putslide", async (req, res) => {
  try {
    let uploadUrl = req.body.photo;
    console.log(uploadUrl);
    try {
      const query = `INSERT INTO slides(slide_url) VALUES ($1) RETURNING*;`;
      const result = await db.query(query, [uploadUrl]);
      res.status(200).json({ message: "Slide Uploaded" });
    } catch {
      res.status(402).json({ error: "Query Error " });
    }
  } catch {
    res.status(500).json({ error: " Upload Failed" });
  }
});

app.get("/api/getslides", async (req, res) => {
  try {
    const query = `SELECT * FROM slides WHERE slide_no>=0`;
    const result = await db.query(query);
    if (result) {
      res.status(200).json(result.rows);
    } else {
      res.status(402).json({ error: "Query Error" });
    }
  } catch {
    res.status(500).json({ error: "API error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    let doesExist;
    let phone = req.body.phone;
    let password = req.body.password;
    let email = req.body.email;
    let confirmPassword = req.body.confirm_password;
    if (email) {
      doesExist = await verifyEmail(email);
      if (!doesExist) {
        return res.status(400).json({ error: " invalid email " });
      }
    }

    const checkQuery = "SELECT * FROM logins_db WHERE email = $1";
    const checkResult = await db.query(checkQuery, [email]);
    if (checkResult.rowCount > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    if (/^\d{10}$/.test(phone)) {
      const checkQuery = "SELECT * FROM logins_db WHERE phone = $1";
      const checkResult = await db.query(checkQuery, [phone]);

      if (checkResult.rowCount === 0) {
        try {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);

          const query = `INSERT INTO logins_db (f_name,l_name,phone,"Pass",email)
                    VALUES ($1,$2,$3,$4,$5) 
                    RETURNING *;`;
          const values = [
            req.body.f_name,
            req.body.l_name,
            phone,
            hashedPassword,
            req.body.email,
          ];

          const result = await db.query(query, values);
          console.log("User Registered:", result.rows[0]);
          res.status(201).json(result.rows[0]);
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Error Signing up user" });
        }
      } else {
        console.log("flag2dbhbjhsdj");
        return res.status(400).json({ error: "User already exists." });
      }
    } else {
      console.log("flag #####3dbhbjhsdj");
      return res.status(400).json({
        error: "Invalid phone number. Please enter a 10-digit number.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error Signing Up user" });
  }
});

app.post("/api/person", async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Please login first." });
    }

    const tempUrl = req.body.photo;
    let finalUrl = "";

    try {
      const uploadResult = await cloudinary.uploader.upload(tempUrl, {
        folder: "Permanent_National_IDs",
      });
      finalUrl = uploadResult.secure_url;
      console.log("Vault Transfer Complete:", finalUrl);
    } catch (uploadError) {
      console.error("Cloudinary Transfer Failed:", uploadError);
      return res.status(500).json({ error: "Failed to secure image." });
    }

    const linkedacc = req.session.user.phone;
    const photoPath = finalUrl;
    const facedata = req.body.facedata;

    let idNumber;
    let isUnique = false;

    while (!isUnique) {
      idNumber =
        Math.floor(Math.random() * (999999999999 - 100000000000 + 1)) +
        100000000000;
      const checkQuery = "SELECT 1 FROM users WHERE id_number = $1";
      const checkResult = await db.query(checkQuery, [idNumber]);

      if (checkResult.rowCount === 0) {
        isUnique = true;
      } else {
        console.log(`ID ${idNumber} is taken. Generating new one...`);
      }
    }

    const query = `
                INSERT INTO users (f_name, m_name, l_name, dob, gender, address, phone, email, photo_path, id_number,account_linked,"T28BitArr",dist,state)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12,$13,$14)
                RETURNING *;
            `;

    const values = [
      req.body.f_name,
      req.body.m_name,
      req.body.l_name,
      req.body.dob,
      req.body.gender,
      req.body.address,
      req.body.phone,
      req.body.email,
      photoPath,
      idNumber,
      linkedacc,
      facedata,
      req.body.district,
      req.body.state,
    ];

    const result = await db.query(query, values);

    console.log("User Registered:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error registering user" });
  }
});



app.patch("/api/person", async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Please login first." });
    }
    let providedToken = req.body.resetToken;

    if (!providedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const storedTokenData = validResetTokens.get(email);

    if (!storedTokenData || storedTokenData.token !== providedToken) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    if (Date.now() > storedTokenData.expires) {
      validResetTokens.delete(email);
      return res.status(401).json({ message: "Token has expired" });
    }


    const tempUrl = req.body.photo;
    let finalUrl = "";

    try {
      const uploadResult = await cloudinary.uploader.upload(tempUrl, {
        folder: "Permanent_National_IDs",
      });
      finalUrl = uploadResult.secure_url;
      console.log("Vault Transfer Complete:", finalUrl);
    } catch (uploadError) {
      console.error("Cloudinary Transfer Failed:", uploadError);
      return res.status(500).json({ error: "Failed to secure image." });
    }

    const linkedacc = req.session.user.phone;
    const photoPath = finalUrl;
    const facedata = req.body.facedata;

    let idNumber = req.body.id_number;

    const query = `
                UPDATE users 
      SET 
        f_name = $1, 
        m_name = $2, 
        l_name = $3, 
        dob = $4, 
        gender = $5, 
        address = $6, 
        phone = $7, 
        email = $8, 
        photo_path = $9,
        account_linked = $10,
        "T28BitArr" = $11,
        dist = $12,
        state = $13
      WHERE id_number = $14
      RETURNING *;
            `;

    const values = [
      req.body.f_name,
      req.body.m_name,
      req.body.l_name,
      req.body.dob,
      req.body.gender,
      req.body.address,
      req.body.phone,
      req.body.email,
      photoPath,
      linkedacc,
      facedata,
      req.body.district,
      req.body.state,
      idNumber,
    ];

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User ID not found." });
    }
    console.log("User Updated", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error Updating user" });
  }
});

app.get("/api/userids", async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(400)
        .json({ error: "Unauthorised access!!! Please Login" });
    }

    const linkedacc = req.session.user.phone;
    const query = `SELECT * FROM users WHERE Account_Linked=$1`;
    const result = await db.query(query, [linkedacc]);
    if (result) {
      return res.status(200).json(result.rows);
    }
  } catch {
    return res.status(500).json({ error: "Error Fetching IDs" });
  }
});

app.get("/api/preusers", async (req, res) => {
  try {
    const query = `SELECT "T28BitArr" FROM users`;
    const result = await db.query(query);
    if (result) {
      res.status(200).json(result.rows);
    }
  } catch (e) {
    res.status(500).json({ error: "Failed Fetching " });
  }
});
app.get("/api/states", async (req, res) => {
  try {
    const query = `SELECT DISTINCT statename FROM states ORDER BY statename ASC`;
    const result = await db.query(query);
    if (result) {
      res.status(200).json(result.rows);
    } else {
      res.status(400).json({ error: "Error Fetching Data" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

app.get("/api/district", async (req, res) => {
  try {
    const query = `SELECT DISTINCT distname FROM states ORDER BY distname ASC`;
    const result = await db.query(query);
    if (result) {
      res.status(200).json(result.rows);
    } else {
      res.status(400).json({ error: "Error Fetching Data" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server Error", details: err.message });
  }
});

app.get("/api/state/:distname", async (req, res) => {
  try {
    const { distname } = req.params;
    const query = `SELECT statename FROM states WHERE distname = $1 ORDER BY statename ASC`;
    const result = await db.query(query, [distname]);
    if (result) {
      res.status(200).json(result.rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error Fetching Users" });
  }
});

app.get("/api/districts/:statename", async (req, res) => {
  try {
    const { statename } = req.params;
    const query = `SELECT distname FROM states WHERE statename = $1 ORDER BY distname ASC`;
    const result = await db.query(query, [statename]);
    if (result) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ error: "State not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error Fetching Districts" });
  }
});

let tempOTPstorage = {};
let otpTimeouts = {};
const validResetTokens = new Map();
app.post("/api/validation", async (req, res) => {
  try {
    console.log("triggered api");
    let doesExist;
    let receiverEmail = req.body.email;
    let action = req.body.action;
    let caller = req.body.caller;

    if (action == "Send OTP") {
      const emailUser = process.env.SOURCE_EMAIL;
      const emailPass = process.env.SOURCE_EMAIL_PASS;

      console.log("email: ", receiverEmail);

      // if (receiverEmail) {
      //   doesExist = await verifyEmail(receiverEmail);
      //   if (!doesExist) {
      //     console.log(" invalid ");
      //     return res.status(400).json({ message: " invalid email " });
      //   }
      // }

      const query = `SELECT email FROM logins_db WHERE email=$1 ;`;
      const result = await db.query(query, [receiverEmail]);
      let rowcount = result.rowCount;
      if (caller == "signupform" || caller == "Updater") {
        rowcount = 1;
      }

      if (rowcount == 0) {
        return res
          .status(400)
          .json({ message: "User does not exist in database" });
      } else {
        const OTP = Math.floor(Math.random() * (999999 - 100000) + 100000);
        tempOTPstorage[receiverEmail] = OTP;

        if (otpTimeouts[receiverEmail]) {
          clearTimeout(otpTimeouts[receiverEmail]);
        }
        otpTimeouts[receiverEmail] = setTimeout(() => {
          delete tempOTPstorage[receiverEmail];
          delete otpTimeouts[receiverEmail];
        }, 300000);

        if (emailUser && emailPass) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailUser,
              pass: emailPass,
            },
          });
          try {
            const subject =
              caller === "signupform"
                ? "Email Verification for SignUp To personal IDs"
                : `OTP Verification For Resetting Password `;

            const mailOptions = {
              from: emailUser,
              to: receiverEmail,

              subject: subject,
              text: `The verification code recieved is : ${OTP}\n`,
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
              isSent: true,
              message: "otp has been sent to your email",
            });
          } catch (err) {
            return res.status(400).json(err);
          }
        }
      }
    }
    if (action == "verify OTP") {
      let userOTP = parseInt(req.body.otp);
      let storedOTP = tempOTPstorage[receiverEmail];
      if (storedOTP && userOTP === storedOTP) {
        delete tempOTPstorage[receiverEmail];
        if (otpTimeouts[receiverEmail]) {
          clearTimeout(otpTimeouts[receiverEmail]);
          delete otpTimeouts[receiverEmail];
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        validResetTokens.set(receiverEmail, {
          token: resetToken,
          expires: Date.now() + 15 * 60 * 1000,
        });

        return res.status(200).json({
          isVerified: true,
          resetToken: resetToken,
        });
      } else {
        return res.status(400).json({ message: " incorrect otp try again" });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: "error happened while sending OTP" });
  }
});

app.patch("/api/newpassword", async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    let providedToken = req.body.resetToken;

    if (!providedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const storedTokenData = validResetTokens.get(email);

    if (!storedTokenData || storedTokenData.token !== providedToken) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    if (Date.now() > storedTokenData.expires) {
      validResetTokens.delete(email);
      return res.status(401).json({ message: "Token has expired" });
    }

   
    if (password === confirmPassword) {
      const saltRounds = 10;
      password = await bcrypt.hash(password, saltRounds);
      const query = `UPDATE logins_db SET "Pass" = $1 WHERE email = $2`;
      const result = await db.query(query, [password, email]);
      if (result) {
        validResetTokens.delete(email);
        return res
          .status(200)
          .json({ message: "Password Changed Sucessfully !" });
      }
    } else {
      return res.status(400).json({
        message: " Entered Password and Confirm Password do not match ",
      });
    }
  } catch (err) {
    console.log("the error : ", err);
    return res.status(500).json({ error: { err } });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
