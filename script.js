// =====================================================
// DIGITAL RESUME BUILDER - SCRIPT.JS
// =====================================================

const API_URL = "http://localhost:5000";

// =====================================================
// URL PARAMETERS
// =====================================================

const urlParams = new URLSearchParams(window.location.search);

const editName = urlParams.get("name");
const editId = urlParams.get("editId") || urlParams.get("id");

let editingResume = false;
let existingResume = null;
let photoBase64 = "";


// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getValue(id) {

    const element = document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


function setValue(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.value = value ?? "";
    }
}


// =====================================================
// AGE CALCULATION
// =====================================================

function calculateAge(dob) {

    if (!dob) {
        return "";
    }

    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) {
        return "";
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
        (
            month === 0 &&
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    return age;
}


// =====================================================
// DOB → AGE
// =====================================================

const dobInput =
    document.getElementById("dob");

const ageInput =
    document.getElementById("age");

if (dobInput) {

    dobInput.addEventListener(
        "change",
        function () {

            const age =
                calculateAge(this.value);

            if (ageInput) {
                ageInput.value = age;
            }

        }
    );
}


// =====================================================
// PROFILE PHOTO UPLOAD
// =====================================================

const photoInput =
    document.getElementById("profilePhoto");

const photoPreview =
    document.getElementById("photoPreview");

const photoError =
    document.getElementById("photoError");


if (photoInput) {

    photoInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }


            // -----------------------------------------
            // CHECK FILE TYPE
            // -----------------------------------------

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select JPG, PNG or WEBP image."
                );

                this.value = "";

                photoBase64 = "";

                return;
            }


            // -----------------------------------------
            // CHECK FILE SIZE
            // -----------------------------------------

            if (
                file.size >
                2 * 1024 * 1024
            ) {

                alert(
                    "Photo size must be less than 2MB."
                );

                this.value = "";

                photoBase64 = "";

                return;
            }


            // -----------------------------------------
            // READ IMAGE
            // -----------------------------------------

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    photoBase64 =
                        event.target.result;


                    // Show preview
                    if (photoPreview) {

                        photoPreview.src =
                            photoBase64;

                        photoPreview.style.display =
                            "block";
                    }


                    if (photoError) {
                        photoError.textContent =
                            "";
                    }

                };


            reader.onerror =
                function () {

                    alert(
                        "Unable to read the selected image."
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


// =====================================================
// EDUCATION
// =====================================================

function createEducationRow(data = {}) {

    const row =
        document.createElement("div");

    row.className =
        "education-item";


    row.innerHTML = `

        <div class="form-group">

            <label>Institution</label>

            <input
                type="text"
                name="institution"
                placeholder="College / School name"
                value="${escapeHtml(data.institution || "")}"
            >

        </div>


        <div class="form-group">

            <label>Degree</label>

            <input
                type="text"
                name="degree"
                placeholder="B.Tech / Degree"
                value="${escapeHtml(data.degree || "")}"
            >

        </div>


        <div class="form-group">

            <label>Year</label>

            <input
                type="text"
                name="year"
                placeholder="2026"
                value="${escapeHtml(data.year || "")}"
            >

        </div>


        <div class="form-group">

            <label>Percentage</label>

            <input
                type="text"
                name="percentage"
                placeholder="85%"
                value="${escapeHtml(data.percentage || "")}"
            >

        </div>


        <button
            type="button"
            class="remove-btn remove-education"
        >
            Remove
        </button>

        <hr>

    `;


    const removeButton =
        row.querySelector(
            ".remove-education"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                row.remove();

            }
        );

    }


    return row;
}


function addEducation(data = {}) {

    const list =
        document.getElementById(
            "educationList"
        );

    if (!list) {
        return;
    }

    const row =
        createEducationRow(data);

    list.appendChild(row);
}


const addEducationBtn =
    document.getElementById(
        "addEducationBtn"
    );


if (addEducationBtn) {

    addEducationBtn.addEventListener(
        "click",
        function () {

            addEducation();

        }
    );

}


// =====================================================
// GET EDUCATION DATA
// =====================================================

