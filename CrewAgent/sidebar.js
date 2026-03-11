const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const translateLang = document.getElementById('translate-lang');
const micBtn = document.getElementById('mic-btn');
const speechLang = document.getElementById('speech-lang');
const equalizer = document.getElementById('mic-equalizer');
const eqBars = equalizer ? equalizer.querySelectorAll('.bar') : [];

// Default backend URL — change this to your deployed URL
let BACKEND_URL = 'https://crewspace-ai.vercel.app/api/extension';

async function fetchModels() {
    try {
        const select = document.getElementById('model-select');
        const currentSelection = select?.value;

        // Auto-detect environment based on current tab URL
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url?.includes('localhost:3000')) {
            BACKEND_URL = 'http://localhost:3000/api/extension';
        } else {
            BACKEND_URL = 'https://crewspace-ai.vercel.app/api/extension';
        }

        // 1. Get models from Server (filtered by logged in user via session)
        let serverModels = [];
        try {
            const res = await fetch(`${BACKEND_URL}/models`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                serverModels = data.models || [];
                // Update local storage to stay in sync
                await chrome.storage.local.set({ synced_models: serverModels });
            }
        } catch (e) { /* silent */ }

        // 2. Get models from Local Sync
        let syncedModels = [];
        try {
            const result = await chrome.storage.local.get(['synced_models']);
            syncedModels = result.synced_models || [];
        } catch (e) { /* silent */ }

        // 3. Merge models
        const modelMap = new Map();
        [...serverModels, ...syncedModels].forEach(m => {
            // FILTER: Never show the 'default-agent' fallback
            if (m.id && m.name && m.id !== 'default-agent') {
                modelMap.set(m.id, m);
            }
        });

        const allModels = Array.from(modelMap.values());

        if (select) {
            select.innerHTML = '<option value="">Select Chatflow...</option>';
            if (allModels.length > 0) {
                allModels.forEach(model => {
                    const opt = document.createElement('option');
                    opt.value = model.id;
                    opt.textContent = model.name;
                    select.appendChild(opt);
                });

                // Auto-select logic
                if (currentSelection && allModels.some(m => m.id === currentSelection)) {
                    select.value = currentSelection;
                } else {
                    select.value = allModels[0].id;
                }
            }
        }
    } catch (e) {
        console.error("fetchModels overall failure", e);
    }
}

