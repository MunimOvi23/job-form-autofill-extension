console.log("🚀 Job Form Autofill Loaded");

// Store the profile sent from popup
let currentScanProfile = null;

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getFieldInfo(input) {
    let label = "";
    if (input.id) {
        const htmlLabel = document.querySelector(`label[for="${input.id}"]`);
        if (htmlLabel) label = htmlLabel.innerText.trim();
    }
    if (!label) {
        const parentLabel = input.closest("label");
        if (parentLabel) label = parentLabel.innerText.trim();
    }
    let ariaLabelledBy = "";
    const labelledBy = input.getAttribute("aria-labelledby");
    if (labelledBy) {
        labelledBy.split(" ").forEach(id => {
            const element = document.getElementById(id);
            if (element) ariaLabelledBy += " " + element.innerText.trim();
        });
    }
    let ariaDescribedBy = "";
    const describedBy = input.getAttribute("aria-describedby");
    if (describedBy) {
        describedBy.split(" ").forEach(id => {
            const element = document.getElementById(id);
            if (element) ariaDescribedBy += " " + element.innerText.trim();
        });
    }
    const placeholder = input.placeholder || "";
    const ariaLabel = input.getAttribute("aria-label") || "";
    const autocomplete = input.autocomplete || "";
    const name = input.name || "";
    const id = input.id || "";
    const type = input.type || "";
    const title = input.getAttribute("title") || "";
    const combined = [label, placeholder, ariaLabel, ariaLabelledBy, ariaDescribedBy, autocomplete, title, name, id]
        .join(" ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .trim();

    console.log(`🔎 Field: ${input.tagName} | Label: "${label}" | Key: ${findProfileKey(combined)}`);
    return { element: input, label, placeholder, ariaLabel, ariaLabelledBy, ariaDescribedBy, autocomplete, title, name, id, type, combined };
}

function shouldSkipField(info) {
    const ignoredTypes = ["hidden", "submit", "button", "reset", "image", "color"];
    const type = info.type || "";
    if (ignoredTypes.includes(type)) return true;
    if (info.name.includes("g-recaptcha") || info.id.includes("g-recaptcha") || info.combined.includes("captcha")) return true;
    if (type === "search" || info.combined.includes("search")) return true;
    if (info.element.disabled || info.element.readOnly) return true;
    return false;
}

// ============================================================
// MESSAGE LISTENER
// ============================================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scan") {
        currentScanProfile = request.profile;
        console.log("📥 Received scan request for profile:", currentScanProfile);
        
        if (request.profile && typeof setActiveProfile === "function") {
            setActiveProfile(request.profile);
        } else {
            console.warn("⚠️ setActiveProfile not found or profile missing");
        }
        
        scanPage();
        sendResponse({ status: "scanning started" });
    }
});

// ============================================================
// GOOGLE DROPDOWN HANDLER
// ============================================================
async function fillGoogleDropdown(field, value) {
    if (!field || !value) return;
    const target = value.toString().toLowerCase().trim();
    field.click();
    await new Promise(r => setTimeout(r, 400));

    const options = document.querySelectorAll('div[role="option"]');
    for (const opt of options) {
        const optText = opt.innerText.trim().toLowerCase();
        if (optText === target || optText.includes(target) || target.includes(optText)) {
            opt.click();
            console.log("✅ Google Dropdown selected:", opt.innerText);
            return;
        }
    }
    console.warn("⚠️ No matching dropdown option for:", target);
}

// ============================================================
// SCRAPING HELPERS (SMART COMPANY DETECTION)
// ============================================================
function scrapeCompany() {
  let company = "";

  // 1. OG site name (most reliable for job boards)
  const og = document.querySelector('meta[property="og:site_name"]');
  if (og) company = og.content || og.getAttribute('value');

  // 2. Application name (e.g., "Fluxon" from Greenhouse)
  if (!company) {
    const appName = document.querySelector('meta[name="application-name"]');
    if (appName) company = appName.content;
  }

  // 3. Page title (e.g., "Senior QA Engineer (Manual) - Fluxon")
  if (!company) {
    const title = document.title;
    const parts = title.split(/[–—|-]/);
    if (parts.length > 1) {
      company = parts[parts.length - 1].trim();
    } else {
      const atParts = title.split(/\bat\b/i);
      if (atParts.length > 1) company = atParts[atParts.length - 1].trim();
    }
  }

  // 4. URL path fallback (greenhouse.io/fluxon/jobs/... → "fluxon")
  if (!company) {
    const match = window.location.pathname.match(/\/([^\/]+)\/jobs/);
    if (match) company = match[1];
  }

  // 5. Look for a visible heading that might be the company name
  if (!company) {
    // Common selectors for company name on job pages
    const selectors = [
      'h1[class*="company"]',
      'h2[class*="company"]',
      'div[class*="company-name"]',
      'span[class*="employer"]',
      'a[class*="company"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim().length > 2) {
        company = el.innerText.trim();
        break;
      }
    }
  }

  // 6. Ultimate fallback: hostname without www (but clean up common suffixes)
  if (!company) {
    company = window.location.hostname.replace('www.', '').split('.')[0];
  }

  // Clean up: remove common suffixes like "-jobs" or "-careers"
  company = company.replace(/-jobs$|-careers$|-hiring$/i, '').trim();
  return company;
}