function getEducationData() {

    const education = [];

    const rows =
        document.querySelectorAll(
            ".education-item, .education-row"
        );


    rows.forEach(
        function (row) {

            const institution =
                row.querySelector(
                    '[name="institution"]'
                )?.value.trim() || "";


            const degree =
                row.querySelector(
                    '[name="degree"]'
                )?.value.trim() || "";


            const year =
                row.querySelector(
                    '[name="year"]'
                )?.value.trim() || "";


            const percentage =
                row.querySelector(
                    '[name="percentage"]'
                )?.value.trim() || "";


            if (
                institution ||
                degree ||
                year ||
                percentage
            ) {

                education.push({

                    institution:
                        institution,

                    degree:
                        degree,

                    year:
                        year,

                    percentage:
                        percentage

                });

            }

        }
    );


    return education;
}


// =====================================================
// EXPERIENCE
// =====================================================

function createExperienceRow(data = {}) {

    const row =
        document.createElement("div");

    row.className =
        "experience-item";


    row.innerHTML = `

        <div class="form-group">

            <label>Company</label>

            <input
                type="text"
                name="company"
                placeholder="Company name"
                value="${escapeHtml(data.company || "")}"
            >

        </div>


        <div class="form-group">

            <label>Role</label>

            <input
                type="text"
                name="role"
                placeholder="Job role"
                value="${escapeHtml(data.role || "")}"
            >

        </div>


        <div class="form-group">

            <label>Duration</label>

            <input
                type="text"
                name="duration"
                placeholder="1 Year"
                value="${escapeHtml(data.duration || "")}"
            >

        </div>


        <div class="form-group">

            <label>Description</label>

            <textarea
                name="description"
                rows="2"
                placeholder="Work responsibilities"
            >${escapeHtml(data.description || "")}</textarea>

        </div>


        <button
            type="button"
            class="remove-btn remove-experience"
        >
            Remove
        </button>

        <hr>

    `;


    const removeButton =
        row.querySelector(
            ".remove-experience"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                row.remove();

            }
        );

    }


    return row;
}


function addExperience(data = {}) {

    const list =
        document.getElementById(
            "experienceList"
        );

    if (!list) {
        return;
    }

    const row =
        createExperienceRow(data);

    list.appendChild(row);
}


const addExperienceBtn =
    document.getElementById(
        "addExperienceBtn"
    );


if (addExperienceBtn) {

    addExperienceBtn.addEventListener(
        "click",
        function () {

            addExperience();

        }
    );

}


// =====================================================
// GET EXPERIENCE DATA
// =====================================================

function getExperienceData() {

    const experience = [];

    const rows =
        document.querySelectorAll(
            ".experience-item, .experience-row"
        );


    rows.forEach(
        function (row) {

            const company =
                row.querySelector(
                    '[name="company"]'
                )?.value.trim() || "";


            const role =
                row.querySelector(
                    '[name="role"]'
                )?.value.trim() || "";


            const duration =
                row.querySelector(
                    '[name="duration"]'
                )?.value.trim() || "";


            const description =
                row.querySelector(
                    '[name="description"]'
                )?.value.trim() || "";


            if (
                company ||
                role ||
                duration ||
                description
            ) {

                experience.push({

                    company:
                        company,

                    role:
                        role,

                    duration:
                        duration,

                    description:
                        description

                });

            }

        }
    );


    return experience;
}


// =====================================================
// SKILLS
// =====================================================

function getSkillsData() {

    const skillsInput =
        document.getElementById(
            "skills"
        );


    if (!skillsInput) {
        return [];
    }


    return skillsInput.value
        .split(",")
        .map(
            skill =>
                skill.trim()
        )
        .filter(
            skill =>
                skill !== ""
        );
}


// =====================================================
// BUILD RESUME DATA
// =====================================================

function collectResumeData() {

    const name =
        getValue("name") ||
        getValue("fullName");


    const email =
        getValue("email");


    const phone =
        getValue("phone") ||
        getValue("mobile");


    const dob =
        getValue("dob");


    const age =
        calculateAge(dob);


    const branch =
        getValue("branch");


    const course =
        getValue("course");


    const address =
        getValue("address") ||
        getValue("location");


    const objective =
        getValue("objective") ||
        getValue("careerSummary");


    const resumeData = {

        name:
            name,

        email:
            email,

        phone:
            phone,

        dob:
            dob,

        age:
            age,

        branch:
            branch,

        course:
            course,

        address:
            address,

        objective:
            objective,

        skills:
            getSkillsData(),

        education:
            getEducationData(),

        experience:
            getExperienceData(),

        photo:
            photoBase64 ||
            existingResume?.photo ||
            ""

    };


    return resumeData;
}