async function syncWithDashboard(isAuto = false) {
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn && !isAuto) syncBtn.style.opacity = '0.5';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        // Script to run in the dashboard tab
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                try {
                    const storeData = localStorage.getItem('crewspace-storage-v2');
                    if (!storeData) return null;
                    const parsed = JSON.parse(storeData);
                    return parsed.state?.chatflows?.map(f => ({ id: f.id, name: f.name })) || [];
                } catch (e) { return null; }
            }
        });

        let chatflows = results?.[0]?.result;
        if (chatflows && chatflows.length > 0) {
            // Filter again just in case
            chatflows = chatflows.filter(f => f.id !== 'default-agent');
            await chrome.storage.local.set({ synced_models: chatflows });
            await fetchModels();
        }
    } catch (e) {
        if (!isAuto) console.error("Sync failed", e);
    } finally {
        if (syncBtn && !isAuto) syncBtn.style.opacity = '1';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const syncBtn = document.getElementById('sync-btn');

    await fetchModels();

    // Auto-sync silently if we happen to be on the dashboard
    syncWithDashboard(true);

    if (syncBtn) {
        syncBtn.addEventListener('click', () => syncWithDashboard(false));
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TRANSLATE_NEW_NODES") {
        fetch(`${BACKEND_URL}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: request.texts, targetLanguage: request.targetLang })
        })
            .then(res => res.json())
            .then(data => {
                if (data.translated_texts) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "INJECT_NEW_TRANSLATIONS",
                        translatedTexts: data.translated_texts,
                        nodeIds: request.nodeIds
                    });
                }
            })
            .catch(err => console.error("Dynamic translation failed:", err));
        sendResponse({ status: "processing" });
        return true;
    } else if (request.type === "SYNC_CREWAGENT") {
        fetchModels();
        sendResponse({ status: "success" });
        return true;
    }
});

// Speech Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;
let silenceTimer = null;

// Audio context and equalizer state
let audioContext = null;
let analyser = null;
let microphoneStream = null;
let eqAnimationId = null;

// Configure Marked.js for Markdown parsing
let translationAbortController = null;

if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true, // Convert \n to <br>
        gfm: true,    // GitHub Flavored Markdown
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        }
    });
}

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        isRecording = true;
        micBtn.classList.add('recording');
        resetSilenceTimer();
    };

    recognition.onresult = function (event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        let base = chatInput.dataset.baseValue || '';
        if (base && !base.endsWith(' ')) {
            base += ' ';
        }

        if (finalTranscript) {
            chatInput.value = base + finalTranscript;
            chatInput.dataset.baseValue = chatInput.value;
        } else if (interimTranscript) {
            chatInput.value = base + interimTranscript;
        }

        // Trigger resize
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';

        resetSilenceTimer();
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            addMessage('Microphone permission is required. Opening a new tab to grant permission...', 'ai', 'error');
            chrome.tabs.create({ url: chrome.runtime.getURL('permission.html') });
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            addMessage('Speech recognition error: ' + event.error, 'ai', 'error');
        }
        stopRecording();
    };

    recognition.onend = function () {
        stopRecording();
    };
}

// Add a specific reset for silence timeout
function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        if (isRecording) {
            console.log('Sending message due to 2s of silence');
            const hasText = chatInput.value.trim().length > 0;
            if (recognition) {
                if (hasText) {
                    recognition.stop();
                } else {
                    recognition.abort();
                }
            }
            stopRecording();
            if (hasText) {
                sendMessage();
            }
        }
    }, 2000);
}

function stopRecording() {
    isRecording = false;
    micBtn.classList.remove('recording');
    clearTimeout(silenceTimer);

    // Stop and clean up equalizer and audio stream
    if (eqAnimationId) cancelAnimationFrame(eqAnimationId);
    if (equalizer) equalizer.classList.add('hidden');

    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
        microphoneStream = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
    }
}

function startEqualizer() {
    if (microphoneStream) return;
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            microphoneStream = stream;
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            if (equalizer) equalizer.classList.remove('hidden');

            function animateEq() {
                if (!isRecording) return;
                eqAnimationId = requestAnimationFrame(animateEq);

                analyser.getByteFrequencyData(dataArray);

                // Use lower frequencies which usually carry voice energy better
                const v1 = dataArray[10] / 255;
                const v2 = dataArray[20] / 255;
                const v3 = dataArray[30] / 255;
                const v4 = dataArray[40] / 255;

                if (eqBars.length >= 4) {
                    eqBars[0].style.height = Math.max(2, v1 * 14) + 'px';
                    eqBars[1].style.height = Math.max(2, v2 * 14) + 'px';
                    eqBars[2].style.height = Math.max(2, v3 * 14) + 'px';
                    eqBars[3].style.height = Math.max(2, v4 * 14) + 'px';
                }
            }

            animateEq();
        })
        .catch(err => {
            console.warn("Could not start equalizer audio stream:", err);
            // We ignore it, speech recognition might still work or has thrown its own error (like not-allowed)
        });
}

micBtn.addEventListener('click', () => {
    if (!recognition) {
        addMessage('Speech recognition is not supported in this browser.', 'ai', 'error');
        return;
    }

    if (isRecording) {
        recognition.stop();
        stopRecording();
    } else {
        chatInput.dataset.baseValue = chatInput.value;
        recognition.lang = speechLang.value;

        try {
            recognition.start();
            startEqualizer();
            chatInput.focus();
        } catch (e) {
            console.warn("Could not start recognition directly:", e);
            // Engine might still be stopping. Abort it completely and retry.
            recognition.abort();
            setTimeout(() => {
                try {
                    recognition.start();
                    startEqualizer();
                    chatInput.focus();
                } catch (err) {
                    console.error("Failed to restart recognition:", err);
                }
            }, 300);
        }
    }
});

// Resize textarea dynamically
chatInput.addEventListener('input', function () {
    this.dataset.baseValue = this.value;
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Handle enter key
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isAgentRunning) {
            sendMessage();
        }
    }
});

sendBtn.addEventListener('click', () => {
    if (isAgentRunning) {
        stopAgentLoop();
    } else {
        sendMessage();
    }
});
const welcomeScreenHTML = `
                <div class="welcome-screen">
                    <div class="welcome-icon">
                        <img src="logoCS.png" alt="CrewAgent Logo" width="48" height="48" style="border-radius: 8px;">
                    </div>
                    <h2>Welcome to CrewAgent Assistant</h2>
                    <p>Designed for Pure Intelligence.</p>
                    <p class="subtitle">I can read the page, answer questions, translate, and perform browser actions.
                    </p>
                </div>
`;

clearBtn.addEventListener('click', async () => {
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect ? modelSelect.value : '';
    if (selectedModel) {
        try {
            await fetch(`${BACKEND_URL}/history?chatflowId=${selectedModel}`, { method: 'DELETE', credentials: 'include' });
        } catch (e) {
            console.error("Failed to clear history", e);
        }
    }

    chatContainer.innerHTML = welcomeScreenHTML;
    // RESET AGENT STATE
    chatHistory = [];
    if (translationAbortController) {
        translationAbortController.abort();
        translationAbortController = null;
    }
    stopAgentLoop();


    // Reset translation back to default
    if (translateLang.value !== "") {
        translateLang.value = "";
        await chrome.storage.local.remove(['targetLang', 'langName']);
        await revertPageText();
        const tab = await getActiveTab();
        if (tab) chrome.tabs.sendMessage(tab.id, { type: "SET_TRANSLATION_STATE", lang: null });
    }
});

async function performTranslation(targetLang, langName) {
    if (!targetLang) {
        await chrome.storage.local.remove(['targetLang', 'langName']);
        await revertPageText();
        const tab = await getActiveTab();
        if (tab) chrome.tabs.sendMessage(tab.id, { type: "SET_TRANSLATION_STATE", lang: null });
        addMessage("Reverted to original page language.", "ai");
        return;
    }

    await chrome.storage.local.set({ targetLang, langName });

    translateLang.disabled = true;
    translateLang.value = targetLang;

    if (translationAbortController) translationAbortController.abort();
    translationAbortController = new AbortController();
    const signal = translationAbortController.signal;

    try {
        // REVERT ANY EXISTING TRANSLATION FIRST!
        await revertPageText();

        addMessage(`Scanning and translating page to ${langName}...`, "ai");

        const texts = await getPageTextNodes();

        if (!texts || texts.length === 0) {
            addMessage("No translatable text found on this page.", "ai", "error");
            translateLang.value = "";
            return;
        }

        const response = await fetch(`${BACKEND_URL}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: signal,
            body: JSON.stringify({ texts: texts, targetLanguage: targetLang })
        });

        const data = await response.json();
        if (data.translated_texts) {
            addMessage("Translation complete. Updating the page in-place...", "ai", "translation-success");
            await replacePageTextNodes(data.translated_texts);

            // Notify content script about updated translation state
            addMessage("Translation complete. Updating the page in-place...", "ai", "success");
            await replacePageTextNodes(data.translated_texts);

            setTimeout(async () => {
                const tab = await getActiveTab();
                if (tab) {
                    chrome.tabs.sendMessage(tab.id, { type: "SET_TRANSLATION_STATE", lang: targetLang });
                }
            }, 1000);
        } else {
            throw new Error("Missing translated texts from backend");
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Translation aborted.');
            return;
        }
        addMessage("Translation failed. CrewAgent may be incorrect. Please verify connection.", "ai", "error");
        console.error(error);
        translateLang.value = "";
    } finally {
        translateLang.disabled = false;
        translationAbortController = null;
    }
}

