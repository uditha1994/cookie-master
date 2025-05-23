document.addEventListener('DOMContentLoaded', function () {
    //load saved settings
    chrome.storage.sync.get(['settings'], function(result){
        const settings = result.settings || {};

        document.getElementById('autoRefresh').checked = 
        settings.autoRefresh || false;
        document.getElementById('confirmDeletion').checked = 
        settings.confirmDeletion !== false; //default true
        document.getElementById('darkMode').checked = 
        settings.darkMode || false;
        document.getElementById('defaultTimeRange').value = 
        settings.defaultTimeRange || '0';
    });

    //save settings
    document.getElementById('saveSettings').addEventListener('click', function () {
        const settings = {
            autoRefresh: document.getElementById('autoRefresh').checked,
            confirmDeletion: document.getElementById('confirmDeletion').checked,
            darkMode: document.getElementById('darkMode').checked,
            defaultTimeRange: document.getElementById('defaultTimeRange').checked
        };

        chrome.storage.sync.set({settings: settings}, function(){
            //show success feedback
            const button = document.getElementById('saveSettings');
            const originalText = button.textContent;
            button.textContent = 'Saved!';
            button.style.backgroundColor = '#10b981';

            setTimeout(function(){
                button.textContent = originalText;
                button.style.backgroundColor = '#7c3aed';
            }, 2000);
        });
    });
});