// =====================================================
// VALIDATION
// =====================================================

function validateResume(data) {

    if (!data.name) {

        alert(
            "Please enter your full name."
        );

        return false;
    }


    if (!data.email) {

        alert(
            "Please enter your email."
        );

        return false;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            data.email
        )
    ) {

        alert(
            "Please enter a valid email."
        );

        return false;
    }


    if (data.phone) {

        const phonePattern =
            /^[0-9]{10}$/;


        if (
            !phonePattern.test(
                data.phone
            )
        ) {

            alert(
                "Please enter a valid 10-digit mobile number."
            );

            return false;
        }

    }


    if (!data.dob) {

        alert(
            "Please select your date of birth."
        );

        return false;
    }


    if (
        !data.education ||
        data.education.length === 0
    ) {

        alert(
            "Please add at least one education detail."
        );

        return false;
    }


    return true;
}


// =====================================================
// FORM SUBMIT
// =====================================================

const resumeForm =
    document.getElementById(
        "resumeForm"
    );


if (resumeForm) {

    resumeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            try {

                const resumeData =
                    collectResumeData();


                console.log(
                    "RESUME DATA:",
                    resumeData
                );


                if (
                    !validateResume(
                        resumeData
                    )
                ) {
                    return;
                }


                let url;

                let method;


                // -----------------------------------------
                // EDIT MODE
                // -----------------------------------------

                if (
                    editingResume &&
                    editId
                ) {

                    url =
                        `${API_URL}/api/resume/${encodeURIComponent(editId)}`;

                    method =
                        "PUT";

                }


                // -----------------------------------------
                // NEW RESUME
                // -----------------------------------------

                else {

                    url =
                        `${API_URL}/api/resume`;

                    method =
                        "POST";

                }


                console.log(
                    "REQUEST URL:",
                    url
                );


                console.log(
                    "REQUEST METHOD:",
                    method
                );


                const response =
                    await fetch(
                        url,
                        {

                            method:
                                method,

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    resumeData
                                )

                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "BACKEND RESPONSE:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to save resume."
                    );

                }


                const savedResume =
                    result.resume ||
                    result.data;


                if (!savedResume) {

                    throw new Error(
                        "Resume saved but server did not return resume data."
                    );

                }


                const finalName =
                    savedResume.name ||
                    resumeData.name;


                const finalId =
                    savedResume._id ||
                    editId ||
                    "";


                alert(
                    editingResume
                        ? "Resume updated successfully!"
                        : "Resume saved successfully!"
                );


                // -----------------------------------------
                // OPEN PROFILE PAGE
                // -----------------------------------------

                window.location.href =
                    `profile.html?id=${encodeURIComponent(finalId)}&name=${encodeURIComponent(finalName)}`;

            }


            catch (error) {

                console.error(
                    "RESUME SAVE ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Could not reach the server. Make sure backend is running on port 5000."
                );

            }

        }
    );

}


// =====================================================
// LOAD RESUME FOR EDIT
// =====================================================

