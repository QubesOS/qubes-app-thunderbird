// Qubes Attachments MailExtension.
//
// Adds "Open in DispVM" and "Send to VM" to the attachment context menus.
// A MailExtension cannot run programs, so the attachment bytes are handed to a
// native-messaging host (qubes-attachment-host) that writes them to a temporary
// file and runs the matching qvm-* command. The host, not this script, decides
// which command runs; this script only names an action.

const HOST = "qubes.attachments";

// Menu item id -> action name sent to the native host.
const ACTIONS = {
  "qubes-open-in-dvm": "open-in-dvm",
  "qubes-send-to-vm": "send-to-vm",
};

// Both contexts: a single attachment, and the summary shown when a message has
// several attachments.
const CONTEXTS = ["message_attachments", "all_message_attachments"];

browser.menus.create({
  id: "qubes-open-in-dvm",
  title: browser.i18n.getMessage("menuOpenInDvm"),
  contexts: CONTEXTS,
});

browser.menus.create({
  id: "qubes-send-to-vm",
  title: browser.i18n.getMessage("menuSendToVm"),
  contexts: CONTEXTS,
});

browser.menus.onClicked.addListener(async (info, tab) => {
  const action = ACTIONS[info.menuItemId];
  if (!action) {
    return;
  }
  if (!info.attachments || info.attachments.length === 0) {
    return;
  }

  try {
    const messageId = await displayedMessageId(tab);
    if (messageId === null) {
      throw new Error("no displayed message");
    }

    const files = [];
    for (const attachment of info.attachments) {
      const file = await browser.messages.getAttachmentFile(
        messageId,
        attachment.partName
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      files.push({
        name: attachment.name || file.name || "attachment",
        data: bytesToBase64(bytes),
      });
    }

    const response = await runNative({ action, files });
    if (!response || !response.ok) {
      throw new Error((response && response.error) || "native host error");
    }
  } catch (error) {
    console.error("qubes-attachments:", error);
    notifyError(error);
  }
});

// Find the message the attachments belong to. In a standalone message window
// or a message tab, that is the clicked tab. In the 3-pane the clicked tab does
// not track the reading-pane message, so fall back to the current mail tab.
// Returns the message id, or null (e.g. a message opened from an .eml file,
// which has no id).
async function displayedMessageId(tab) {
  try {
    const message = await browser.messageDisplay.getDisplayedMessage(tab.id);
    if (message) {
      return message.id;
    }
  } catch (e) {
    // not a tab that displays a message; try the mail tab below
  }
  try {
    const mailTab = await browser.mailTabs.getCurrent();
    if (mailTab) {
      const message = await browser.messageDisplay.getDisplayedMessage(mailTab.id);
      if (message) {
        return message.id;
      }
    }
  } catch (e) {
    // no current mail tab
  }
  return null;
}

// Send one message to the native host and resolve with its single reply.
// connectNative is used rather than sendNativeMessage because the message to
// the host carries the attachment bytes and can be large; the reply is small.
function runNative(message) {
  return new Promise((resolve, reject) => {
    let port;
    try {
      port = browser.runtime.connectNative(HOST);
    } catch (error) {
      reject(error);
      return;
    }

    let settled = false;

    port.onMessage.addListener((response) => {
      settled = true;
      port.disconnect();
      resolve(response);
    });

    port.onDisconnect.addListener((p) => {
      if (settled) {
        return;
      }
      const error = p.error || (browser.runtime.lastError || {});
      reject(new Error(error.message || "native host disconnected"));
    });

    port.postMessage(message);
  });
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function notifyError(error) {
  browser.notifications.create({
    type: "basic",
    title: browser.i18n.getMessage("errorTitle"),
    message: String((error && error.message) || error),
  });
}
