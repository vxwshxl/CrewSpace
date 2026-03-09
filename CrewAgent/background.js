// Basic background tasks can be added here
chrome.runtime.onInstalled.addListener(() => {
    console.log("1e extension installed");
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

// State tracking to toggle the side panel
let sidePanelState = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TOGGLE_CREWAGENT" && sender.tab) {
        const tabId = sender.tab.id;
        const windowId = sender.tab.windowId;

        let isOpen = sidePanelState[tabId] || false;

        if (isOpen) {
            // Close it by disabling then re-enabling
            chrome.sidePanel.setOptions({ tabId: tabId, enabled: false });
            setTimeout(() => {
                chrome.sidePanel.setOptions({ tabId: tabId, enabled: true });
            }, 200);
            sidePanelState[tabId] = false;
        } else {
            // Open it
            chrome.sidePanel.open({ tabId: tabId, windowId: windowId });
            sidePanelState[tabId] = true;
        }
        // Fire and forget
        sendResponse({ status: "success" });
    }
});
