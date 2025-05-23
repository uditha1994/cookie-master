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
    let filteredCookies = [];

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

        cookiesList.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');

            if (editBtn) {
                const index = parseInt(editBtn.dataset.index);
                if (!isNaN(index) && filteredCookies[index]) {
                    editCookies(filteredCookies[index]);
                }
            }

            if (deleteBtn) {
                const domain = deleteBtn.dataset.domain;
                const name = deleteBtn.dataset.name;
                if (domain && name) {
                    deleteCookie(domain, name);
                }
            }
        });

        domainFilter.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterCookies();
            }
        });

        document.getElementById('settingsBtn').addEventListener('click', openOptionsPage);
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
        filteredCookies = cookies.filter(cookie =>
            !filter ||
            cookie.domain.toLowerCase().includes(filter) ||
            cookie.name.toLowerCase().includes(filter)
        );

        // if (filter) {
        //     filterCookies = cookies.filter(cookie =>
        //         cookie.domain.toLowerCase().includes(filter) ||
        //         cookie.name.toLowerCase().includes(filter)
        //     );
        // }

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

        const name = document.getElementById('editCookieName').value;
        const value = document.getElementById('editCookieValue').value;
        let domain = document.getElementById('editCookieDomain').value;

        // Remove leading dot if present (cookies API handles this automatically)
        domain = domain.replace(/^\./, '');

        const url = domain.startsWith('http') ? domain : `https://${domain}`;

        chrome.cookies.set({
            url,
            name,
            value,
            domain: currentEditingCookie.domain, // Use original domain
            path: currentEditingCookie.path,
            secure: currentEditingCookie.secure,
            httpOnly: currentEditingCookie.httpOnly,
            sameSite: currentEditingCookie.sameSite,
            expirationDate: currentEditingCookie.expirationDate || (Date.now() / 1000) + 3600 // 1 hour if no expiration
        }, (details) => {
            if (chrome.runtime.lastError) {
                console.error('Error saving cookie:', chrome.runtime.lastError);
                showError('Failed to save cookie');
                return;
            }
            refreshCookies();
            closeEditModal();
            showSuccess('Cookie updated successfully');
        });
    }

    function deleteCookie(domain, name) {
        if (!confirm(`Are you sure you want to delete cookie "${name}" from "${domain}"?`)) {
            return;
        }

        // Clean up domain format
        domain = domain.replace(/^\./, '').replace(/https?:\/\//, '');
        const url = `https://${domain}`;

        chrome.cookies.remove({
            url,
            name
        }, (details) => {
            if (chrome.runtime.lastError) {
                console.error('Error deleting cookie:', chrome.runtime.lastError);
                showError(`Failed to delete cookie: ${chrome.runtime.lastError.message}`);
            } else {
                // Remove from local state before refresh
                cookies = cookies.filter(c => !(c.name === name && c.domain.includes(domain)));
                filteredCookies = filteredCookies.filter(c => !(c.name === name && c.domain.includes(domain)));
                renderCookies();
                showSuccess('Cookie deleted successfully');
            }
        });
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        currentEditingCookie = null;
    }

    function cleanCache() {
        const timeRange = document.getElementById('cacheTimeRange').value;
        const options = {
            since: timeRange === '0' ? 0 : (Date.now() - (parseInt(timeRange) * 60 * 60 * 1000))
        };

        const dataTypes = {
            cache: document.getElementById('cacheOptionCache').checked,
            cookies: document.getElementById('cacheOptionCookies').checked,
            localStorage: document.getElementById('cacheOptionLocalStorage').checked
            // Removed sessionStorage as it's not a valid type
        };

        chrome.browsingData.remove(options, dataTypes, function () {
            if (chrome.runtime.lastError) {
                console.error('Error cleaning cache:', chrome.runtime.lastError);
                showError('Failed to clean cache');
                return;
            }

            const originalText = cleanCacheBtn.innerHTML;
            cleanCacheBtn.innerHTML = 'Cleaned!';
            cleanCacheBtn.style.backgroundColor = '#10b981';

            setTimeout(() => {
                cleanCacheBtn.innerHTML = originalText;
                cleanCacheBtn.style.backgroundColor = '#ef4444';
            }, 2000);
        });
    }

    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        setTimeout(() => errorElement.remove(), 3000);
    }

    function showSuccess(message) {
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        document.body.appendChild(successElement);
        setTimeout(() => successElement.remove(), 3000);
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function openOptionsPage() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options/options.html'));
        }
    }

});