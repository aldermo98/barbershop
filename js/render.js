/**
 * Safely get a nested property from an object using a dot-separated path.
 * Example: getByPath(obj, "barbers.list") → obj.barbers.list
 */
function getByPath(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
}

/**
 * Generic renderer for converting JSON arrays into HTML components.
 *
 * Options:
 *  - url:          string   → JSON file URL
 *  - containerId:  string   → ID of HTML container to inject into
 *  - listPath:     string   → path to array inside JSON (e.g., "barbers")
 *  - template:     function → (item, index) => html string
 */
function renderFromJson({ url, containerId, listPath, template }) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`renderFromJson: container #${containerId} not found`);
    return;
  }

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then((data) => {
      // Get the array from JSON
      const list = Array.isArray(data)
        ? data
        : getByPath(data, listPath);

      if (!Array.isArray(list)) {
        console.error(
          `renderFromJson: Data at path "${listPath}" is not an array.`,
          list
        );
        return;
      }

      container.innerHTML = ""; // reset container

      list.forEach((item, index) => {
        const wrapper = document.createElement("div");

        // Insert HTML string (convert to DOM)
        wrapper.innerHTML = template(item, index).trim();

        // Append only the first top-level element
        if (wrapper.firstElementChild) {
          container.appendChild(wrapper.firstElementChild);
        }
      });
    })
    .catch((err) => {
      console.error("renderFromJson error:", err);
    });
}
