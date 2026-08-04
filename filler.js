function fillText(field, value) {
    if (!field || value === null || value === undefined) return;
    field.focus();
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    field.blur();
}

function fillTextarea(field, value) {
    return fillText(field, value);
}

function fillSelect(field, value) {
    if (!field || !value) return;
    const options = Array.from(field.options);
    const target = value.toString().toLowerCase().trim();

    for (const option of options) {
        const text = option.text.trim().toLowerCase();
        const val = (option.value || "").trim().toLowerCase();
        if (text === target || val === target || text.includes(target)) {
            field.value = option.value;
            field.dispatchEvent(new Event("change", { bubbles: true }));
            return;
        }
    }
    // Fallback: if value is a number, select by index
    if (!isNaN(value) && Number(value) > 0 && Number(value) < options.length) {
        field.selectedIndex = parseInt(value);
        field.dispatchEvent(new Event("change", { bubbles: true }));
    }
}

function fillCheckbox(field, value) {
    console.log("⚠️ Checkbox skipped. Please check manually:", field);
}

function fillFile(field, value) {
    console.log("📁 File upload skipped. Please upload your resume manually:", field);
}