translateLang.addEventListener('change', async (e) => {
    const targetLang = e.target.value;
    const langName = e.target.options[e.target.selectedIndex].text;
    await performTranslation(targetLang, langName);
});

let chatHistory = [];
let isAgentRunning = false;
let userRequestedStop = false;
let currentAbortController = null;

function setButtonState(running) {
    if (running) {
        sendBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
            </svg>
        `;
        sendBtn.classList.add('stop-btn');
    } else {
        sendBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
        `;
        sendBtn.classList.remove('stop-btn');
    }
}

function stopAgentLoop() {
    if (isAgentRunning) {
        userRequestedStop = true;
        isAgentRunning = false;
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }
        if (translationAbortController) {
            translationAbortController.abort();
            translationAbortController = null;
        }
        setButtonState(false);
        // Remove typing indicator immediately if it exists
        const typingElements = document.querySelectorAll('.typing-indicator');
        typingElements.forEach(el => el.remove());
        addMessage("Execution stopped by user.", "ai", true);
    }
}

async function sendMessage() {
    if (isAgentRunning) return;

    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatInput.dataset.baseValue = '';
    chatInput.style.height = 'auto';

    if (isRecording && recognition) {
        recognition.stop();
        stopRecording();
    }

    // Remove welcome screen on first message
    const welcomeScreen = document.querySelector('.welcome-screen');
    if (welcomeScreen) welcomeScreen.remove();

    addMessage(text, 'user');
    chatHistory.push({ role: "user", content: text });

    runAgentLoop();
}

