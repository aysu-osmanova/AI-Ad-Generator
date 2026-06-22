# 🎨 Frontend Architecture Guide (Vanilla Setup)

This document outlines a lightweight, zero-build frontend for the Multi-Platform AI Ad Generator. To keep the project intern-friendly and easy to deploy, we will use plain **HTML, CSS, and Vanilla JavaScript**. No React, Vue, or build tools are required.

---

## 1. UI Layout Strategy

The user interface should be clean, modern, and split into two distinct visual sections: the **Input Panel** and the **Results Dashboard**.

### The Input Panel

Contains the form where the user provides the context.

- **Input 1:** Text field for `Business Name`
- **Input 2:** Text area for `Product/Service` description
- **Toggle:** A dropdown or radio buttons to select `Express Mode` or `Agency Mode`
- **Action:** A "Generate Ads" button with a loading spinner state.

### The Results Dashboard

Once the data is fetched, the UI should display three separate cards. Using CSS Flexbox or CSS Grid, these cards should sit side-by-side on desktop, and stack vertically on mobile.

1. **📱 Instagram Card:** Displays the caption text and the 5 hashtags.
2. **📘 Facebook Card:** Displays the longer ad copy and highlights the Call-to-Action.
3. **🎵 TikTok Card:** Features a bold, large font displaying the single hook sentence.

---

## 2. File Structure

You only need three basic files in a `/public` or `/static` folder on your backend server:

```text
/public
  ├── index.html   (The structure)
  ├── styles.css   (The styling)
  └── app.js       (The logic & API connection)
```

---

## 3. The Core Logic (`app.js`)

The JavaScript has one primary job: intercept the form submission, send the data to your backend API, and paint the returned JSON onto the screen.

Here is the conceptual flow of the Vanilla JS engine:

```javascript
// 1. Grab DOM Elements
const generateBtn = document.getElementById('generateBtn');
const resultsDiv = document.getElementById('results');

// 2. Listen for the Click
generateBtn.addEventListener('click', async () => {

    // Grab input values
    const businessName = document.getElementById('businessName').value;
    const product = document.getElementById('product').value;
    const mode = document.getElementById('modeSelect').value;

    // Basic Validation
    if (!businessName || !product) {
        alert("Please fill in both the business name and product!");
        return;
    }

    // Show Loading State
    generateBtn.innerText = "Generating AI Ads... ⏳";
    generateBtn.disabled = true;

    try {
        // 3. Make the API Call to your Backend
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                business_name: businessName,
                product_service: product,
                mode: mode
            })
        });

        const json = await response.json();

        // 4. Inject Data into HTML Cards
        if (json.status === "success") {
            document.getElementById('ig-caption').innerText = json.data.instagram.caption;
            document.getElementById('ig-tags').innerText = json.data.instagram.hashtags.join(' ');

            document.getElementById('fb-copy').innerText = json.data.facebook.ad_copy;
            document.getElementById('fb-cta').innerText = json.data.facebook.cta;

            document.getElementById('tt-hook').innerText = json.data.tiktok.hook;

            // Reveal the results section
            resultsDiv.style.display = 'grid';
        } else {
            alert("Error: " + json.message);
        }

    } catch (error) {
        alert("Connection failed. Is the server running?");
    } finally {
        // Reset Button
        generateBtn.innerText = "Generate Ads";
        generateBtn.disabled = false;
    }
});
```

---

## 4. Styling Tips for a "Premium" Look

To ensure the evaluator gives you high marks on "usability", your CSS should make the output look like a professional dashboard.

- **Colors:** Use a soft, neutral background (like `#f4f4f9`) with crisp white (`#ffffff`) cards for the results.

- **Shadows:** Add subtle drop shadows to the cards to give them depth:
  ```css
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  ```

- **Typography:** Use a clean, modern sans-serif font like `Inter` or `Roboto` (importable via Google Fonts).

- **Platform Branding *(Optional bonus)*:** Give the top border of each result card the brand color of the platform:
  - **Instagram** — gradient border
  - **Facebook** — blue
  - **TikTok** — black / cyan / pink

  This is a tiny detail that evaluators love.
