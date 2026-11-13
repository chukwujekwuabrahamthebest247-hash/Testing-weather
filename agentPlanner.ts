/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentStep, PhoneAppType } from '../types/phone';

export function extractCleanSearchQuery(text: string): string {
  if (!text) return '';
  let clean = text.trim();
  clean = clean.replace(/^(search\s+for|search|google|find|look\s+up|browse|navigate\s+to)\s+/i, '');
  clean = clean.replace(/["']/g, '');
  return clean.trim();
}

export function extractOrdinalIndex(text: string): number | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('first') || lower.includes('1st')) return 0;
  if (lower.includes('second') || lower.includes('2nd')) return 1;
  if (lower.includes('third') || lower.includes('3rd')) return 2;
  if (lower.includes('fourth') || lower.includes('4th')) return 3;
  if (lower.includes('fifth') || lower.includes('5th')) return 4;
  const match = lower.match(/(?:result|item|link|position)\s*#?\s*([1-9])/);
  if (match && match[1]) {
    return parseInt(match[1], 10) - 1;
  }
  return null;
}

export function isOrdinalSearchResultIntent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const hasAction =
    lower.includes('tap') ||
    lower.includes('click') ||
    lower.includes('open') ||
    lower.includes('select') ||
    lower.includes('choose');
  const hasTarget =
    lower.includes('result') ||
    lower.includes('article') ||
    lower.includes('link') ||
    lower.includes('first') ||
    lower.includes('1st') ||
    lower.includes('second') ||
    lower.includes('2nd') ||
    lower.includes('third') ||
    lower.includes('3rd') ||
    lower.includes('fourth') ||
    lower.includes('4th');

  return hasAction && hasTarget;
}

/**
 * Strictly blocks infrastructure and security threats while allowing
 * TikTok, Tinder, social apps, and read-only Crypto Wallet monitoring.
 */
export function checkDisallowedAppRequest(prompt: string): {
  isDisallowed: boolean;
  appName?: string;
  reason?: string;
} {
  const lower = prompt.toLowerCase();

  // Keep server-banning and container-escape threats permanently blocked
  const disallowed = [
    'jailbreak',
    'torrent',
    'pirate',
    'root device',
    'bypass security',
    'sideload',
  ];

  for (const item of disallowed) {
    if (lower.includes(item)) {
      return {
        isDisallowed: true,
        appName: item,
        reason: `Action "${item}" is permanently blocked to protect cloud container security and server compliance.`,
      };
    }
  }

  return { isDisallowed: false };
}

/**
 * Detects if a prompt involves high-risk Crypto Wallet fund movements
 * so the agent enforces Biometric + Zero-Fear Action Guardrail approval.
 */
export function requiresCryptoGuardrail(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const isCryptoContext =
    lower.includes('crypto') ||
    lower.includes('wallet') ||
    lower.includes('metamask') ||
    lower.includes('trust wallet') ||
    lower.includes('phantom') ||
    lower.includes('binance') ||
    lower.includes('coinbase') ||
    lower.includes('usdt') ||
    lower.includes('btc') ||
    lower.includes('eth') ||
    lower.includes('sol');

  const isHighRiskAction =
    lower.includes('send') ||
    lower.includes('transfer') ||
    lower.includes('swap') ||
    lower.includes('withdraw') ||
    lower.includes('sign') ||
    lower.includes('approve') ||
    lower.includes('export key') ||
    lower.includes('seed phrase');

  return isCryptoContext && isHighRiskAction;
}

    }
  }
  return { isDisallowed: false };
}

  }
  return { isDisallowed: false };
}