async function runAgentLoop() {
    isAgentRunning = true;
    userRequestedStop = false;
    setButtonState(true);

    const typingId = 'typing-' + Date.now();
    addTypingIndicator(typingId);

    try {
        while (isAgentRunning && !userRequestedStop) {

            // 1. Extract context from current tab
            const context = await getPageContext();

            // 2. Send history and context to backend
            const modelSelect = document.getElementById('model-select');
            const selectedModel = modelSelect ? modelSelect.value : 'sarvam';

            currentAbortController = new AbortController();

            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: currentAbortController.signal,
                body: JSON.stringify({
                    messages: chatHistory,
                    page_content: context.page_content,
                    elements: context.elements,
                    url: context.url,
                    title: context.title,
                    model: selectedModel
                })
            });

            currentAbortController = null;

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            // Log assistant's action into history 
            // Only add valid string content for Sarvam's prompt engine
            const assistantMessageStr = typeof data.text === "string" ? data.text : JSON.stringify(data);
            chatHistory.push({
                role: "assistant",
                content: assistantMessageStr
            });

            if (data.usedTool) {
                addActivityLog('action', `Agent used tool: ${data.usedTool}`);
            }

            // Note: Update UI right away if the agent generated new memory.
            if (data.memory) {
                fetchMemory();
            }

            // 3. Evaluate Action
            if (data.action && data.action !== "ANSWER") {
                let msgText = `Executing command: ${data.action} ${data.elementId ? `on element #${data.elementId}` : ''}`;
                if (data.action === "NAVIGATE") msgText = `Navigating to ${data.url}`;
                if (data.action === "TYPE") msgText = `Typing "${data.text}" into element #${data.elementId}`;
                if (data.action === "READ_IMAGE") msgText = `Reading image element #${data.elementId}`;

                removeElement(typingId);

                let executedResponse = null;

                if (data.action === "TRANSLATE" && data.language) {
                    const selectEl = document.getElementById('translate-lang');
                    let langName = data.language;
                    for (let i = 0; i < selectEl.options.length; i++) {
                        if (selectEl.options[i].value === data.language) {
                            langName = selectEl.options[i].text;
                            break;
                        }
                    }

                    // Add typing indicator back for the translation step 
                    addTypingIndicator(typingId);

                    await performTranslation(data.language, langName);
                } else {
                    addMessage(msgText, 'ai');

                    // Add typing indicator back for the next step 
                    addTypingIndicator(typingId);

                    // Execute command
                    executedResponse = await executeCommandInPage(data);
                }

                // We need to give the page time to react (navigate, modal open, DOM update)
                // If it's a navigation, wait longer for the new page to load
                if (data.action === "NAVIGATE") {
                    await new Promise(r => setTimeout(r, 6000));
                } else if (data.action !== "TRANSLATE") {
                    await new Promise(r => setTimeout(r, 1500));
                }

                if (userRequestedStop) break;

                let nextGoal = `Action ${data.action} executed. Review the new WEBPAGE CONTENT and AVAILABLE ELEMENTS. What is the next logical action to achieve the USER GOAL? If you meet the goal, or need the user to input something, return {"action":"ANSWER", "text":"..."}.`;
                let additionalData = null;

                if (executedResponse && executedResponse.rect) {
                    try {
                        const tab = await getActiveTab();
                        const screenshotDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

                        // Crop the image down in the sidebar context (bypasses page CORS)
                        const image = new Image();
                        image.src = screenshotDataUrl;
                        await new Promise(r => image.onload = r);

                        const rect = executedResponse.rect;
                        const dpr = executedResponse.devicePixelRatio || 1;

                        const canvas = document.createElement('canvas');
                        canvas.width = rect.width * dpr;
                        canvas.height = rect.height * dpr;
                        const ctx = canvas.getContext('2d');

                        // Draw cropped section
                        ctx.drawImage(
                            image,
                            rect.x * dpr, rect.y * dpr, rect.width * dpr, rect.height * dpr,
                            0, 0, canvas.width, canvas.height
                        );

                        additionalData = canvas.toDataURL('image/png');
                        nextGoal = `Image successfully captured via secure screenshot. Please extract the EXACT literal alphanumeric text shown in this image. Pay STRICT attention to uppercase and lowercase letters. Do NOT try to interpret or guess what it means. Provide the result using {"action":"TYPE", "elementId":<id_of_input_field>, "text":"<exact_literal_text_from_image>"}. What is the next logical action?`;
                    } catch (captureErr) {
                        console.error("Tab capture failed:", captureErr);
                        nextGoal = `Action failed: Could not capture secure screenshot due to cross-origin or capture API restrictions. Please try an alternative approach.`;
                    }
                } else if (executedResponse && executedResponse.error) {
                    nextGoal = `Action failed: ${executedResponse.error}. Please try an alternative approach.`;
                }

                // Prompt the AI to continue based on new context
                chatHistory.push({
                    role: "user",
                    content: nextGoal,
                    image_data: additionalData
                });

            } else if (data.action === "ANSWER" || data.text) {
                // Task is complete, or we require user input
                removeElement(typingId);
                const finalMsg = data.text || "Task completed.";
                addMessage(finalMsg, 'ai');
                break; // Exit the loop
            } else {
                // Fallback
                removeElement(typingId);
                addMessage("Task completed.", 'ai');
                break;
            }
        }

        removeElement(typingId);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch aborted by user.');
        } else {
            console.error('Chat error:', error);
            removeElement(typingId);
            addMessage("CrewAgent encountered an error connecting to the backend. Please verify your connection.", 'ai', 'error');
        }

        // On error, let the user retry
        isAgentRunning = false;
        setButtonState(false);
    } finally {
        isAgentRunning = false;
        setButtonState(false);
    }
}

