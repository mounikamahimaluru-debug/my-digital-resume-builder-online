const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env")
});

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URL;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================= FRONTEND =================
// server.js is inside public
// HTML files are also inside public
app.use(express.static(__dirname));

// ================= USER MODEL =================
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ================= RESUME MODEL =================
const educationSchema = new mongoose.Schema({
    institution: String,
    degree: String,
    year: String,
    percentage: String
});

const experienceSchema = new mongoose.Schema({
    company: String,
    role: String,
    duration: String,
    description: String
});

const resumeSchema = new mongoose.Schema({
    name: String,
    photo: String,
    dob: String,
    age: Number,
    phone: String,
    email: String,
    branch: String,
    course: String,
    address: String,
    objective: String,
    skills: [String],
    education: [educationSchema],
    experience: [experienceSchema]
}, { timestamps: true });

const Resume = mongoose.model("Resume", resumeSchema);

// ================= AGE FUNCTION =================
function calculateAge(dob) {
    if (!dob) return null;

    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) {
        return null;
    }

    const today = new Date();

    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const month =
        today.getMonth() -
        birthDate.getMonth();

    if (
        month < 0 ||
        (month === 0 &&
            today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
}

// ================= TEST =================
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Digital Resume Builder backend is working"
    });
});

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log("REGISTER REQUEST");
        console.log("Name:", name);
        console.log("Email:", email);

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 4) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 4 characters"
            });
        }

        const userEmail = email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: userEmail
            });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const user = new User({
            name: name.trim(),
            email: userEmail,
            password: password
        });

        await user.save();

        console.log("USER REGISTERED SUCCESSFULLY");

        res.json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const userEmail =
            email.toLowerCase().trim();

        const user =
            await User.findOne({
                email: userEmail
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

// ================= SAVE RESUME =================
app.post("/api/resume", async (req, res) => {
    try {
        const data = req.body;

        if (data.dob) {
            data.age = calculateAge(data.dob);
        }

        const resume =
            await Resume.findOneAndUpdate(
                { name: data.name },
                data,
                {
                    new: true,
                    upsert: true
                }
            );

        res.json({
            success: true,
            message: "Resume saved successfully",
            data: resume,
            resume: resume
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to save resume"
        });
    }
});

// ================= GET ALL RESUMES =================
app.get("/api/resumes", async (req, res) => {
    try {
        const resumes =
            await Resume.find()
                .sort({ createdAt: -1 });

        res.json({
            success: true,
            resumes: resumes
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get resumes"
        });
    }
});

// ================= GET RESUME BY ID =================
app.get("/api/resume-id/:id", async (req, res) => {
    try {
        const resume =
            await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.json({
            success: true,
            resume: resume
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get resume"
        });
    }
});

// ================= GET RESUME BY NAME =================
app.get("/api/resume/:name", async (req, res) => {
    try {
        const resume =
            await Resume.findOne({
                name: req.params.name
            });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.json({
            success: true,
            resume: resume
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get resume"
        });
    }
});

// ================= UPDATE RESUME =================
app.put("/api/resume/:id", async (req, res) => {
    try {
        const data = req.body;

        if (data.dob) {
            data.age = calculateAge(data.dob);
        }

        const resume =
            await Resume.findByIdAndUpdate(
                req.params.id,
                data,
                {
                    new: true
                }
            );

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.json({
            success: true,
            message: "Resume updated successfully",
            resume: resume
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update resume"
        });
    }
});

// ================= DELETE RESUME =================
app.delete("/api/resume/:id", async (req, res) => {
    try {
        const resume =
            await Resume.findByIdAndDelete(
                req.params.id
            );

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        res.json({
            success: true,
            message: "Resume deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete resume"
        });
    }
});

// ================= LOGIN PAGE =================
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "login.html")
    );
});

// ================= HTML ROUTES =================
app.get("/login.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "login.html")
    );
});

app.get("/register.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "Register.html")
    );
});

app.get("/profile.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "profile.html")
    );
});

app.get("/index.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "data", "index.html")
    );
});

// ================= 404 =================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ================= START SERVER =================
async function startServer() {
    try {

        if (!MONGO_URI) {
            console.error(
                "MONGO_URL is missing in .env"
            );
            return;
        }

        await mongoose.connect(MONGO_URI);

        console.log(
            "MongoDB connected successfully."
        );

        app.listen(PORT, () => {

            console.log("");
            console.log(
                "================================"
            );
            console.log(
                "DIGITAL RESUME BUILDER SERVER"
            );
            console.log(
                "================================"
            );

            console.log(
                `Server: http://localhost:${PORT}`
            );

            console.log(
                `Login: http://localhost:${PORT}/login.html`
            );

            console.log(
                `Register: http://localhost:${PORT}/register.html`
            );

            console.log(
                `Test: http://localhost:${PORT}/api/test`
            );

        });

    } catch (error) {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(error.message);
    }
}

startServer();