export function generateLocalPlan(
  prompt: string,
  currentApp: PhoneAppType,
  context?: any
): {
  replyMessage: string;
  reasoning: string;
  steps: AgentStep[];
  thinkingOutsideTheBox?: { creativeStrategy: string };
  appliedKnowledge?: string;
} {
  const pLower = prompt.trim().toLowerCase();

  // 1. PURE APP LAUNCH / NAVIGATION (Do strictly that and STOP!)
  // If the user simply asks to open/view an app without requesting a sub-action inside it:
  const isExplicitLaunch =
    pLower.startsWith('open ') ||
    pLower.startsWith('launch ') ||
    pLower.startsWith('go to ') ||
    pLower.startsWith('switch to ') ||
    pLower.startsWith('navigate to ') ||
    pLower.startsWith('start ') ||
    pLower.startsWith('show me ') ||
    pLower === 'messages' ||
    pLower === 'notes' ||
    pLower === 'settings' ||
    pLower === 'browser' ||
    pLower === 'social' ||
    pLower === 'bitedash' ||
    pLower === 'food' ||
    pLower === 'banking' ||
    pLower === 'home';

  const hasSubAction =
    pLower.includes(' and ') ||
    pLower.includes(' then ') ||
    pLower.includes('search') ||
    pLower.includes('like') ||
    pLower.includes('order') ||
    pLower.includes('buy') ||
    pLower.includes('add') ||
    pLower.includes('send') ||
    pLower.includes('text') ||
    pLower.includes('write') ||
    pLower.includes('compose') ||
    pLower.includes('dark') ||
    pLower.includes('wifi') ||
    pLower.includes('bluetooth') ||
    pLower.includes('export') ||
    pLower.includes('flag') ||
    pLower.includes('cart');

  if (isExplicitLaunch && !hasSubAction) {
    let targetApp: PhoneAppType | null = null;
    let appLabel = '';

    if (pLower.includes('food') || pLower.includes('bitedash') || pLower.includes('restaurant')) {
      targetApp = 'food';
      appLabel = 'BiteDash';
    } else if (pLower.includes('message') || pLower.includes('sms') || pLower.includes('chat')) {
      targetApp = 'messages';
      appLabel = 'Messages';
    } else if (pLower.includes('note') || pLower.includes('memo')) {
      targetApp = 'notes';
      appLabel = 'Notes';
    } else if (pLower.includes('social') || pLower.includes('pulse') || pLower.includes('feed')) {
      targetApp = 'social';
      appLabel = 'Pulse Social';
    } else if (pLower.includes('browser') || pLower.includes('web') || pLower.includes('safari') || pLower.includes('chrome') || pLower.includes('internet')) {
      targetApp = 'browser';
      appLabel = 'Browser';
    } else if (pLower.includes('setting')) {
      targetApp = 'settings';
      appLabel = 'Settings';
    } else if (pLower.includes('bank') || pLower.includes('apex')) {
      targetApp = 'banking';
      appLabel = 'Apex Secure Bank';
    } else if (pLower.includes('quickbook')) {
      targetApp = 'quickbooks';
      appLabel = 'QuickBooks';
    } else if (pLower.includes('sheet') || pLower.includes('excel')) {
      targetApp = 'sheets';
      appLabel = 'Google Sheets';
    } else if (pLower.includes('home') || pLower.includes('springboard')) {
      return {
        replyMessage: 'Navigating to Home Screen.',
        reasoning: 'Navigating to home screen. Strictly doing what was requested with zero extra actions.',
        steps: [{ action: 'go_home', detail: 'Swipe up to Home Screen' }],
      };
    }

    if (targetApp) {
      const steps: AgentStep[] = [];
      if (currentApp !== targetApp) {
        steps.push({
          action: 'navigate_app',
          targetApp,
          detail: `Open ${appLabel}`,
        });
      }
      return {
        replyMessage: `Opened ${appLabel}.`,
        reasoning: `User requested to open ${appLabel}. Executed navigation and stopped with zero unprompted extra actions.`,
        steps: steps.length > 0 ? steps : [{ action: 'wait', duration: 100, detail: `Already on ${appLabel}` }],
      };
    }
  }

  // 2. GO HOME (Strictly return to home screen)
  if (
    pLower === 'go home' ||
    pLower === 'home' ||
    pLower === 'home screen' ||
    pLower.includes('return to home') ||
    pLower.includes('swipe up to home') ||
    pLower.includes('exit app')
  ) {
    return {
      replyMessage: 'Navigating to Home Screen.',
      reasoning: 'Executing exact user request to return home.',
      steps: [{ action: 'go_home', detail: 'Return to Home Screen' }],
    };
  }

  // 3. BROWSER & WEB SEARCH (Strictly search and do not click results unless requested!)
  if (pLower.includes('search') || pLower.includes('browse') || pLower.includes('google') || pLower.includes('look up')) {
    const query = extractCleanSearchQuery(prompt) || 'AI Phone Agents & Automation';
    const steps: AgentStep[] = [];
    if (currentApp !== 'browser') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'browser',
        detail: 'Open Web Browser',
      });
    }
    steps.push({
      action: 'type_text',
      value: query,
      detail: `Enter web search query: "${query}"`,
    });

    // Check if user EXPLICITLY instructed clicking or opening a result
    const wantsResultClick =
      isOrdinalSearchResultIntent(prompt) ||
      pLower.includes('click the') ||
      pLower.includes('click on') ||
      pLower.includes('open result') ||
      pLower.includes('open the') ||
      pLower.includes('tap result') ||
      pLower.includes('tap on');

    if (wantsResultClick) {
      const targetIdx = extractOrdinalIndex(prompt) ?? 0;
      steps.push({
        action: 'tap',
        targetName: `browser-result-${targetIdx}`,
        detail: `Select search result article #${targetIdx + 1}`,
      });
    }

    return {
      replyMessage: wantsResultClick
        ? `Searching for "${query}" and opening result #${(extractOrdinalIndex(prompt) ?? 0) + 1}.`
        : `Searching the web for "${query}".`,
      reasoning: wantsResultClick
        ? `Opening browser, searching for "${query}", and selecting result #${(extractOrdinalIndex(prompt) ?? 0) + 1} as explicitly requested.`
        : `Opening browser and submitting search query for "${query}". Strictly respecting user instruction with zero unprompted clicks.`,
      steps,
    };
  }

  // 4. BROWSER RESULT SELECTION (Explicit command to click/open a search result)
  if (
    isOrdinalSearchResultIntent(prompt) ||
    ((pLower.includes('result') || pLower.includes('article') || pLower.includes('link')) &&
      (pLower.includes('click') || pLower.includes('open') || pLower.includes('tap') || pLower.includes('select')))
  ) {
    const targetIdx = extractOrdinalIndex(prompt) ?? 0;
    const steps: AgentStep[] = [];
    if (currentApp !== 'browser') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'browser',
        detail: 'Open Web Browser',
      });
    }
    steps.push({
      action: 'tap',
      targetName: `browser-result-${targetIdx}`,
      detail: `Select search result article #${targetIdx + 1}`,
    });

    return {
      replyMessage: `Opening search result #${targetIdx + 1}.`,
      reasoning: `Executing explicit user request to open search result #${targetIdx + 1}.`,
      steps,
    };
  }

  // 5. BITEDASH (Food Ordering & Cart)
  if (pLower.includes('food') || pLower.includes('bitedash') || pLower.includes('pizza') || pLower.includes('burger') || pLower.includes('cart') || pLower.includes('checkout') || pLower.includes('order')) {
    const steps: AgentStep[] = [];
    if (currentApp !== 'food') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'food',
        detail: 'Launch BiteDash food delivery app',
      });
    }

    // A. View cart only
    if ((pLower.includes('view cart') || pLower.includes('open cart') || pLower.includes('my cart') || pLower.includes('show cart')) && !pLower.includes('add')) {
      steps.push({
        action: 'tap',
        targetName: 'food-floating-cart',
        detail: 'Open cart checkout view',
      });
      return {
        replyMessage: 'Opening your BiteDash cart.',
        reasoning: 'Navigating to cart view. Strictly doing what was requested.',
        steps,
      };
    }

    // B. Category section only
    if ((pLower.includes('category') || pLower.includes('section') || pLower.includes('menu')) && !pLower.includes('add') && !pLower.includes('order')) {
      steps.push({
        action: 'tap',
        targetName: 'category-pizza',
        detail: 'Select Pizza category',
      });
      return {
        replyMessage: 'Showing Pizza category on BiteDash.',
        reasoning: 'Selected pizza category without adding items.',
        steps,
      };
    }

    // C. Add to cart only (do NOT checkout!)
    if (pLower.includes('add') && !pLower.includes('checkout') && !pLower.includes('order')) {
      steps.push({
        action: 'tap',
        targetName: 'category-pizza',
        detail: 'Select Pizza section',
      });
      steps.push({
        action: 'tap',
        targetName: 'add-pizza-to-cart',
        detail: 'Add Artisan Pepperoni Pizza to cart',
      });
      return {
        replyMessage: 'Added Artisan Pepperoni Pizza to your cart.',
        reasoning: 'Added requested item to cart. Stopped before checkout as instructed.',
        steps,
      };
    }

    // D. Order / Checkout
    if (pLower.includes('order') || pLower.includes('buy') || pLower.includes('checkout')) {
      steps.push({
        action: 'tap',
        targetName: 'category-pizza',
        detail: 'Select Pizza category',
      });
      steps.push({
        action: 'tap',
        targetName: 'add-pizza-to-cart',
        detail: 'Add Artisan Pepperoni Pizza to cart',
      });
      steps.push({
        action: 'tap',
        targetName: 'food-floating-cart',
        detail: 'Proceed to checkout view',
      });
      return {
        replyMessage: 'Placing order for Artisan Pepperoni Pizza on BiteDash.',
        reasoning: 'Added pizza to cart and navigated to checkout as requested.',
        steps,
      };
    }

    return {
      replyMessage: 'Opened BiteDash.',
      reasoning: 'Navigated to BiteDash with zero unprompted actions.',
      steps,
    };
  }

  // 6. SOCIAL APP (Pulse)
  if (pLower.includes('social') || pLower.includes('pulse') || pLower.includes('like') || pLower.includes('post') || pLower.includes('feed')) {
    const steps: AgentStep[] = [];
    if (currentApp !== 'social') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'social',
        detail: 'Open Pulse Social',
      });
    }

    if (pLower.includes('like') || pLower.includes('heart')) {
      steps.push({
        action: 'tap',
        targetName: 'post-like-button-0',
        detail: 'Like latest post from Elena Rostova',
      });
      return {
        replyMessage: 'Liked the latest post on Social.',
        reasoning: 'Tapped like on target post as requested.',
        steps,
      };
    }

    return {
      replyMessage: 'Opened Pulse Social.',
      reasoning: 'Navigated to social feed without taking unprompted interactions.',
      steps,
    };
  }

  // 7. MESSAGES APP
  if (pLower.includes('message') || pLower.includes('sarah') || pLower.includes('alex') || pLower.includes('text') || pLower.includes('chat') || pLower.includes('sms')) {
    const steps: AgentStep[] = [];
    if (currentApp !== 'messages') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'messages',
        detail: 'Open Messages app',
      });
    }

    const isSarah = pLower.includes('sarah') || (!pLower.includes('alex'));
    const threadTarget = isSarah ? 'thread-sarah' : 'thread-alex';
    const contactName = isSarah ? 'Sarah Chen' : 'Alex Rivera';

    const wantsToSend =
      pLower.includes('send') ||
      pLower.includes('text') ||
      pLower.includes('reply') ||
      pLower.includes('tell') ||
      pLower.includes('write to');

    // View conversation thread only
    if (!wantsToSend && (pLower.includes('sarah') || pLower.includes('alex') || pLower.includes('thread') || pLower.includes('conversation'))) {
      steps.push({
        action: 'tap',
        targetName: threadTarget,
        detail: `Open conversation with ${contactName}`,
      });
      return {
        replyMessage: `Opened conversation with ${contactName}.`,
        reasoning: `Navigated to ${contactName}'s thread. Stopped without typing or sending.`,
        steps,
      };
    }

    // Send a message
    if (wantsToSend) {
      steps.push({
        action: 'tap',
        targetName: threadTarget,
        detail: `Select ${contactName} conversation`,
      });

      let textToSend = 'Hey! Running 10 mins late, see you soon!';
      const quoteMatch = prompt.match(/["']([^"']+)["']/);
      if (quoteMatch && quoteMatch[1]) {
        textToSend = quoteMatch[1];
      } else {
        const sayingMatch = prompt.match(/(?:saying|say|that)\s+(.+)$/i);
        if (sayingMatch && sayingMatch[1]) {
          textToSend = sayingMatch[1].trim();
        }
      }

      steps.push({
        action: 'type_text',
        value: textToSend,
        detail: `Compose message: "${textToSend}"`,
      });
      steps.push({
        action: 'tap',
        targetName: 'send-message-btn',
        detail: 'Send message',
      });

      return {
        replyMessage: `Sent message to ${contactName}: "${textToSend}".`,
        reasoning: `Selected thread, composed requested text, and sent message.`,
        steps,
      };
    }

    return {
      replyMessage: 'Opened Messages app.',
      reasoning: 'Navigated to messages overview. Doing strictly what was requested.',
      steps,
    };
  }

  // 8. NOTES APP
  if (pLower.includes('note') || pLower.includes('memo')) {
    const steps: AgentStep[] = [];
    if (currentApp !== 'notes') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'notes',
        detail: 'Open Notes app',
      });
    }

    const wantsToCreate =
      pLower.includes('create') ||
      pLower.includes('write') ||
      pLower.includes('new note') ||
      pLower.includes('add note') ||
      pLower.includes('take a note');

    if (wantsToCreate) {
      steps.push({
        action: 'tap',
        targetName: 'new-note-button',
        detail: 'Create new note document',
      });

      let noteTitle = 'Quick Note';
      const quoteMatch = prompt.match(/["']([^"']+)["']/);
      if (quoteMatch && quoteMatch[1]) {
        noteTitle = quoteMatch[1];
      } else {
        const titleMatch = prompt.match(/(?:titled|called|name)\s+([^,.]+)/i);
        if (titleMatch && titleMatch[1]) {
          noteTitle = titleMatch[1].trim();
        }
      }

      steps.push({
        action: 'type_text',
        value: noteTitle,
        detail: `Fill note title: "${noteTitle}"`,
      });
      steps.push({
        action: 'tap',
        targetName: 'save-note-button',
        detail: 'Save note',
      });

      return {
        replyMessage: `Created and saved note: "${noteTitle}".`,
        reasoning: 'Created new note and saved specified title as instructed.',
        steps,
      };
    }

    return {
      replyMessage: 'Opened Notes app.',
      reasoning: 'Navigated to Notes. No unprompted note creation or edits.',
      steps,
    };
  }

  // 9. SETTINGS APP
  if (pLower.includes('setting') || pLower.includes('dark') || pLower.includes('light') || pLower.includes('theme') || pLower.includes('wifi') || pLower.includes('bluetooth') || pLower.includes('battery') || pLower.includes('power')) {
    const steps: AgentStep[] = [];
    if (currentApp !== 'settings') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'settings',
        detail: 'Open Phone Settings',
      });
    }

    if (pLower.includes('dark') || pLower.includes('light') || pLower.includes('theme')) {
      steps.push({
        action: 'tap',
        targetName: 'settings-darkmode-toggle',
        detail: 'Toggle Dark Mode theme preference',
      });
      return {
        replyMessage: 'Toggled Dark Mode in Settings.',
        reasoning: 'Opened settings and toggled theme switch as requested.',
        steps,
      };
    }

    if (pLower.includes('wifi')) {
      steps.push({
        action: 'tap',
        targetName: 'settings-wifi-toggle',
        detail: 'Toggle Wi-Fi connection switch',
      });
      return {
        replyMessage: 'Toggled Wi-Fi in Settings.',
        reasoning: 'Opened settings and adjusted Wi-Fi as requested.',
        steps,
      };
    }

    if (pLower.includes('bluetooth')) {
      steps.push({
        action: 'tap',
        targetName: 'settings-bluetooth-toggle',
        detail: 'Toggle Bluetooth switch',
      });
      return {
        replyMessage: 'Toggled Bluetooth in Settings.',
        reasoning: 'Opened settings and adjusted Bluetooth as requested.',
        steps,
      };
    }

    if (pLower.includes('power') || pLower.includes('battery')) {
      steps.push({
        action: 'tap',
        targetName: 'settings-power-toggle',
        detail: 'Toggle Low Power Mode switch',
      });
      return {
        replyMessage: 'Toggled Low Power Mode in Settings.',
        reasoning: 'Opened settings and toggled low power switch.',
        steps,
      };
    }

    return {
      replyMessage: 'Opened Settings.',
      reasoning: 'Navigated to Settings. Standing by with zero unprompted changes.',
      steps,
    };
  }

  // 10. BANKING & ENTERPRISE
  if (pLower.includes('bank') || pLower.includes('statement') || pLower.includes('charge') || pLower.includes('quickbook') || pLower.includes('invoice')) {
    const steps: AgentStep[] = [];

    if (pLower.includes('quickbook') || pLower.includes('invoice')) {
      if (currentApp !== 'quickbooks') {
        steps.push({
          action: 'navigate_app',
          targetApp: 'quickbooks',
          detail: 'Open QuickBooks Online',
        });
      }
      if (pLower.includes('send') || pLower.includes('dispatch')) {
        steps.push({
          action: 'tap',
          targetName: 'quickbooks-send-invoice',
          detail: 'Dispatch invoice #INV-2026-104',
        });
        return {
          replyMessage: 'Dispatched QuickBooks invoice.',
          reasoning: 'Navigated to QuickBooks and sent invoice as requested.',
          steps,
        };
      }
      return {
        replyMessage: 'Opened QuickBooks.',
        reasoning: 'Navigated to QuickBooks without unprompted actions.',
        steps,
      };
    }

    if (currentApp !== 'banking') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'banking',
        detail: 'Open Apex Secure Bank',
      });
    }

    if (pLower.includes('export') || pLower.includes('download')) {
      steps.push({
        action: 'tap',
        targetName: 'export-statement-btn',
        detail: 'Export bank statement',
      });
      return {
        replyMessage: 'Exported encrypted bank statement.',
        reasoning: 'Navigated to bank and triggered statement export.',
        steps,
      };
    }

    if (pLower.includes('flag')) {
      steps.push({
        action: 'tap',
        targetName: 'flag-charges-btn',
        detail: 'Flag recurring anomaly charge',
      });
      return {
        replyMessage: 'Flagged recurring anomaly charge in Apex Bank.',
        reasoning: 'Navigated to bank and flagged anomaly charge as requested.',
        steps,
      };
    }

    return {
      replyMessage: 'Opened Apex Secure Bank.',
      reasoning: 'Navigated to banking screen without unprompted transactions.',
      steps,
    };
  }

   // 11. TIKTOK, TINDER & SOCIAL / DATING APPS
  if (pLower.includes('tiktok') || pLower.includes('tinder')) {
    const isTikTok = pLower.includes('tiktok');
    const targetApp = isTikTok ? 'tiktok' : 'tinder';
    const appLabel = isTikTok ? 'TikTok' : 'Tinder';
    const steps: AgentStep[] = [];

    if (currentApp !== targetApp) {
      steps.push({
        action: 'navigate_app',
        targetApp,
        detail: `Open ${appLabel}`,
      });
    }

    if (pLower.includes('like') || pLower.includes('swipe right')) {
      steps.push({
        action: 'tap',
        targetName: 'app-action-toggle',
        detail: isTikTok ? 'Like current TikTok video' : 'Swipe right / Like profile on Tinder',
      });
    } else if (pLower.includes('scroll') || pLower.includes('next')) {
      steps.push({
        action: 'swipe_up',
        distance: 420,
        detail: `Scroll to next item in ${appLabel}`,
      });
    }

    return {
      replyMessage: `Operating ${appLabel} as requested.`,
      reasoning: `Executed ${appLabel} automation directly in isolated sandbox.`,
      steps: steps.length > 0 ? steps : [{ action: 'wait', duration: 150, detail: `${appLabel} ready` }],
    };
  }

  // 12. CRYPTO WALLETS (Read-Only Allowed, Transfers Trigger Guardrails)
  if (
    pLower.includes('crypto') ||
    pLower.includes('wallet') ||
    pLower.includes('metamask') ||
    pLower.includes('binance')
  ) {
    const steps: AgentStep[] = [];
    if (currentApp !== 'cryptowallet') {
      steps.push({
        action: 'navigate_app',
        targetApp: 'cryptowallet',
        detail: 'Open Crypto Wallet',
      });
    }

    if (requiresCryptoGuardrail(prompt)) {
      steps.push({
        action: 'biometric_auth',
        requiresBiometric: true,
        biometricPrompt: 'Biometric verification required before accessing Crypto Wallet signing keys.',
        detail: 'Verify FaceID / TouchID for Crypto Wallet',
      });
      steps.push({
        action: 'guardrail_approval',
        requiresApproval: true,
        guardrailType: 'crypto_transaction',
        approvalDetail: prompt,
        detail: 'Authorize Crypto Wallet Transaction',
      });
      return {
        replyMessage: 'Crypto transaction paused for mandatory Biometric & Zero-Fear Guardrail approval.',
        reasoning: 'High-risk crypto fund movement detected. Enforced security checkpoints before execution.',
        steps,
      };
    }

    return {
      replyMessage: 'Opened Crypto Wallet in safe read-only mode.',
      reasoning: 'Read-only portfolio/price check permitted without transaction risk.',
      steps,
    };
  }
 

  // Default fallback: Return home safely
  return {
    replyMessage: 'Navigating to Home Screen.',
    reasoning: 'Returning device to home screen. Strictly executing requested navigation without extra actions.',
    steps: [
      { action: 'go_home', detail: 'Swipe up to Home Screen' },
    ],
  };
}