function addMessage(text, sender, type = 'normal') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;

    if (type === 'error' || type === true) {
        msgDiv.innerHTML = `<div class="error-msg">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${text}
        </div>`;
    } else if (type === 'success' || type === 'translation-success') {
        const isTranslation = type === 'translation-success';
        msgDiv.innerHTML = `
            <div class="success-msg">
                <div class="success-msg-header">
                    <img src="logoCS.png" alt="Success Logo" width="16" height="16" style="border-radius: 2px;">
                    ${text}
                </div>
                ${isTranslation ? '<button class="cancel-translate-btn">Cancel Translation</button>' : ''}
            </div>`;

        if (isTranslation) {
            const cancelBtn = msgDiv.querySelector('.cancel-translate-btn');
            cancelBtn.addEventListener('click', async () => {
                cancelBtn.disabled = true;
                cancelBtn.textContent = 'Reverting...';
                await revertPageText();
                translateLang.value = "";
                await chrome.storage.local.remove(['targetLang', 'langName']);
                addMessage('Translation reverted.', 'ai');
                msgDiv.remove();
            });
        }
    } else {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'msg-content';

        if (sender === 'ai' && typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
            // Render Markdown for AI messages
            const rawHtml = marked.parse(text);
            contentDiv.innerHTML = DOMPurify.sanitize(rawHtml);
        } else {
            // Simple text formatting for user or if marked is missing
            contentDiv.innerText = text;
        }

        msgDiv.appendChild(contentDiv);
    }

    chatContainer.appendChild(msgDiv);
    scrollToBottom();
}

