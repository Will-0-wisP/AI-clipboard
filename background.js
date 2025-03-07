const API_KEY = "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"; // Fixed API Key

chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Clipboard Assistant Installed");
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "fetch_ai_response") {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
      }, async (results) => {
        if (!results || !results[0] || !results[0].result) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Error",
            message: "No text selected. Please select some text first."
          });
          return;
        }
        const text = results[0].result;
        chrome.storage.local.set({ copiedText: text });

        chrome.storage.local.get(["userPrompt"], async (data) => {
          const promptText = data.userPrompt ? `${data.userPrompt}: ${text}` : text;
          try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                "model": "deepseek/deepseek-r1-distill-llama-8b",
                "messages": [{ "role": "user", "content": promptText }]
              })
            });
            
            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log("Full API Response:", responseData);
            
            if (!responseData.choices || !responseData.choices.length || !responseData.choices[0].message) {
              throw new Error("Invalid API response structure");
            }
            
            const aiText = responseData.choices[0].message.content || "No response received";
            chrome.storage.local.set({ aiResponse: aiText });
            
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: (text) => {
                navigator.clipboard.writeText(text).then(() => {
                  document.execCommand('paste');
                });
              },
              args: [aiText]
            });
          } catch (apiError) {
            console.error("Error fetching AI response:", apiError);
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "Error",
              message: "Failed to fetch AI response. Check console for details."
            });
          }
        });
      });
    } catch (error) {
      console.error("Error fetching AI response:", error);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Error",
        message: "Failed to fetch AI response. Check console for details."
      });
    }
  } else if (command === "copy_ai_response") {
    try {
      chrome.storage.local.get("aiResponse", (data) => {
        if (data.aiResponse) {
          navigator.clipboard.writeText(data.aiResponse).then(() => {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "Copied",
              message: "AI Response copied to clipboard."
            });
          }).catch(err => {
            console.error("Clipboard write failed:", err);
          });
        } else {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Error",
            message: "No AI response available to copy."
          });
        }
      });
    } catch (error) {
      console.error("Error copying AI response:", error);
    }
  }
});
