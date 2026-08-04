function routeField(field, value) {
    const tag = field.tagName.toLowerCase();
    const type = (field.type || "").toLowerCase();

    // -------------------------
    // File Upload
    // -------------------------
    if (type === "file") {
        if (typeof fillFile === "function") {
            return fillFile(field, value);
        }
        return;
    }

    // -------------------------
    // Checkbox
    // -------------------------
    if (type === "checkbox") {
        if (typeof fillCheckbox === "function") {
            return fillCheckbox(field, value);
        }
        return;
    }

    // -------------------------
    // Radio (Normal HTML only)
    // Google Forms radios are handled separately in content.js
    // -------------------------
    if (type === "radio") {
        // Only select this radio if its value matches the target
        if (field.value.toLowerCase().trim() === value.toString().toLowerCase().trim()) {
            field.checked = true;
            field.dispatchEvent(new Event("change", { bubbles: true }));
            field.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return;
    }

    // -------------------------
    // Select
    // -------------------------
    if (tag === "select") {
        if (typeof fillSelect === "function") {
            return fillSelect(field, value);
        }
        return;
    }

    // -------------------------
    // Textarea
    // -------------------------
    if (tag === "textarea") {
        if (typeof fillTextarea === "function") {
            return fillTextarea(field, value);
        }
        return;
    }

    // -------------------------
    // Text Inputs
    // -------------------------
    if (typeof fillText === "function") {
        return fillText(field, value);
    }

    // Fallback
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
}