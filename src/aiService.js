// aiService.js

const SERVICES = [
  {
    name: "Post-Matric Scholarship",
    category: "Education",
    needsIncome: true,
    purpose: "Education financial assistance"
  },
  {
    name: "College / University Scholarship",
    category: "Education",
    needsIncome: true,
    purpose: "Higher-education scholarship guidance"
  },
  {
    name: "Old Age Pension",
    category: "Pension",
    needsIncome: false,
    purpose: "Senior citizen pension guidance"
  },
  {
    name: "Widow Pension",
    category: "Pension",
    needsIncome: false,
    purpose: "Pension and support guidance"
  },
  {
    name: "Income Certificate",
    category: "Certificate",
    needsIncome: true,
    purpose: "Income proof application guidance"
  },
  {
    name: "Caste Certificate",
    category: "Certificate",
    needsIncome: false,
    purpose: "Certificate application guidance"
  },
  {
    name: "Residence Certificate",
    category: "Certificate",
    needsIncome: false,
    purpose: "Proof-of-residence guidance"
  },
  {
    name: "Farmer Services",
    category: "Agriculture",
    needsIncome: false,
    purpose: "Farmer welfare services"
  },
  {
    name: "Government Jobs",
    category: "Employment",
    needsIncome: false,
    purpose: "Employment and recruitment services"
  },
  {
    name: "Health Schemes",
    category: "Health",
    needsIncome: false,
    purpose: "Health scheme guidance"
  },
  {
    name: "Ration Card Services",
    category: "Food",
    needsIncome: false,
    purpose: "Food and ration services"
  },
  {
    name: "Government Grievance",
    category: "Grievance",
    needsIncome: false,
    purpose: "Raise and track grievances"
  }
];

/* =========================================================
   SERVICE FUNCTIONS
========================================================= */

export function listServices() {
  return SERVICES;
}

export function getService(name) {
  return (
    SERVICES.find(
      service =>
        service.name.toLowerCase() === String(name || "").toLowerCase()
    ) || {
      name: name || "Government Service",
      category: "Government Service",
      needsIncome: false,
      purpose: "Government service guidance"
    }
  );
}

/* =========================================================
   REQUEST UNDERSTANDING
========================================================= */

export async function understandRequest(text) {
  const t = String(text || "").toLowerCase().trim();

  // Government Jobs
  if (
    t.includes("government job") ||
    t.includes("govt job") ||
    t.includes("gov job") ||
    t.includes("government jobs") ||
    t.includes("govt jobs") ||
    t.includes("job") ||
    t.includes("jobs") ||
    t.includes("employment") ||
    t.includes("recruitment") ||
    t.includes("vacancy") ||
    t.includes("vacancies")
  ) {
    return {
      service: "Government Jobs",
      purpose: "Employment",
      explanation:
        "You appear to be looking for government job and employment opportunities.",
      needsClarification: false
    };
  }

  // Farmer Services
  if (
    t.includes("farmer") ||
    t.includes("farmers") ||
    t.includes("agriculture") ||
    t.includes("agricultural") ||
    t.includes("farming") ||
    t.includes("crop") ||
    t.includes("crops") ||
    t.includes("kisan")
  ) {
    return {
      service: "Farmer Services",
      purpose: "Agriculture",
      explanation:
        "You appear to be looking for government services related to farmers or agriculture.",
      needsClarification: false
    };
  }

  // Scholarships
  if (
    t.includes("scholarship") ||
    t.includes("scholarships") ||
    t.includes("student scholarship") ||
    t.includes("college scholarship") ||
    t.includes("education scholarship")
  ) {
    return {
      service: "Post-Matric Scholarship",
      purpose: "Education / Scholarship",
      explanation:
        "You appear to be looking for scholarship assistance for education.",
      needsClarification: false
    };
  }

  // Income Certificate
  if (
    t.includes("income certificate") ||
    t.includes("income proof") ||
    t.includes("family income")
  ) {
    return {
      service: "Income Certificate",
      purpose: "Income Certificate",
      explanation:
        "You appear to be looking for an Income Certificate to provide proof of income.",
      needsClarification: false
    };
  }

  // Caste Certificate
  if (
    t.includes("caste certificate") ||
    t.includes("caste")
  ) {
    return {
      service: "Caste Certificate",
      purpose: "Caste Certificate",
      explanation:
        "You appear to be looking for guidance on applying for a Caste Certificate.",
      needsClarification: false
    };
  }

  // Residence Certificate
  if (
    t.includes("residence certificate") ||
    t.includes("residence") ||
    t.includes("resident certificate") ||
    t.includes("address certificate")
  ) {
    return {
      service: "Residence Certificate",
      purpose: "Residence Certificate",
      explanation:
        "You appear to be looking for proof-of-residence guidance.",
      needsClarification: false
    };
  }

  // Old Age Pension
  if (
    t.includes("old age pension") ||
    t.includes("senior citizen pension") ||
    t.includes("senior pension") ||
    t.includes("old age")
  ) {
    return {
      service: "Old Age Pension",
      purpose: "Pension",
      explanation:
        "You appear to be looking for Old Age Pension guidance.",
      needsClarification: false
    };
  }

  // Widow Pension
  if (
    t.includes("widow pension") ||
    t.includes("widow")
  ) {
    return {
      service: "Widow Pension",
      purpose: "Pension",
      explanation:
        "You appear to be looking for Widow Pension guidance.",
      needsClarification: false
    };
  }

  // Health Schemes
  if (
    t.includes("health scheme") ||
    t.includes("health schemes") ||
    t.includes("health") ||
    t.includes("medical") ||
    t.includes("hospital")
  ) {
    return {
      service: "Health Schemes",
      purpose: "Health",
      explanation:
        "You appear to be looking for government health scheme guidance.",
      needsClarification: false
    };
  }

  // Ration Card
  if (
    t.includes("ration") ||
    t.includes("ration card") ||
    t.includes("food card") ||
    t.includes("food")
  ) {
    return {
      service: "Ration Card Services",
      purpose: "Food",
      explanation:
        "You appear to be looking for ration card or food-related government services.",
      needsClarification: false
    };
  }

  // Government Grievance
  if (
    t.includes("grievance") ||
    t.includes("complaint") ||
    t.includes("complaints") ||
    t.includes("government complaint") ||
    t.includes("problem with government")
  ) {
    return {
      service: "Government Grievance",
      purpose: "Grievance",
      explanation:
        "You appear to be looking for help raising a government grievance.",
      needsClarification: false
    };
  }

  // Default
  return {
    service: "Income Certificate",
    purpose: "General",
    explanation:
      "For this demo, I’ll guide you through an Income Certificate application.",
    needsClarification: false
  };
}
/* =========================================================
   FIELD EXPLANATIONS
========================================================= */

