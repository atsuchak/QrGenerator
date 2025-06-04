let qrImg = document.getElementById("qrImg");
let qrText = document.getElementById("qrText");
let titleInput = document.getElementById("title");
const searchBtn = document.querySelector(".search a");

// Initialize QR codes array from localStorage or create empty array
let qrCodes = JSON.parse(localStorage.getItem("qrCodes")) || [];

function generateQR() {
  const title = titleInput.value.trim();
  const content = qrText.value.trim();

  if (!content) {
    alert("Content is required!");
    return;
  }

  // Generate QR code URL
  const qrCodeUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" +
    encodeURIComponent(content);

  // Create new QR code object
  const newQRCode = {
    id: Date.now(),
    title: title || `QR Code ${qrCodes.length + 1}`,
    content,
    qrCodeUrl,
    createdAt: new Date().toISOString(),
  };

  // Add to qrCodes array and save to localStorage
  qrCodes.unshift(newQRCode);
  localStorage.setItem("qrCodes", JSON.stringify(qrCodes));

  // Clear inputs
  titleInput.value = "";
  qrText.value = "";

  // Hide the QR image (since you don't want to show it immediately)
  qrImg.src = "";

  // Display recent QR codes
  displayRecentQRCodes();
}

// Search functionality
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const searchTerm = prompt("Enter title to search:");

  if (!searchTerm) return;

  const foundQRCodes = qrCodes.filter((qr) =>
    qr.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (foundQRCodes.length === 0) {
    alert("No QR codes found with that title!");
  } else {
    displayQRCodesPopup(foundQRCodes, `Search Results for "${searchTerm}"`);
  }
});

// Display QR codes in a popup
function displayQRCodesPopup(qrCodesToShow, title) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.style.position = "fixed";
  popup.style.top = "0";
  popup.style.left = "0";
  popup.style.width = "100%";
  popup.style.height = "100%";
  popup.style.backgroundColor = "rgba(0,0,0,0.5)";
  popup.style.display = "flex";
  popup.style.justifyContent = "center";
  popup.style.alignItems = "center";
  popup.style.zIndex = "1000";

  popup.innerHTML = `
        <div class="popup-content" style="background: white; padding: 2rem; border-radius: 10px; max-width: 90%; width: 100%; max-height: 80%; overflow: auto;">
            <div class="popup-header" style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <h2 style="font-size: 1.8rem;">${title}</h2>
                <span class="close-btn" style="cursor: pointer; font-size: 1.5rem;">&times;</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${qrCodesToShow
                  .map(
                    (qr) => `
                    <div style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #ddd; border-radius: 5px;">
                        <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem;">${qr.title}</h3>
                        <img src="${qr.qrCodeUrl}" style="width: 150px; height: 150px; margin-bottom: 0.5rem;">
                        <button class="delete-btn" data-id="${qr.id}" style="padding: 0.5rem 1rem; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  document.body.appendChild(popup);

  // Close popup when clicking X
  popup.querySelector(".close-btn").addEventListener("click", () => {
    popup.remove();
  });

  // Close popup when clicking outside
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });

  // Delete button functionality
  popup.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      qrCodes = qrCodes.filter((qr) => qr.id !== id);
      localStorage.setItem("qrCodes", JSON.stringify(qrCodes));
      e.target.closest("div").remove();
      displayRecentQRCodes();
    });
  });
}

// Display recent 3 QR codes
function displayRecentQRCodes() {
  let recentContainer = document.querySelector(".recent-qr-container");

  // Remove existing container if it exists to prevent duplication
  if (recentContainer) {
    recentContainer.remove();
  }

  // Create new container
  const container = document.querySelector(".container");
  recentContainer = document.createElement("div");
  recentContainer.className = "recent-qr-container";
  recentContainer.style.width = "80%";
  recentContainer.style.marginTop = "2rem";
  container.appendChild(recentContainer);

  const recentQRCodes = qrCodes.slice(0, 3);

  if (recentQRCodes.length === 0) {
    recentContainer.innerHTML = "<p>No QR codes generated yet.</p>";
  } else {
    recentContainer.innerHTML = `
            <h2 style="margin-bottom: 1rem; text-align: center;">Recent QR Codes</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${recentQRCodes
                  .map(
                    (qr) => `
                    <div style="border: 1px solid #ddd; padding: 1.5rem; border-radius: 10px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center;">
                        <h3 style="margin-bottom: 0.5rem; font-size: 1.3rem;">${qr.title}</h3>
                        <img src="${qr.qrCodeUrl}" style="width: 150px; height: 150px; margin: 0 auto 0.5rem;">
                    </div>
                `
                  )
                  .join("")}
            </div>
            ${
              qrCodes.length > 3
                ? '<button id="seeMoreBtn" style="margin-top: 1rem; padding: 0.7rem; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; width: 60%;">See More</button>'
                : ""
            }
        `;

    if (qrCodes.length > 3) {
      document.getElementById("seeMoreBtn").addEventListener("click", () => {
        displayQRCodesPopup(qrCodes, "All Generated QR Codes");
      });
    }
  }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  displayRecentQRCodes();
});
