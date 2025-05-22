document.addEventListener('DOMContentLoaded', function () {

    const cookiesTab = document.getElementById('cookiesTab');
    const cacheTab = document.getElementById('cacheTab');
    const cookiesContent = document.getElementById('cookiesContent');
    const cacheContent = document.getElementById('cacheContent');
    const refreshBtn = document.getElementById('refreshBtn');
    const refreshIcon = document.getElementById('refreshIcon');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const domainFilter = document.getElementById('domainFilter');
    const cookiesList = document.getElementById('cookiesList');
    const editModal = document.getElementById('editModal');
    const closeModal = document.getElementById('closeModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const cleanCacheBtn = document.getElementById('cleanCacheBtn');

    //State
    let cookies = [];
    let currentEditingCookie = null;

    //initilize app
    initTabs();
    setupEnventListeners();

    function initTabs() {
        cookiesTab.classList.add('active');
        cookiesContent.classList.add('active')
    }

    function setupEnventListeners() {
        //Tab switching
        cookiesTab.addEventListener('click', () => switchTab('cookies'));
        cacheTab.addEventListener('click', () => switchTab('cache'));
    }

    function switchTab(tab) {
        if (tab == 'cookies') {
            alert('cookies')
            cookiesTab.classList.add('active');
            cacheTab.classList.remove('active');
            cookiesContent.style.display = 'block';
            cacheContent.style.display = 'none';
        } else {
            alert('cache')
            cookiesTab.classList.remove('active');
            cacheTab.classList.add('active');
            cookiesContent.style.display = 'none';
            cacheContent.style.display = 'block';
        }
    }

    function refreshCookies() { }

    function showLoading(isLoading) { }

    function filterCookies() { }

    function renderCookies() { }

    function editCookies(cookie) { }

    function closeEditModal() { }

    function cleanCache() { }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});