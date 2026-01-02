// --- 1. THEME LOGIC (Light/Dark Mode) ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
});

if (localStorage.getItem('theme') === 'dark') {
    html.classList.add('dark');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// --- 2. DATA MANAGEMENT ---
let qrCodes = JSON.parse(localStorage.getItem("qrCodes")) || [];
let titleInput = document.getElementById("title");
let qrText = document.getElementById("qrText");

// --- 3. CORE FUNCTIONS ---

function generateQR() {
    const title = titleInput.value.trim();
    const content = qrText.value.trim();

    if (!content) {
        alert("Please enter a link or text!");
        return;
    }

    // Using a higher resolution for better print quality
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(content)}`;

    const newQRCode = {
        id: Date.now(),
        title: title || `Untitled QR`,
        content,
        qrCodeUrl,
        createdAt: new Date().toISOString(),
    };

    qrCodes.unshift(newQRCode);
    localStorage.setItem("qrCodes", JSON.stringify(qrCodes));

    titleInput.value = "";
    qrText.value = "";
    displayRecentQRCodes();
}

// Unified Render Function (This replaces all old displayRecentQRCodes versions)
function renderQRList(list, headingText) {
    const container = document.getElementById("recent-qr-container");
    
    if (list.length === 0) {
        container.innerHTML = `<p class="text-center text-zinc-500 py-10 italic">No QR codes found.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm font-bold uppercase tracking-widest text-zinc-400">${headingText}</h3>
            <button onclick="clearAllHistory()" class="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
                <i class="fa-solid fa-trash-can text-[10px]"></i>
                Clear All
            </button>
        </div>
        <div class="grid gap-3">
            ${list.map(qr => `
                <div class="group flex items-center justify-between bg-white dark:bg-[#121214] p-3 pr-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 transition-all shadow-sm">
                    <div class="flex items-center gap-4">
                        <div onclick="openModal('${qr.qrCodeUrl}', '${qr.title}')" 
                             class="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden p-1 cursor-pointer group-hover:scale-105 transition-transform border border-transparent hover:border-indigo-500">
                            <img src="${qr.qrCodeUrl}" class="w-full h-full object-contain">
                        </div>
                        <div>
                            <h4 class="font-bold text-sm mb-0.5">${qr.title}</h4>
                            <p class="text-xs text-zinc-400 truncate max-w-[150px] md:max-w-[300px]">${qr.content}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="openModal('${qr.qrCodeUrl}', '${qr.title}')" class="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-zinc-400 hover:text-indigo-600 transition-all" title="Print PDF">
                            <i class="fa-solid fa-print text-xs"></i>
                        </button>
                        <button onclick="deleteQR(${qr.id})" class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-all" title="Delete">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function displayRecentQRCodes() {
    renderQRList(qrCodes.slice(0, 5), "Recently Created");
}

function deleteQR(id) {
    if(confirm("Delete this QR code?")) {
        qrCodes = qrCodes.filter(q => q.id !== id);
        localStorage.setItem("qrCodes", JSON.stringify(qrCodes));
        displayRecentQRCodes();
    }
}

function clearAllHistory() {
    if (confirm("Are you sure you want to delete all QR codes from your history? This cannot be undone.")) {
        qrCodes = [];
        localStorage.removeItem("qrCodes");
        displayRecentQRCodes();
    }
}

// --- 4. SEARCH LOGIC ---

function toggleSearch() {
    const searchBar = document.getElementById('search-bar');
    const input = document.getElementById('searchInput');
    
    if (searchBar.classList.contains('hidden')) {
        searchBar.classList.remove('hidden');
        input.focus();
    } else {
        searchBar.classList.add('hidden');
        input.value = "";
        displayRecentQRCodes();
    }
}

function handleSearch(term) {
    if (!term.trim()) {
        displayRecentQRCodes();
        return;
    }
    const filtered = qrCodes.filter(qr => 
        qr.title.toLowerCase().includes(term.toLowerCase()) || 
        qr.content.toLowerCase().includes(term.toLowerCase())
    );
    renderQRList(filtered, `Results for "${term}"`);
}

// --- 5. MODAL & PRINT LOGIC ---

function openModal(url, title) {
    const modal = document.createElement('div');
    modal.id = 'qr-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300';
    
    modal.innerHTML = `
        <div class="relative bg-white dark:bg-[#121214] p-8 rounded-[32px] shadow-2xl max-w-sm w-full transform transition-all scale-100">
            <button onclick="closeModal()" class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors print:hidden">
                <i class="fa-solid fa-xmark"></i>
            </button>
            
            <div class="text-center" id="print-area">
                <h3 class="text-2xl font-bold mb-6 text-zinc-900 dark:text-white print:text-black">${title}</h3>
                
                <div class="bg-white p-6 rounded-2xl inline-block border border-zinc-100 shadow-sm">
                    <img src="${url}" id="modal-qr-img" class="w-64 h-64 mx-auto rounded-lg">
                </div>
                
                <p class="mt-6 text-xs text-zinc-400 uppercase tracking-widest font-medium print:hidden">Ready to Scan</p>
                
                <div class="flex gap-3 mt-8 print:hidden">
                    <button onclick="window.print()" class="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20">
                        <i class="fa-solid fa-file-pdf"></i>
                        Print PDF
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('qr-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// --- 6. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", displayRecentQRCodes);