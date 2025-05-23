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
    refreshCookies();

    function initTabs() {
        cookiesTab.classList.add('active');
        cookiesContent.classList.add('active')
    }

    function setupEnventListeners() {
        //Tab switching
        cookiesTab.addEventListener('click', () => switchTab('cookies'));
        cacheTab.addEventListener('click', () => switchTab('cache'));

        refreshBtn.addEventListener('click', refreshCookies);
        domainFilter.addEventListener('click', filterCookies);

        closeModal.addEventListener('click', closeEditModal);
        cancelEdit.addEventListener('click', closeEditModal);

        cleanCacheBtn.addEventListener('click', cleanCache);
    }

    function switchTab(tab) {
        if (tab == 'cookies') {
            cookiesTab.classList.add('active');
            cacheTab.classList.remove('active');
            cookiesContent.style.display = 'block';
            cacheContent.style.display = 'none';
        } else {
            cookiesTab.classList.remove('active');
            cacheTab.classList.add('active');
            cookiesContent.style.display = 'none';
            cacheContent.style.display = 'block';
        }
    }

    function refreshCookies() {
        showLoading(true);
        chrome.cookies.getAll({}, function (items) {
            cookies = items;
            renderCookies();
            showLoading(false);
        });
    }

    function showLoading(isLoading) {
        if (isLoading) {
            refreshIcon.style.display = 'none';
            loadingSpinner.style.display = 'block';
        } else {
            loadingSpinner.style.display = 'none';
            refreshIcon.style.display = 'block';
        }
    }

    function filterCookies() {
        renderCookies();
    }

    function renderCookies() {
        const filter = domainFilter.value.toLowerCase();
        let filteredCookies = cookies;

        if (filter) {
            filterCookies = cookies.filter(cookie =>
                cookie.domain.toLowerCase().includes(filter) ||
                cookie.name.toLowerCase().includes(filter)
            );
        }

        cookiesList.innerHTML = '';

        if (filteredCookies.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No Cookies Found!!';
            emptyMessage.className = 'error-text';
            cookiesList.appendChild(emptyMessage);
            return;
        }

        filteredCookies.forEach((cookie, index) => {
            const cookieItem = document.createElement('div');
            cookieItem.className = 'cookie-item fade-in';
            cookieItem.style.animationDelay = `${index * 0.05}`;

            cookieItem.innerHTML = `
                <div class="cookie-header">
                    <div>
                        <p class="cookie-name">${escapeHtml(cookie.name)}</p>
                        <p class="cookie-domain">${escapeHtml(cookie.domain)}</p>
                    </div>
                    <div class="cookie-actions">
                        <button class="action-btn edit-btn" data-index="${index}">
                            <svg class="action-icon edit-icon" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
              </svg>
                        </button>
                        <button class="action-btn delete-btn" data-domain="${escapeHtml(cookie.domain)}" 
                        data-name="${cookie.name}">
                            <svg class="action-icon delete-icon" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
                        </button>
                    </div>
                </div>
                <p class="cookie-value">${escapeHtml(cookie.value)}</p>
            `;

            cookiesList.appendChild(cookieItem);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                editCookies(filterCookies[index]);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const domain = this.getAttribute('data-domain');
                const name = this.getAttribute('data-name');
                deleteCookie(domain, name);
            });
        });

    }

    function editCookies(cookie) {
        currentEditingCookie = cookie;
        document.getElementById('editCookieName').value = cookie.name;
        document.getElementById('editCookieValue').value = cookie.value;
        document.getElementById('editCookieDomain').value = cookie.domain;
        editModal.style.display = 'flex';

        document.getElementById('saveCookie').onclick = saveEditedCookie;
    }

    function saveEditedCookie() {
        if (!currentEditingCookie) return;

        const name = document.getElementById('editCookeName').value;
        const value = document.getElementById('editCookeValue').value;
        const domain = document.getElementById('editCookeDomain').value;

        const url = domain.startsWith('.')
            ? `https://${domain.substring(1)}`
            : `https://${domain}`;

        chrome.cookies.set({
            url,
            name,
            value,
            domain
        }, function () {
            refreshCookies();
            closeEditModal();
        });
    }

    function deleteCookie(domain, name) {
        if (confirm(`Are you sure want to detete cookie "${name}" from "${domain}" ?`)) {
            const url = domain.startsWith('.')
                ? `http://${domain.substring(1)}`
                : `https://${domain}`;

            chrome.cookies.remove({
                url,
                name,
            }, function () {
                refreshCookies();
            });
        }
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        currentEditingCookie = null;
    }

    function cleanCache() {
        const timeRange = document.getElementById('cacheTimeRange').value;
        const option = {
            since: timeRange === '0' ? 0 :
                (Date.now() - (parseInt(timeRange) * 60 * 60 * 1000))
        };

        const dataTypes = {
            cach: document.getElementById('cacheOptionCache').checked,
            cookies: document.getElementById('cacheOptionCookie').checked,
            localStorage: document.getElementById('cacheOptionLocalStorage').checked,
            sessionStorage: document.getElementById('cacheOptionSessionStorage').checked
        };

        chrome.browsingData.remove(option, dataTypes, function () {
            const originalText = cleanCacheBtn.innerHTML;
            cleanCacheBtn.innerHTML = 'Cleaned!'
            cleanCacheBtn.style.backgroundColor = '#10b981';

            setTimeout(() => {
                cleanCacheBtn.innerHTML = originalText;
                cleanCacheBtn.style.backgroundColor = '#ef4444'
            }, 2000);
        })
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});