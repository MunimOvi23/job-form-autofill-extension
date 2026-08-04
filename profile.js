const USER = {
    personal: {
        firstName: "Munim",
        middleName: "Bin",
        lastName: "Muquith",
        fullName: "Munim Bin Muquith",
        preferredName: "Munim Bin Muquith",
        gender: "Male",
        nationality: "Bangladeshi",
        maritalStatus: "Unmarried",
        religion: "Islam",
        email: "munim.bin.muquith20@gmail.com",
        phone: "+8801723554006",
        whatsapp: "+8801723554006",
        mobile: "+8801723554006",
        address: "H-167/7, R-02, Gudaraghat",
        city: "Dhaka",
        state: "Dhaka",
        country: "Bangladesh",
        zipCode: "1212",
        postalCode: "1212",
        currentSalary: "30000",
        linkedin: "https://www.linkedin.com/in/munim-bin-muquith/",
        github: "https://github.com/MunimOvi23",
        portfolio: "https://github.com/MunimOvi23",
        stackoverflow: "https://stackoverflow.com/users/19558652/munim-bin-muquith",
        kaggle: "https://www.kaggle.com/munimbinmuquith",
        medium: "https://medium.com/@munim.bin.muquith",
        languages: ["English", "Bangla"],
        currentOrganization: "Data Edge Limited",
        currentCompany: "Data Edge Limited",
        department: "Software Development",
        worksInTechCompany: "Yes",
        peopleManagementExperience: "0",
        englishProficiency: "Fluent",
        activelyLooking: "Yes",
        totalExperience: "2+ Years",
        relevantExperience: "2+ Years",
        noticePeriod: "Can join immediately",
        availableFrom: "Immediate",
        currentLocation: "Dhaka, Bangladesh",
        preferredLocation: "Dhaka",
        highestEducation: "Bachelor of Science in Computer Science and Engineering",
        degree: "Bachelor of Science in Computer Science and Engineering",
        major: "Computer Science and Engineering",
        university: "BRAC University",
        cgpa: "3.06",
        CGPA: "3.06",
        graduationYear: "2023",
        referralSource: "LinkedIn",
        hasJobExperience: "Yes",
    },
    profiles: {
        qa: {
            resume: "assets/resumes/SQA/MUNIM_BIN_MUQUITH_Resume.pdf",
            expectedSalary: "45000",
            currentPosition: "Software Quality Assurance Analyst",
            currentDesignation: "Software Quality Assurance Analyst",
            preferredArea: "Software Quality Assurance (SQA)",
            preferredDesignation: "Software Quality Assurance Analyst",
            skills: {
                core: ["Manual Testing", "Test Plan Design", "Test Case Design", "Regression Testing", "Smoke Testing", "Functional Testing", "Integration Testing", "System Testing", "User Acceptance Testing (UAT)", "Exploratory Testing", "API Testing", "Defect Lifecycle Management", "SQL Data Validation", "Agile/Scrum", "Root Cause Analysis", "Software Testing Life Cycle (STLC)"],
                automation: ["Playwright", "Cypress", "Selenium WebDriver (Basic)", "JavaScript", "End-to-End Testing", "Automation Framework Design"],
                apiTesting: ["Postman", "REST API Testing", "Response Validation", "Backend Verification", "JMeter (Basic Load Testing)"],
                bugTracking: ["Jira", "GitHub Projects", "Agile/Scrum", "Sprint Planning", "Cross-functional Collaboration"],
                database: ["Oracle", "MySQL", "SQL", "SQL Query Writing", "Data Validation"],
                versionControl: ["Git", "GitHub", "GitHub Actions (Basic)"],
                reporting: ["Playwright HTML Reporter", "Test Documentation"]
            }
        },
        developer: {
            resume: "assets/resumes/Dev/MUNIM_BIN_MUQUITH_Resume.pdf",
            expectedSalary: "45000",
            currentPosition: "Associate Application Analyst",
            currentDesignation: "Associate Application Analyst",
            preferredArea: "Software Development",
            preferredDesignation: "Software Development",
            skills: {
                programming: ["Python", "Java", "JavaScript"],
                frontend: ["HTML", "CSS", "Tailwind CSS", "DaisyUI", "React.js"],
                backend: [],
                database: ["MySQL"],
                versionControl: ["Git", "GitHub"]
            }
        },
        ba: {
            resume: "assets/resumes/BA/MUNIM_BIN_MUQUITH_Resume.pdf",
            expectedSalary: "50000",
            currentPosition: "Associate Application Analyst",
            currentDesignation: "Associate Application Analyst",
            preferredArea: "Business Analyst",
            preferredDesignation: "Business Analyst",
            skills: {
                businessAnalysis: ["Requirements Elicitation", "Business Requirements Document (BRD)", "Functional Requirements Document (FRD)", "Software Requirements Specification (SRS)", "User Stories", "Acceptance Criteria", "AS-IS Analysis", "TO-BE Analysis", "BPMN Process Modeling", "UAT Planning", "UAT Facilitation", "Gap Analysis", "Change Request Management", "Stakeholder Communication"],
                tools: ["Jira", "Confluence", "Lucidchart", "Microsoft Visio", "SoapUI", "Postman", "Microsoft Excel", "Git"],
                dataAndIntegration: ["Oracle Database", "SQL", "Data Validation", "SOAP API", "REST API", "XML", "JSON"],
                technical: ["HTML", "CSS", "JavaScript", "React.js"],
                methodologies: ["Agile", "Scrum", "Software Development Life Cycle (SDLC)"]
            }
        }
    }
};

let ACTIVE_PROFILE = "ba";

function getProfileValue(key) {
    if (USER.personal[key] !== undefined) {
        return USER.personal[key];
    }
    const profile = USER.profiles[ACTIVE_PROFILE];
    if (profile && profile[key] !== undefined) {
        return profile[key];
    }
    // Fallback for safety
    if (key === 'preferredDesignation') {
        console.warn("⚠️ preferredDesignation not found in profile, using fallback");
        return "Business Analyst";
    }
    return null;
}

function setActiveProfile(profile) {
    if (USER.profiles[profile]) {
        ACTIVE_PROFILE = profile;
        console.log(`✅ Active profile set to: ${profile}`);
    } else {
        console.warn(`❌ Profile "${profile}" not found`);
    }
}