async function loadResumeForEdit() {

    if (
        !editId &&
        !editName
    ) {

        return;

    }


    try {

        editingResume =
            true;


        let url = "";


        if (editId) {

            url =
                `${API_URL}/api/resume-id/${encodeURIComponent(editId)}`;

        }

        else if (editName) {

            url =
                `${API_URL}/api/resume/${encodeURIComponent(editName)}`;

        }


        console.log(
            "EDIT LOAD URL:",
            url
        );


        const response =
            await fetch(url);


        const result =
            await response.json();


        console.log(
            "EDIT LOAD RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load resume for editing."
            );

        }


        const resume =
            result.resume ||
            result.data;


        if (!resume) {

            throw new Error(
                "Resume data not found."
            );

        }


        existingResume =
            resume;


        // -----------------------------------------
        // BASIC DETAILS
        // -----------------------------------------

        setValue(
            "name",
            resume.name
        );


        setValue(
            "fullName",
            resume.name
        );


        setValue(
            "email",
            resume.email
        );


        setValue(
            "phone",
            resume.phone
        );


        setValue(
            "mobile",
            resume.phone
        );


        setValue(
            "dob",
            resume.dob
        );


        setValue(
            "age",
            resume.age ??
            calculateAge(
                resume.dob
            )
        );


        setValue(
            "branch",
            resume.branch
        );


        setValue(
            "course",
            resume.course
        );


        setValue(
            "address",
            resume.address
        );


        setValue(
            "location",
            resume.address
        );


        setValue(
            "objective",
            resume.objective
        );


        setValue(
            "careerSummary",
            resume.objective
        );


        // -----------------------------------------
        // SKILLS
        // -----------------------------------------

        const skillsInput =
            document.getElementById(
                "skills"
            );


        if (skillsInput) {

            if (
                Array.isArray(
                    resume.skills
                )
            ) {

                skillsInput.value =
                    resume.skills.join(
                        ", "
                    );

            }

            else {

                skillsInput.value =
                    resume.skills ||
                    "";

            }

        }


        // -----------------------------------------
        // PHOTO
        // -----------------------------------------

        if (resume.photo) {

            photoBase64 =
                resume.photo;


            if (photoPreview) {

                photoPreview.src =
                    resume.photo;

                photoPreview.style.display =
                    "block";

            }

        }


        // -----------------------------------------
        // EDUCATION
        // -----------------------------------------

        loadEducationIntoForm(
            resume.education || []
        );


        // -----------------------------------------
        // EXPERIENCE
        // -----------------------------------------

        loadExperienceIntoForm(
            resume.experience || []
        );


        // -----------------------------------------
        // BUTTON
        // -----------------------------------------

        const submitButton =
            resumeForm?.querySelector(
                'button[type="submit"], input[type="submit"]'
            );


        if (submitButton) {

            if (
                submitButton.tagName ===
                "INPUT"
            ) {

                submitButton.value =
                    "Update Resume →";

            }

            else {

                submitButton.textContent =
                    "Update Resume →";

            }

        }


        // -----------------------------------------
        // EDIT MESSAGE
        // -----------------------------------------

        const editMessage =
            document.getElementById(
                "editModeMessage"
            );


        if (editMessage) {

            editMessage.style.display =
                "block";

        }


        console.log(
            "Resume loaded successfully for editing."
        );

    }


    catch (error) {

        console.error(
            "EDIT LOAD ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to load resume."
        );

    }

}


// =====================================================
// LOAD EDUCATION INTO FORM
// =====================================================

function loadEducationIntoForm(
    education
) {

    const list =
        document.getElementById(
            "educationList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (
        !Array.isArray(education) ||
        education.length === 0
    ) {

        addEducation();

        return;
    }


    education.forEach(
        function (edu) {

            addEducation(
                edu
            );

        }
    );

}


// =====================================================
// LOAD EXPERIENCE INTO FORM
// =====================================================

function loadExperienceIntoForm(
    experience
) {

    const list =
        document.getElementById(
            "experienceList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (
        !Array.isArray(experience) ||
        experience.length === 0
    ) {

        return;

    }


    experience.forEach(
        function (exp) {

            addExperience(
                exp
            );

        }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// NAME - CAPITAL LETTERS
// =====================================================

const nameInput =
    document.getElementById(
        "name"
    );


if (nameInput) {

    nameInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .toUpperCase()
                    .replace(
                        /[^A-Z ]/g,
                        ""
                    );

        }
    );

}


// =====================================================
// PHONE - ONLY NUMBERS
// =====================================================

const phoneInput =
    document.getElementById(
        "phone"
    );


if (phoneInput) {

    phoneInput.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(
                        /[^0-9]/g,
                        ""
                    )
                    .slice(
                        0,
                        10
                    );

        }
    );

}


// =====================================================
// DOB MAX = TODAY
// =====================================================

if (dobInput) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    dobInput.max =
        today;

}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // New resume:
        // Add one education row automatically

        if (
            !editingResume &&
            editId === null &&
            editName === null
        ) {

            const educationList =
                document.getElementById(
                    "educationList"
                );


            if (
                educationList &&
                educationList.children.length === 0
            ) {

                addEducation();

            }

        }


        // Load edit resume

        loadResumeForEdit();

    }
);