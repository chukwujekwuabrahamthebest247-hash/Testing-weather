/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { InstalledAppItem } from '../../types/phone';
import {
  X,
  Upload,
  Download,
  Package,
  Cpu,
  Sparkles,
  ExternalLink,
  Smartphone,
  Apple,
  Check,
  AlertTriangle,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const ANDROID_PLAY_STORE_URL =
  'https://www.google.com/url?sa=i&source=web&rct=j&url=https://play.google.com&ved=2ahUKEwid65K-tfiXAxWVTkEAHT5iJLwQy_kOeggIAggBCBQQAg&opi=89978449&cd&psig=AOvVaw3w-Vk5B1wYiyq_dbzbpiWx&ust=1794228856034000';

export const IOS_APP_STORE_URL =
  'https://www.google.com/url?sa=i&source=web&rct=j&url=https://apps.apple.com&ved=2ahUKEwid65K-tfiXAxWVTkEAHT5iJLwQy_kOeggIAggBCBQQBA&opi=89978449&cd&psig=AOvVaw3w-Vk5B1wYiyq_dbzbpiWx&ust=1794228856034000';

export const MAX_INSTALLED_APPS = 40;

interface AppInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  phonePlatform: 'android' | 'ios';
  onPlatformChange: (platform: 'android' | 'ios') => void;
  onInstallApp: (app: InstalledAppItem) => void;
  installedCount?: number;
  maxApps?: number;
}

// Curated Google Play Store Apps (Android APK)
const ANDROID_STORE_APPS = [
  {
    id: 'store-youtube',
    name: 'YouTube',
    icon: '▶️',
    bg: 'from-red-600 to-rose-700',
    packageType: 'apk' as const,
    platform: 'android' as const,
    size: '52.4 MB',
    version: 'v19.14.3',
    category: 'Video & Entertainment',
    description: 'Watch video tutorials, music streams, subscribe to channels, and automate video playback.',
  },
  {
    id: 'store-spotify',
    name: 'Spotify',
    icon: '🎧',
    bg: 'from-emerald-500 to-green-700',
    packageType: 'apk' as const,
    platform: 'android' as const,
    size: '41.5 MB',
    version: 'v8.9.18',
    category: 'Music & Audio',
    description: 'Stream global playlists, podcast episodes, search artists, and control audio playback.',
  },
  {
    id: 'store-instagram',
    name: 'Instagram',
    icon: '📸',
    bg: 'from-amber-500 via-rose-600 to-purple-600',
    packageType: 'apk' as const,
    platform: 'android' as const,
    size: '49.8 MB',
    version: 'v325.0',
    category: 'Social Media',
    description: 'Browse photo feeds, automate social engagement, view stories, and post content.',
  },
  {
    id: 'store-netflix',
    name: 'Netflix',
    icon: '🍿',
    bg: 'from-red-700 to-black',
    packageType: 'apk' as const,
    platform: 'android' as const,
    size: '48.0 MB',
    version: 'v8.106.0',
    category: 'Movies & TV',
    description: 'Stream movies, manage watchlists, view trailers, and run automated media searches.',
  },
  {
    id: 'store-uber',
    name: 'Uber',
    icon: '🚗',
    bg: 'from-slate-900 to-black',
    packageType: 'apk' as const,
    platform: 'android' as const,
    size: '62.1 MB',
    version: 'v4.512.0',
    category: 'Travel & Local',
    description: 'Request rides, set pickup and destination points, calculate fares, and track drivers.',
  },
  {
    id: 'store-duolingo',
    name: 'Duolingo',
    icon: '🦉',
    bg: 'from-green-500 to-lime-600',
    packageType: 'apk' as const,
    platform: 'android' as const,
    size: '38.4 MB',
    version: 'v5.132.4',
    category: 'Education',
    description: 'Language learning lessons, vocabulary quizzes, and automated practice drills.',
  },
  {
    id: 'store-canva',
    name: 'Canva',
    icon: '🎨',
    bg: 'from-cyan-500 to-blue-600',
    packageType: 'apk' as const,
    platform: 'android' as const,
    size: '54.7 MB',
    version: 'v2.251.0',
    category: 'Design & Graphics',
    description: 'Create banners, graphics, social posts, and automate layout templates.',
  },
  {
    id: 'store-chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    bg: 'from-teal-600 to-emerald-700',
    packageType: 'apk' as const,
    platform: 'android' as const,
    size: '34.2 MB',
    version: 'v1.2024.08',
    category: 'Productivity',
    description: 'Conversational assistant, writing assistant, code generator, and research helper.',
  },
];