function addTypingIndicator(id) {
    const div = document.createElement('div');
    div.id = id;
    div.className = 'message ai-message typing-indicator';
    div.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatContainer.appendChild(div);
    scrollToBottom();
}

function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    const mainContent = document.querySelector('.main-content');
    mainContent.scrollTop = mainContent.scrollHeight;
}

// Extension APIs
async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

async function injectContentScriptIfNeeded(tabId) {
    return new Promise((resolve) => {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.warn("Script injection failed:", chrome.runtime.lastError.message);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

async function getPageContext() {
    const tab = await getActiveTab();
    if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        return { page_content: "Browser internal page - content access restricted.", elements: {}, url: tab ? tab.url : "", title: tab ? tab.title : "" };
    }

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_CONTEXT" }, async (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Initial context extraction failed:", chrome.runtime.lastError.message, "Attempting injection...");
                const injected = await injectContentScriptIfNeeded(tab.id);
                if (injected) {
                    // Retry once
                    chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_CONTEXT" }, (retryResponse) => {
                        if (chrome.runtime.lastError) {
                            console.warn("Retry failed:", chrome.runtime.lastError.message);
                            resolve({ page_content: "Script injection failed on this page. Try refreshing.", elements: {}, url: tab.url, title: tab.title });
                        } else {
                            resolve({ ...(retryResponse || { page_content: "", elements: {} }), url: tab.url, title: tab.title });
                        }
                    });
                } else {
                    resolve({ page_content: "Script injection pending or blocked.", elements: {}, url: tab.url, title: tab.title });
                }
            } else {
                resolve({ ...(response || { page_content: "", elements: {} }), url: tab.url, title: tab.title });
            }
        });
    });
}

async function getPageTextNodes() {
    const tab = await getActiveTab();
    if (!tab) return null;

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_TEXT_NODES" }, async (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Initial extract text nodes failed, attempting injection...");
                const injected = await injectContentScriptIfNeeded(tab.id);
                if (injected) {
                    chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_TEXT_NODES" }, (retryResponse) => {
                        resolve(retryResponse ? retryResponse.texts : null);
                    });
                } else {
                    resolve(null);
                }
            } else {
                resolve(response.texts || null);
            }
        });
    });
}

async function executeCommandInPage(command) {
    const tab = await getActiveTab();
    if (!tab) return;

    if (command.action === "NAVIGATE" && command.url) {
        chrome.tabs.update(tab.id, { url: command.url });
        return;
    }

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, {
            type: "EXECUTE_COMMAND",
            command: command
        }, async (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Initial execute command error:", chrome.runtime.lastError.message);
                const injected = await injectContentScriptIfNeeded(tab.id);
                if (injected) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: "EXECUTE_COMMAND",
                        command: command
                    }, (retryResponse) => resolve(retryResponse || {}));
                } else {
                    resolve({});
                }
            } else {
                resolve(response || {});
            }
        });
    });
}

