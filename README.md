# Job Form Autofill Extension

A Chrome Extension that automatically fills job application forms using predefined profiles.

## Features

- Multiple Profiles
  - QA
  - Business Analyst
  - Developer

- Automatically fills

  - Name
  - Email
  - Phone
  - LinkedIn
  - GitHub
  - Portfolio
  - Country
  - Experience
  - Salary
  - Notice Period
  - Textareas
  - Radio Buttons (Supported)

- Manual Resume Upload

- Supports

  - Google Forms
  - Greenhouse
  - Lever
  - Workable (Work in Progress)

---

## Technologies

- JavaScript
- HTML
- CSS
- Chrome Extension Manifest V3

---

## Project Structure

```
JobFormAutofill
│
├── assets
│   └── resumes
│
├── background.js
├── content.js
├── fieldMap.js
├── filler.js
├── manifest.json
├── matcher.js
├── popup.html
├── popup.js
├── profile.js
├── radioFiller.js
├── router.js
└── styles.css
```

---

## Installation

1. Clone the repository

```
git clone https://github.com/YOUR_USERNAME/job-form-autofill-extension.git
```

2. Open Chrome

3. Go to

```
chrome://extensions
```

4. Enable

```
Developer Mode
```

5. Click

```
Load Unpacked
```

6. Select the project folder.

---

## Usage

1. Open any supported job application form.
2. Click the extension.
3. Select a profile:
   - QA
   - Business Analyst
   - Developer
4. Click **Autofill**.
5. Upload your resume manually.
6. Submit the application.

---

## Current Status

This project is currently under active development.

### Completed

- Profile Management
- Field Matching
- Smart Autofill
- Google Forms Support
- Radio Button Detection

### Planned

- Dropdown Detection
- Checkbox Detection
- Resume Upload
- Multi-step Forms
- More ATS Support

---

## License

MIT
