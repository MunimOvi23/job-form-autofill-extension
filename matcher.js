const FIELD_MAP = {
    fullName: ["first and last name", "full name", "complete name", "legal name", "candidate name", "applicant name", "employee name", "your full name", "name"],
    firstName: ["first name", "given name", "forename"],
    lastName: ["last name", "surname", "family name"],
    email: ["email address", "official email", "primary email", "work email", "email"],
    phone: ["phone number", "mobile number", "contact number", "telephone", "mobile", "phone", "cell"],
    country: ["country", "country of residence", "currently based in", "current country", "where are you based"],
    city: ["city", "town"],
    address: ["address", "street address", "current address"],
    currentSalary: ["current salary", "current salary range", "present salary", "current ctc"],
    expectedSalary: ["expected salary", "expected salary range", "expected ctc", "salary expectation"],
    noticePeriod: ["notice period", "joining", "availability", "available from"],
    experience: ["experience", "years of experience", "total years of experience", "total experience"],
    gender: ["gender", "sex"],
    linkedin: ["linkedin profile", "linkedin"],
    github: ["github profile", "github"],
    portfolio: ["portfolio", "website", "personal website"],
    university: ["university", "college"],
    degree: ["degree", "qualification"],
    graduationYear: ["graduation year", "passing year"],
    whatsapp: ["whatsapp", "whatsapp number", "whatsapp phone"],
    currentLocation: ["current location", "city and country", "location", "currently based in"],
    totalExperience: ["years of experience", "years of work experience", "work experience", "total experience"],
    worksInTechCompany: ["work in a tech company", "tech company", "currently work in tech"],
    peopleManagementExperience: ["people management", "management experience", "people management experience"],
    englishProficiency: ["english proficiency", "level of english", "english level"],
    activelyLooking: ["actively looking", "looking for job", "job search status"],
    department: ["department", "current department", "working department"],
    preferredArea: ["area", "want to work in", "preferred area", "work area"],
    highestEducation: ["highest education", "level of education", "education level"],
    cgpa: ["cgpa", "gpa", "grade"],
    hasJobExperience: ["have job experience", "job experience", "work experience"],
    preferredDesignation: [
        "preferred designation",
        "desired designation",
        "designation",
        "preferred job title",
        "desired job title",
        "job title",
        "what is your preferred designation",
        "what is your desired designation"
    ],
    referralSource: ["hear about us", "where did you hear", "referral source", "source"]
};

function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function findProfileKey(text) {
    text = normalizeText(text);
    let bestKey = null;
    let bestScore = -1;

    for (const key in FIELD_MAP) {
        for (const alias of FIELD_MAP[key]) {
            const a = normalizeText(alias);
            if (!text.includes(a)) continue;
            let score = a.length;
            if (text === a) score += 100;
            if (score > bestScore) {
                bestScore = score;
                bestKey = key;
            }
        }
    }
    return bestKey;
}