function scrapeJD() {
    let jd = "";
    const selectors = [
        'div[class*="job-description"]',
        'div[class*="description"]',
        'article',
        'div[class*="jd"]',
        'div[class*="qualification"]'
    ];
    for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText.trim().length > 50) {
            jd = el.innerText.trim();
            break;
        }
    }
    if (!jd || jd.length < 20) {
        const bodyText = document.body.innerText.trim();
        jd = bodyText.substring(0, 2000);
    }
    return jd;
}

// ============================================================
// MAIN SCAN LOGIC
// ============================================================
async function scanPage() {
    console.log("🔍 Scanning page for form fields...");

    const fields = document.querySelectorAll('input, textarea, select, div[role="listbox"]');

    for (const field of fields) {
        const info = getFieldInfo(field);
        if (shouldSkipField(info)) continue;

        const key = findProfileKey(info.combined);
        if (!key) continue;

        const value = getProfileValue(key);
        console.log(`💡 Key: "${key}" -> Value: "${value}"`);
        if (value === null || value === undefined) continue;

        if (field.tagName === 'DIV' && field.getAttribute('role') === 'listbox') {
            await fillGoogleDropdown(field, value);
        } else {
            if (info.type === "file") {
                console.log("📁 Skipping file upload (manual):", field);
                continue;
            }
            routeField(field, value);
            console.log(`✅ Filled field with key "${key}"`);
        }
    }

    fillGoogleFormRadios();

    // ============================================================
    // LOG APPLICATION DATA
    // ============================================================
    if (currentScanProfile) {
        const company = scrapeCompany();
        const jd = scrapeJD();
        console.log("📊 Logging application for profile:", currentScanProfile);
        chrome.runtime.sendMessage({
            action: "log_application",
            profile: currentScanProfile,
            company: company,
            jd: jd
        });
    } else {
        console.error("❌ No profile set; cannot log application.");
    }
}

// ============================================================
// GOOGLE FORMS RADIO INTEGRATION
// ============================================================
function getQuestionLabelForGroup(group) {
    let labelEl = group.previousElementSibling;
    if (labelEl && labelEl.innerText.trim()) return labelEl.innerText.trim();

    labelEl = group.parentElement?.previousElementSibling;
    if (labelEl && labelEl.innerText.trim()) return labelEl.innerText.trim();

    const listItem = group.closest('[role="listitem"]');
    if (listItem) {
        const heading = listItem.querySelector('[role="heading"]');
        if (heading && heading.innerText.trim()) return heading.innerText.trim();
        const title = listItem.querySelector('.freebirdFormviewerComponentsQuestionBaseTitle');
        if (title && title.innerText.trim()) return title.innerText.trim();
    }
    return null;
}

function fillGoogleFormRadios() {
    const radioGroups = document.querySelectorAll('div[role="radiogroup"]');
    radioGroups.forEach(group => {
        const labelText = getQuestionLabelForGroup(group);
        if (!labelText) return;

        const key = findProfileKey(labelText);
        if (!key) return;

        const value = getProfileValue(key);
        if (!value) return;

        const radios = group.querySelectorAll('div[role="radio"]');
        const targetValue = value.toString().toLowerCase().trim();

        let selected = false;
        radios.forEach(radio => {
            let radioLabel = radio.getAttribute("aria-label") || radio.getAttribute("data-value") || "";
            if (!radioLabel) {
                radioLabel = radio.innerText.trim();
            }
            const normalizedRadio = radioLabel.toLowerCase().trim();

            if (normalizedRadio === targetValue || 
                normalizedRadio.includes(targetValue) || 
                targetValue.includes(normalizedRadio)) {
                radio.click();
                console.log("✅ Google Radio selected:", radioLabel);
                selected = true;
            }
        });
        if (!selected) {
            console.warn("⚠️ No matching radio found for:", targetValue, "in group", labelText);
        }
    });
}