// Curated Apple App Store Apps (iOS IPA)
const IOS_STORE_APPS = [
  {
    id: 'store-applemusic',
    name: 'Apple Music',
    icon: '🎵',
    bg: 'from-rose-500 to-red-600',
    packageType: 'ipa' as const,
    platform: 'ios' as const,
    size: '36.8 MB',
    version: 'v4.7.0',
    category: 'Music & Audio',
    description: 'Lossless audio streaming, curated Spatial Audio playlists, and Apple Music Radio.',
  },
  {
    id: 'store-procreate',
    name: 'Procreate Pocket',
    icon: '🖌️',
    bg: 'from-purple-600 via-pink-600 to-amber-500',
    packageType: 'ipa' as const,
    platform: 'ios' as const,
    size: '72.3 MB',
    version: 'v4.0.9',
    category: 'Digital Art',
    description: 'Mobile digital painting, brushes, high-res canvases, and layered artwork studio.',
  },
  {
    id: 'store-flighty',
    name: 'Flighty iOS',
    icon: '✈️',
    bg: 'from-sky-500 to-blue-700',
    packageType: 'ipa' as const,
    platform: 'ios' as const,
    size: '29.4 MB',
    version: 'v3.2.1',
    category: 'Travel & Navigation',
    description: 'Live flight tracker with radar maps, delay predictions, and gate change alerts.',
  },
  {
    id: 'store-things3',
    name: 'Things 3',
    icon: '📋',
    bg: 'from-blue-600 to-indigo-800',
    packageType: 'ipa' as const,
    platform: 'ios' as const,
    size: '24.1 MB',
    version: 'v3.19.4',
    category: 'Productivity',
    description: 'Award-winning task manager, daily planner, project milestone tracking, and checklists.',
  },
  {
    id: 'store-youtube-ios',
    name: 'YouTube iOS',
    icon: '▶️',
    bg: 'from-red-600 to-rose-700',
    packageType: 'ipa' as const,
    platform: 'ios' as const,
    size: '64.2 MB',
    version: 'v19.15.1',
    category: 'Video & Entertainment',
    description: 'Watch video tutorials, music streams, subscribe to channels, and automate video playback.',
  },
  {
    id: 'store-instagram-ios',
    name: 'Instagram iOS',
    icon: '📸',
    bg: 'from-amber-500 via-rose-600 to-purple-600',
    packageType: 'ipa' as const,
    platform: 'ios' as const,
    size: '58.3 MB',
    version: 'v326.1',
    category: 'Social Media',
    description: 'Apple iOS edition with metal graphics acceleration, reels, stories, and feed interaction.',
  },
  {
    id: 'store-spotify-ios',
    name: 'Spotify iOS',
    icon: '🎧',
    bg: 'from-emerald-500 to-green-700',
    packageType: 'ipa' as const,
    platform: 'ios' as const,
    size: '46.0 MB',
    version: 'v8.9.22',
    category: 'Music & Audio',
    description: 'Stream global playlists, podcast episodes, search artists, and control audio playback.',
  },
  {
    id: 'store-chatgpt-ios',
    name: 'ChatGPT iOS',
    icon: '🤖',
    bg: 'from-teal-600 to-emerald-700',
    packageType: 'ipa' as const,
    platform: 'ios' as const,
    size: '39.0 MB',
    version: 'v1.2024.11',
    category: 'Productivity',
    description: 'Native iOS assistant with Whisper voice input and responsive automation targets.',
  },
];

const EMOJI_ICONS = ['📱', '💬', '🎵', '📹', '🛒', '⚡', '🚀', '💻', '📊', '🛡️', '🌐', '📦', '🍔', '📷', '📚', '🤖'];