async function replacePageTextNodes(translatedTexts) {
    const tab = await getActiveTab();
    if (!tab) return;

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, {
            type: "INJECT_TRANSLATION",
            translatedTexts: translatedTexts
        }, async () => {
            if (chrome.runtime.lastError) {
                const injected = await injectContentScriptIfNeeded(tab.id);
                if (injected) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: "INJECT_TRANSLATION",
                        translatedTexts: translatedTexts
                    }, resolve);
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    });
}

async function revertPageText() {
    const tab = await getActiveTab();
    if (!tab) return;

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { type: "REVERT_TRANSLATION" }, async () => {
            if (chrome.runtime.lastError) {
                const injected = await injectContentScriptIfNeeded(tab.id);
                if (injected) {
                    chrome.tabs.sendMessage(tab.id, { type: "REVERT_TRANSLATION" }, resolve);
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    });
}

// -------------------------------------------------------------
// Onboarding Guides
// -------------------------------------------------------------
function showOnboardingGuides() {
    const guides = [
        {
            element: document.getElementById('model-select'),
            text: "Select your preferred AI model here.",
            position: 'bottom',
            delay: 500
        },
        {
            element: document.getElementById('translate-lang'),
            text: "Translate the entire page in one click.",
            position: 'bottom',
            delay: 3500
        },
        {
            element: document.getElementById('clear-btn'),
            text: "Clear chat and reset translation.",
            position: 'bottom',
            delay: 6500
        },
        {
            element: document.getElementById('mic-btn'),
            text: "Use your voice to interact.",
            position: 'top',
            delay: 9500
        }
    ];

    guides.forEach((guide, index) => {
        setTimeout(() => {
            if (!guide.element) return;

            const guideEl = document.createElement('div');
            guideEl.className = `onboarding-guide ${guide.position}`;
            guideEl.innerText = guide.text;
            document.body.appendChild(guideEl);

            const rect = guide.element.getBoundingClientRect();
            let top, left;

            if (guide.position === 'bottom') {
                top = rect.bottom + 12;
                left = rect.left + (rect.width / 2) - 90;
            } else if (guide.position === 'top') {
                top = rect.top - 50;
                left = rect.left + (rect.width / 2) - 90;
            }

            // Constrain to viewport
            left = Math.max(10, Math.min(window.innerWidth - 190, left));

            guideEl.style.top = `${top}px`;
            guideEl.style.left = `${left}px`;

            // Fade in
            setTimeout(() => guideEl.classList.add('show'), 100);

            // Fade out
            setTimeout(() => {
                guideEl.classList.remove('show');
                setTimeout(() => guideEl.remove(), 500);
            }, 3000);

        }, guide.delay);
    });
}

// -------------------------------------------------------------
// Auto-Restore Persistent Translation and Model State logic
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    // Show guides on first load
    chrome.storage.local.get(['guidesShown'], (res) => {
        if (!res.guidesShown) {
            showOnboardingGuides();
            chrome.storage.local.set({ guidesShown: true });
        }
    });

    const data = await chrome.storage.local.get(['targetLang', 'langName', 'selectedModel']);
    // ... rest of the code is unchanged ...


    const modelSelect = document.getElementById('model-select');
    if (modelSelect && data.selectedModel) {
        modelSelect.value = data.selectedModel;
    }

    if (modelSelect) {
        // Initial load
        setTimeout(() => {
            fetchHistory();
            fetchMemory();
        }, 300);

        modelSelect.addEventListener('change', async (e) => {
            await chrome.storage.local.set({ selectedModel: e.target.value });
            fetchHistory();
            fetchMemory();
            addMessage(`Switched AI model to ${e.target.options[e.target.selectedIndex].text}`, "ai", "success");
        });
    }

    if (data.targetLang && data.langName) {
        translateLang.value = data.targetLang;
        addMessage(`Restoring translation to ${data.langName} for this page...`, "ai");
        performTranslation(data.targetLang, data.langName);
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        const activeTab = await getActiveTab();
        // Only trigger translation if the updated tab is the current active tab
        if (activeTab && activeTab.id === tabId) {
            const data = await chrome.storage.local.get(['targetLang', 'langName']);
            if (data.targetLang && data.langName) {
                console.log("Auto-translating new page load to", data.langName);

                // Add minor delay to let complex SPAs attach initial DOM
                setTimeout(() => {
                    performTranslation(data.targetLang, data.langName);
                }, 500);
            }
        }
    }
});