export function explainField(field) {
  const explanations = {
    name:
      "This identifies the person submitting the application.",

    dob:
      "Your date of birth is used to identify you and check that related details are consistent.",

    mobile:
      "A 10-digit mobile number is commonly used for communication. This demo does not send OTPs.",

    occupation:
      "This describes the type of work or main activity of the person.",

    income:
      "This is the amount of income you are reporting. Choose monthly or yearly so the amount is not ambiguous.",

    incomeFrequency:
      "This tells the system whether the reported income is monthly or yearly.",

    purpose:
      "This tells the service why you need the certificate.",

    identity:
      "Identity proof helps verify the applicant's identity.",

    address:
      "Address proof helps verify where the applicant lives.",

    incomeProof:
      "Income proof supports the income information provided in services that require income verification.",

    photo:
      "A passport-size photograph may be required for identification or application records."
  };

  return (
    explanations[field] ||
    "This information helps complete the application. Only enter information that is actually requested."
  );
}

/* =========================================================
   DATE HELPERS
========================================================= */

function calculateAge(dateOfBirth, referenceDate = new Date()) {
  if (!dateOfBirth) return null;

  const birth = new Date(dateOfBirth);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  let age = referenceDate.getFullYear() - birth.getFullYear();

  const monthDifference =
    referenceDate.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      referenceDate.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

/* =========================================================
   DOCUMENT HELPERS
========================================================= */

function isDocumentAvailable(document) {
  return Boolean(document);
}

/* =========================================================
   AI FORM CHECK
========================================================= */

export async function checkForm(data) {
  const issues = [];

  const mobile = String(data.mobile || "").replace(/\D/g, "");

  const serviceNeedsIncome = Boolean(data.serviceNeedsIncome);

  const documents = data.documents || {};

  /* -------------------------------------------------------
     BASIC FORM VALIDATION
  ------------------------------------------------------- */

  if (!data.name || !String(data.name).trim()) {
    issues.push({
      field: "name",
      title: "Full name",
      severity: "error",
      message: "Your name is missing.",
      fix: "Enter the applicant's full name."
    });
  }

  if (!data.dob) {
    issues.push({
      field: "dob",
      title: "Date of birth",
      severity: "error",
      message: "Date of birth is missing.",
      fix: "Select a valid date."
    });
  }

  if (mobile.length !== 10) {
    issues.push({
      field: "mobile",
      title: "Mobile number",
      severity: "error",
      message: "The mobile number should contain 10 digits.",
      fix: "Enter a valid 10-digit mobile number."
    });
  }

  if (!data.occupation) {
    issues.push({
      field: "occupation",
      title: "Occupation",
      severity: "error",
      message: "Occupation has not been provided.",
      fix: "Choose the closest occupation or select Other."
    });
  }

  /* -------------------------------------------------------
     INCOME VALIDATION
     
     IMPORTANT:
     Income is required only for services that need income.
  ------------------------------------------------------- */

  if (serviceNeedsIncome) {
    if (
      data.income === undefined ||
      data.income === null ||
      String(data.income).trim() === ""
    ) {
      issues.push({
        field: "income",
        title: "Income",
        severity: "error",
        message:
          "Income amount is required for this service.",
        fix:
          "Enter the reported income amount."
      });
    }

    if (!data.incomeFrequency) {
      issues.push({
        field: "incomeFrequency",
        title: "Income frequency",
        severity: "error",
        message:
          "Please confirm whether the income is monthly or yearly.",
        fix:
          "Choose Monthly or Yearly."
      });
    }
  }

  /* -------------------------------------------------------
     DOCUMENT VALIDATION
  ------------------------------------------------------- */

  // Identity proof
  if (!isDocumentAvailable(documents.identity)) {
    issues.push({
      field: "identity",
      title: "Identity proof",
      severity: "error",
      message:
        "The identity-proof document has not been selected.",
      fix:
        "Upload your identity proof or mark it as available."
    });
  }

  // Address proof
  if (!isDocumentAvailable(documents.address)) {
    issues.push({
      field: "address",
      title: "Address proof",
      severity: "error",
      message:
        "The address-proof document has not been selected.",
      fix:
        "Upload your address proof or mark it as available."
    });
  }

  // Income proof ONLY for services that require income
  if (
    serviceNeedsIncome &&
    !isDocumentAvailable(documents.incomeProof)
  ) {
    issues.push({
      field: "incomeProof",
      title: "Income proof",
      severity: "error",
      message:
        "The required income-proof document has not been selected.",
      fix:
        "Upload your income proof or mark it as available."
    });
  }

  // Passport photo
  if (!isDocumentAvailable(documents.photo)) {
    issues.push({
      field: "photo",
      title: "Passport photo",
      severity: "error",
      message:
        "The passport photo has not been selected.",
      fix:
        "Upload a passport photo or mark it as available."
    });
  }

  /* -------------------------------------------------------
     AGE / DATE OF BIRTH CONSISTENCY CHECK
  ------------------------------------------------------- */

  if (data.dob) {
    const referenceDate = new Date("2026-08-29");
    const calculatedAge = calculateAge(
      data.dob,
      referenceDate
    );

    if (calculatedAge !== null) {
      if (
        data.age !== undefined &&
        data.age !== null &&
        String(data.age).trim() !== ""
      ) {
        const enteredAge = Number(data.age);

        if (
          Number.isFinite(enteredAge) &&
          enteredAge !== calculatedAge
        ) {
          issues.push({
            field: "age",
            title: "Age and date of birth",
            severity: "warning",
            message:
              `Your date of birth suggests an age of about ${calculatedAge}, but the form says ${data.age}.`,
            fix:
              "Check your date of birth and age."
          });
        }
      }
    }
  }

  /* -------------------------------------------------------
     INCOME VALUE VALIDATION
  ------------------------------------------------------- */

  if (serviceNeedsIncome && data.income) {
    const incomeValue = Number(
      String(data.income).replace(/,/g, "")
    );

    if (!Number.isFinite(incomeValue)) {
      issues.push({
        field: "income",
        title: "Income amount",
        severity: "error",
        message:
          "The income amount does not appear to be a valid number.",
        fix:
          "Enter income using numbers only, for example 25000."
      });
    } else if (incomeValue < 0) {
      issues.push({
        field: "income",
        title: "Income amount",
        severity: "error",
        message:
          "Income cannot be negative.",
        fix:
          "Enter a valid non-negative income amount."
      });
    }
  }

  /* -------------------------------------------------------
     MOBILE VALIDATION
  ------------------------------------------------------- */

  if (mobile.length === 10) {
    if (/^(\d)\1{9}$/.test(mobile)) {
      issues.push({
        field: "mobile",
        title: "Mobile number",
        severity: "warning",
        message:
          "The mobile number contains the same digit repeatedly.",
        fix:
          "Check that you entered the correct mobile number."
      });
    }
  }

  /* -------------------------------------------------------
     EMPTY PURPOSE CHECK
  ------------------------------------------------------- */

  if (!data.purpose || !String(data.purpose).trim()) {
    issues.push({
      field: "purpose",
      title: "Purpose",
      severity: "warning",
      message:
        "The purpose of the application has not been provided.",
      fix:
        "Select or enter the reason for applying."
    });
  }

  /* -------------------------------------------------------
     RESULT
  ------------------------------------------------------- */

  return {
    issues,

    ready: issues.length === 0,

    summary:
      issues.length > 0
        ? `Let's fix ${issues.length} ${
            issues.length === 1 ? "thing" : "things"
          } before you submit.`
        : "Your application passed the prototype checks and is ready for review."
  };
}
