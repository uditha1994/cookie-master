chrome.runtime.onInstalled.addListener(() => {
    console.log('CookieMaster Lite extention installed');
    // alert('CookieMaster Lite extention installed');
});

chrome.cookies.onChanged.addListener((changeInfo) => {
    console.log(`Cookie changed: ${changeInfo.cookie.name}`);
    console.log(`Change cause: ${changeInfo.cause}`);
});