// Tab Switching Logic
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// Activity & Memory Logging
function addActivityLog(type, content) {
    const container = document.getElementById('activity-log');
    if (!container) return;
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const item = document.createElement('div');
    item.className = `activity-item type-${type}`;
    const header = document.createElement('div');
    header.className = `activity-header type-${type}`;
    header.textContent = `${type.toUpperCase()} • ${new Date().toLocaleTimeString()}`;

    const body = document.createElement('div');
    body.className = 'activity-body';
    body.textContent = content;

    item.appendChild(header);
    item.appendChild(body);
    container.insertBefore(item, container.firstChild);
}

function addMemoryLog(content) {
    const container = document.getElementById('memory-log');
    if (!container) return;
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const item = document.createElement('div');
    item.className = 'memory-item';
    const body = document.createElement('div');
    body.className = 'memory-body';
    body.textContent = content;

    item.appendChild(body);
    container.insertBefore(item, container.firstChild);
}

async function fetchMemory() {
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect ? modelSelect.value : '';
    if (!selectedModel) return;

    try {
        const response = await fetch(`${BACKEND_URL}/memory?chatflowId=${selectedModel}`, { credentials: 'include' });
        const data = await response.json();
        
        const container = document.getElementById('memory-log');
        if (!container) return;
        
        container.innerHTML = ''; // clear current memory list

        if (data.memory && data.memory.length > 0) {
            // Memory returns newest first, so we just append them.
            data.memory.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'memory-item';
                const body = document.createElement('div');
                body.className = 'memory-body';
                body.textContent = item.content;
                itemDiv.appendChild(body);
                container.appendChild(itemDiv);
            });
        } else {
            container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />
                </svg>
                <p>No memory recorded yet</p>
            </div>`;
        }
    } catch(e) {
        console.error("Failed to fetch memory", e);
    }
}

// Call fetchMemory when switching to memory tab or when a chatflow changes
document.querySelector('[data-target="memory-view"]').addEventListener('click', fetchMemory);
const modelSelect = document.getElementById('model-select');
if (modelSelect) {
    modelSelect.addEventListener('change', fetchMemory);
}

async function fetchHistory() {
    const modelSelect = document.getElementById('model-select');
    const selectedModel = modelSelect ? modelSelect.value : '';
    if (!selectedModel) return;

    try {
        const response = await fetch(`${BACKEND_URL}/history?chatflowId=${selectedModel}`, { credentials: 'include' });
        const data = await response.json();
        
        chatHistory = [];
        
        if (data.history && data.history.length > 0) {
            chatContainer.innerHTML = '';
            data.history.forEach(item => {
                chatHistory.push({
                    role: item.role,
                    content: item.content
                });
                const sender = item.role === 'user' ? 'user' : 'ai';
                addMessage(item.content, sender, 'history-load');
            });
        } else {
            chatContainer.innerHTML = welcomeScreenHTML;
        }
    } catch(e) {
        console.error("Failed to fetch history", e);
    }
}

// Intercept existing message handling to add logs
const originalAddMessage = addMessage;
addMessage = function (text, sender, type = 'normal') {
    originalAddMessage(text, sender, type);
    if (type !== 'history-load') {
        if (sender === 'ai' && type !== 'error') {
            if (text.startsWith('Executing') || text.startsWith('Navigating') || text.startsWith('Typing') || text.startsWith('Reading')) {
                addActivityLog('action', text);
            } else {
                addActivityLog('system', 'Agent generated a response');
            }
        } else if (sender === 'user') {
            addActivityLog('user', 'User sent a message');
        }
    }
}