export const AppInstallerModal: React.FC<AppInstallerModalProps> = ({
  isOpen,
  onClose,
  phonePlatform,
  onPlatformChange,
  onInstallApp,
  installedCount = 0,
  maxApps = MAX_INSTALLED_APPS,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'upload' | 'url'>('store');

  const isLimitReached = installedCount >= maxApps;

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [customAppName, setCustomAppName] = useState('');
  const [customIcon, setCustomIcon] = useState('📦');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Store Direct Install State
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeCustomUrlOrName, setStoreCustomUrlOrName] = useState('');

  // Installation Animation State
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStage, setInstallStage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentStoreUrl = phonePlatform === 'android' ? ANDROID_PLAY_STORE_URL : IOS_APP_STORE_URL;
  const storeTitle = phonePlatform === 'android' ? 'Google Play Store' : 'Apple App Store';
  const packageExtension = phonePlatform === 'android' ? '.apk' : '.ipa';

  const handlePlatformSwitch = (newPlatform: 'android' | 'ios') => {
    if (newPlatform === phonePlatform) return;
    onPlatformChange(newPlatform);
    setUploadedFile(null);
    setUploadError(null);
    sounds.playTap();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    setUploadError(null);

    if (phonePlatform === 'android') {
      const isAndroidFormat =
        lowerName.endsWith('.apk') || lowerName.endsWith('.xapk') || lowerName.endsWith('.aab');
      if (!isAndroidFormat) {
        setUploadError(
          `Incompatible file for Android! You can only upload Android packages (.apk, .xapk, .aab). iOS files are not allowed.`
        );
        sounds.playNotification();
        return;
      }
    } else {
      const isIosFormat =
        lowerName.endsWith('.ipa') || lowerName.endsWith('.app') || lowerName.endsWith('.zip');
      if (!isIosFormat) {
        setUploadError(
          `Incompatible file for iOS! You can only upload Apple iOS packages (.ipa, .app). Android APKs are not allowed.`
        );
        sounds.playNotification();
        return;
      }
    }

    setUploadedFile(file);
    const cleanName = file.name.replace(/\.(apk|ipa|xapk|aab|app|zip)$/i, '');
    setCustomAppName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    setCustomIcon(phonePlatform === 'android' ? '🤖' : '🍎');
    sounds.playTap();
  };

  const executeInstall = async (appData: InstalledAppItem) => {
    if (isLimitReached) {
      setUploadError(
        `Storage capacity reached! Maximum limit of ${maxApps} installed apps reached (${installedCount}/${maxApps}). Please uninstall an existing app first.`
      );
      sounds.playNotification();
      return;
    }

    setIsInstalling(true);
    setInstallProgress(10);
    setInstallStage(
      phonePlatform === 'android'
        ? 'Connecting to Android Package Manager (pm install)...'
        : 'Connecting to Apple MobileInstallation (Darwin/Mach)...'
    );
    sounds.playTap();

    await new Promise((r) => setTimeout(r, 280));
    setInstallProgress(40);
    setInstallStage(
      phonePlatform === 'android'
        ? 'Verifying Android 15 ART bytecode & DEX compilation...'
        : 'Verifying Apple FairPlay DRM & iOS 18 Metal runtime signature...'
    );

    await new Promise((r) => setTimeout(r, 320));
    setInstallProgress(75);
    setInstallStage('Extracting app resources, assets, & declaring intents...');

    await new Promise((r) => setTimeout(r, 260));
    setInstallProgress(95);
    setInstallStage('Registering application icon to springboard...');

    await new Promise((r) => setTimeout(r, 220));
    setInstallProgress(100);
    setInstallStage('✓ Installation successful! Ready for AI automation.');
    sounds.playSuccess();

    await new Promise((r) => setTimeout(r, 280));
    setIsInstalling(false);
    onInstallApp(appData);
    onClose();
  };

  const handleInstallUploaded = () => {
    if (!uploadedFile) {
      setUploadError('Please select a file to install.');
      return;
    }

    const name = customAppName.trim() || uploadedFile.name.replace(/\.[^/.]+$/, '') || 'Custom App';
    const id = `installed-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const size = `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`;

    executeInstall({
      id,
      name,
      icon: customIcon,
      bg:
        phonePlatform === 'android'
          ? 'from-emerald-600 via-teal-600 to-green-700'
          : 'from-blue-600 via-indigo-600 to-purple-700',
      packageType: phonePlatform === 'android' ? 'apk' : 'ipa',
      platform: phonePlatform,
      size,
      version: 'v1.0.0-sideload',
      description: `Sideloaded ${phonePlatform.toUpperCase()} package (${name}) running inside isolated sandbox. Fully ready for AI automation.`,
      isCustom: true,
    });
  };

  const handleInstallStoreApp = (
    storeApp: (typeof ANDROID_STORE_APPS)[0] | (typeof IOS_STORE_APPS)[0]
  ) => {
    executeInstall({
      id: `${storeApp.id}-${Date.now()}`,
      name: storeApp.name,
      icon: storeApp.icon,
      bg: storeApp.bg,
      packageType: storeApp.packageType,
      platform: storeApp.platform,
      size: storeApp.size,
      version: storeApp.version,
      description: storeApp.description,
      storeUrl: currentStoreUrl,
      isCustom: true,
    });
  };

  const handleInstallCustomStoreInput = () => {
    const input = storeCustomUrlOrName.trim();
    if (!input) return;

    let appName = input;
    if (input.includes('play.google.com') || input.includes('apps.apple.com') || input.includes('http')) {
      try {
        const urlObj = new URL(input);
        const idParam = urlObj.searchParams.get('id');
        if (idParam) {
          appName = idParam.split('.').pop() || 'Store App';
        } else {
          appName = urlObj.pathname.split('/').filter(Boolean).pop() || 'Store App';
        }
      } catch {
        appName = 'Downloaded App';
      }
    }
    appName = appName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const id = `store-custom-${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    executeInstall({
      id,
      name: appName,
      icon: phonePlatform === 'android' ? '🤖' : '🍎',
      bg:
        phonePlatform === 'android'
          ? 'from-teal-600 via-emerald-600 to-cyan-700'
          : 'from-indigo-600 via-purple-600 to-pink-700',
      packageType: phonePlatform === 'android' ? 'apk' : 'ipa',
      platform: phonePlatform,
      size: '45.0 MB',
      version: 'v1.0.0',
      description: `Downloaded from ${storeTitle} (${input}). Ready for prompt-driven AI automation.`,
      storeUrl: input.startsWith('http') ? input : currentStoreUrl,
      isCustom: true,
    });
  };

  const availableCatalog = phonePlatform === 'android' ? ANDROID_STORE_APPS : IOS_STORE_APPS;
  const filteredCatalog = availableCatalog.filter(
    (app) =>
      app.name.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(storeSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-md ${
                phonePlatform === 'android'
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950'
                  : 'bg-gradient-to-tr from-blue-500 to-indigo-500 text-white'
              }`}
            >
              {phonePlatform === 'android' ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Apple className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                <span>App Installer & Store Hub</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase ${
                    phonePlatform === 'android'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {phonePlatform === 'android' ? 'Android (APK)' : 'iOS (IPA)'}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    isLimitReached
                      ? 'bg-rose-950/90 text-rose-300 border-rose-500/60 animate-pulse'
                      : installedCount >= maxApps - 5
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {installedCount}/{maxApps} Apps {isLimitReached ? '(MAX REACHED)' : '(Max 40)'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Install apps from official stores or upload packages (Maximum limit: {maxApps} apps)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Switch (Android vs iOS) */}
        <div className="px-5 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">
              Select Phone Platform (The selected platform stands):
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono">
              Switching uninstalls incompatible apps
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePlatformSwitch('android')}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                phonePlatform === 'android'
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Android (.apk / .xapk)</span>
              {phonePlatform === 'android' && (
                <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handlePlatformSwitch('ios')}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                phonePlatform === 'ios'
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm ring-1 ring-blue-500/50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Apple className="w-4 h-4 text-blue-400" />
              <span>Apple iOS (.ipa / .app)</span>
              {phonePlatform === 'ios' && (
                <Check className="w-3.5 h-3.5 text-blue-400 ml-auto" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-2 text-xs bg-slate-900/50">
          <button
            onClick={() => setActiveTab('store')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'store'
                ? phonePlatform === 'android'
                  ? 'border-emerald-400 text-emerald-300 font-bold'
                  : 'border-blue-400 text-blue-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get Apps ({storeTitle})</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? phonePlatform === 'android'
                  ? 'border-emerald-400 text-emerald-300 font-bold'
                  : 'border-blue-400 text-blue-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload {packageExtension.toUpperCase()} File</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? phonePlatform === 'android'
                  ? 'border-emerald-400 text-emerald-300 font-bold'
                  : 'border-blue-400 text-blue-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install by URL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {/* Ongoing Install Progress Overlay */}
          {isInstalling ? (
            <div className="py-8 space-y-4 text-center">
              <div
                className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center animate-pulse ${
                  phonePlatform === 'android'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                }`}
              >
                <Cpu className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">Installing Application...</h4>
                <p className="text-xs text-slate-400">{installStage}</p>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    phonePlatform === 'android'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-400'
                  }`}
                  style={{ width: `${installProgress}%` }}
                />
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  phonePlatform === 'android' ? 'text-emerald-400' : 'text-blue-400'
                }`}
              >
                {installProgress}%
              </span>
            </div>
          ) : (
            <>
              {/* Maximum 40 Apps Limit Alert Banner */}
              {isLimitReached && (
                <div className="bg-rose-950/70 border border-rose-800/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-rose-200 mb-4 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-rose-100">
                      Maximum Limit of {maxApps} Installed Apps Reached ({installedCount}/{maxApps})
                    </p>
                    <p className="text-[11px] text-rose-300/90 leading-relaxed">
                      The phone simulator restricts installations to a maximum of {maxApps} apps whether via Android APK, Apple iOS IPA, or Store downloads. Please uninstall an existing app from the phone to free up space.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: GET APPS / OFFICIAL STORE HUB */}
              {activeTab === 'store' && (
                <div className="space-y-4">
                  {/* Official Store Card with the user's specific store links */}
                  <div
                    className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      phonePlatform === 'android'
                        ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border-emerald-500/40'
                        : 'bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border-blue-500/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {phonePlatform === 'android' ? (
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Apple className="w-4 h-4 text-blue-400" />
                        )}
                        <h4 className="font-bold text-xs text-white">
                          Official {storeTitle} Link
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {phonePlatform === 'android'
                          ? 'Browse Google Play Store to discover apps or download APKs for the phone.'
                          : 'Browse Apple App Store to discover iOS apps or download IPAs for the phone.'}
                      </p>
                    </div>

                    {/* Prominent GET APPS Button */}
                    <a
                      href={currentStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 shrink-0 transition hover:scale-105 active:scale-95 ${
                        phonePlatform === 'android'
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Get Apps</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  </div>

                  {/* Install by Store URL or App Name */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Download & Install Any App from Store Link or Name:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={storeCustomUrlOrName}
                        onChange={(e) => setStoreCustomUrlOrName(e.target.value)}
                        placeholder={
                          phonePlatform === 'android'
                            ? 'Paste Google Play link or type app name (e.g. YouTube, Spotify)'
                            : 'Paste App Store link or type app name (e.g. Procreate, Things 3)'
                        }
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleInstallCustomStoreInput();
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleInstallCustomStoreInput}
                        disabled={isLimitReached || !storeCustomUrlOrName.trim()}
                        className={`px-3 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          isLimitReached
                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                            : phonePlatform === 'android'
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isLimitReached ? `Limit (${maxApps}/${maxApps})` : 'Install to Phone'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Store Catalog Header & Search */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          1-Click Install Catalog ({filteredCatalog.length})
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {phonePlatform === 'android' ? 'Android APKs' : 'Apple IPAs'}
                        </span>
                      </div>
                      <div className="relative w-40">
                        <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={storeSearchQuery}
                          onChange={(e) => setStoreSearchQuery(e.target.value)}
                          placeholder="Filter apps..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[11px] text-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Apps Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredCatalog.map((app) => (
                        <div
                          key={app.id}
                          className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 group transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${app.bg} flex items-center justify-center text-lg shrink-0 shadow-sm`}
                            >
                              {app.icon}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-white truncate">{app.name}</h5>
                              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                                <span
                                  className={`font-bold uppercase ${
                                    phonePlatform === 'android' ? 'text-emerald-400' : 'text-blue-400'
                                  }`}
                                >
                                  {app.packageType}
                                </span>
                                <span>•</span>
                                <span>{app.size}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleInstallStoreApp(app)}
                            disabled={isLimitReached}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white flex items-center gap-1 transition shrink-0 active:scale-95 cursor-pointer ${
                              isLimitReached
                                ? 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                                : phonePlatform === 'android'
                                ? 'bg-emerald-600/90 hover:bg-emerald-500'
                                : 'bg-blue-600/90 hover:bg-blue-500'
                            }`}
                            title={isLimitReached ? `Maximum limit of ${maxApps} apps reached` : `Install ${app.name}`}
                          >
                            <Download className="w-3 h-3" />
                            <span>{isLimitReached ? 'Full (40/40)' : 'Install'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD FILE (Platform-Restricted) */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={phonePlatform === 'android' ? '.apk,.xapk,.aab' : '.ipa,.app'}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Warning Notice about Platform Compatibility */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                    <ShieldCheck
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        phonePlatform === 'android' ? 'text-emerald-400' : 'text-blue-400'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-slate-200">
                        {phonePlatform === 'android'
                          ? 'Android Mode Active: Only .apk / .xapk / .aab files are allowed.'
                          : 'Apple iOS Mode Active: Only .ipa / .app files are allowed.'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Incompatible packages for the other OS are automatically rejected.
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Drag and Drop Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/60 hover:bg-slate-950 group space-y-2 ${
                      phonePlatform === 'android'
                        ? 'border-emerald-500/40 hover:border-emerald-500'
                        : 'border-blue-500/40 hover:border-blue-500'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center group-hover:scale-110 transition border ${
                        phonePlatform === 'android'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {uploadedFile
                          ? uploadedFile.name
                          : `Click or drop any ${phonePlatform === 'android' ? 'Android APK' : 'Apple iOS IPA'} file here`}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {phonePlatform === 'android'
                          ? 'Allowed formats: .apk, .xapk, .aab'
                          : 'Allowed formats: .ipa, .app'}
                      </p>
                    </div>
                    {uploadedFile && (
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                          {phonePlatform === 'android' ? 'Android APK' : 'iOS IPA'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* App Configuration Details */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Application Display Name
                      </label>
                      <input
                        type="text"
                        value={customAppName}
                        onChange={(e) => setCustomAppName(e.target.value)}
                        placeholder={`e.g. My ${phonePlatform === 'android' ? 'Android' : 'iOS'} App`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Platform Format
                        </label>
                        <div
                          className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                            phonePlatform === 'android'
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                              : 'bg-blue-950/40 border-blue-500/50 text-blue-300'
                          }`}
                        >
                          {phonePlatform === 'android' ? (
                            <Smartphone className="w-3.5 h-3.5" />
                          ) : (
                            <Apple className="w-3.5 h-3.5" />
                          )}
                          <span>{phonePlatform === 'android' ? 'Android APK' : 'Apple IPA'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          App Icon
                        </label>
                        <div className="flex gap-1 overflow-x-auto pb-1">
                          {EMOJI_ICONS.slice(0, 7).map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setCustomIcon(emoji)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border shrink-0 transition cursor-pointer ${
                                customIcon === emoji
                                  ? phonePlatform === 'android'
                                    ? 'bg-emerald-600 border-emerald-400 text-white'
                                    : 'bg-blue-600 border-blue-400 text-white'
                                  : 'bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleInstallUploaded}
                      disabled={isLimitReached || !uploadedFile}
                      className={`w-full py-2.5 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isLimitReached
                          ? 'bg-slate-800 text-slate-400'
                          : phonePlatform === 'android'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>
                        {isLimitReached
                          ? `Max Limit Reached (${maxApps}/${maxApps} Apps)`
                          : `Install & Sideload to ${phonePlatform === 'android' ? 'Android' : 'iOS'}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: DOWNLOAD VIA URL */}
              {activeTab === 'url' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {phonePlatform === 'android' ? 'Android APK' : 'Apple IPA'} Download URL
                    </label>
                    <input
                      type="url"
                      value={storeCustomUrlOrName}
                      onChange={(e) => setStoreCustomUrlOrName(e.target.value)}
                      placeholder={
                        phonePlatform === 'android'
                          ? 'https://example.com/downloads/package.apk'
                          : 'https://example.com/downloads/package.ipa'
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      App Label Name
                    </label>
                    <input
                      type="text"
                      value={customAppName}
                      onChange={(e) => setCustomAppName(e.target.value)}
                      placeholder="e.g. Remote Downloaded App"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleInstallCustomStoreInput}
                    disabled={isLimitReached || !storeCustomUrlOrName.trim()}
                    className={`w-full py-2.5 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                      isLimitReached
                        ? 'bg-slate-800 text-slate-400'
                        : phonePlatform === 'android'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isLimitReached
                        ? `Max Limit Reached (${maxApps}/${maxApps} Apps)`
                        : 'Download & Sideload'}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
