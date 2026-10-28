// Kapsayıcı uygulamanın açılış metni. Uzantı _locales kullanıyor; bu sayfa
// uzantı değil, uygulamanın kendi WKWebView'ı — o yüzden metinler burada.
// Dil: navigator.language "tr" ile başlıyorsa Türkçe, değilse İngilizce
// (uzantının default_locale'i ile aynı kural).
const STRINGS = {
    tr: {
        iconAlt: "IncomeVsDesires simgesi",
        ios: "IncomeVsDesires bir Safari uzantısıdır. Açmak için Ayarlar > Uygulamalar > Safari > Uzantılar bölümüne git (iOS 17’de: Ayarlar > Safari > Uzantılar), IncomeVsDesires’ı aç ve web sitelerine izin ver.",
        macUnknown: "IncomeVsDesires uzantısını Safari > Tercihler > Uzantılar bölümünden açabilirsin.",
        macOn: "IncomeVsDesires uzantısı şu anda açık. Safari > Tercihler > Uzantılar bölümünden kapatabilirsin.",
        macOff: "IncomeVsDesires uzantısı şu anda kapalı. Safari > Tercihler > Uzantılar bölümünden açabilir, ardından web sitelerine izin verebilirsin.",
        openPreferences: "Çık ve Safari Uzantı Tercihlerini Aç…",
        // macOS 13+ "Tercihler" yerine "Ayarlar" diyor.
        macUnknownSettings: "IncomeVsDesires uzantısını Safari > Ayarlar > Uzantılar bölümünden açabilirsin.",
        macOnSettings: "IncomeVsDesires uzantısı şu anda açık. Safari > Ayarlar > Uzantılar bölümünden kapatabilirsin.",
        macOffSettings: "IncomeVsDesires uzantısı şu anda kapalı. Safari > Ayarlar > Uzantılar bölümünden açabilir, ardından web sitelerine izin verebilirsin.",
        openPreferencesSettings: "Çık ve Safari Ayarlarını Aç…",
    },
    en: {
        iconAlt: "IncomeVsDesires icon",
        ios: "IncomeVsDesires is a Safari extension. To turn it on, go to Settings > Apps > Safari > Extensions (on iOS 17: Settings > Safari > Extensions), turn on IncomeVsDesires and allow it on websites.",
        macUnknown: "You can turn on IncomeVsDesires in Safari > Preferences > Extensions.",
        macOn: "IncomeVsDesires is currently on. You can turn it off in Safari > Preferences > Extensions.",
        macOff: "IncomeVsDesires is currently off. You can turn it on in Safari > Preferences > Extensions, then allow it on websites.",
        openPreferences: "Quit and Open Safari Extensions Preferences…",
        macUnknownSettings: "You can turn on IncomeVsDesires in Safari > Settings > Extensions.",
        macOnSettings: "IncomeVsDesires is currently on. You can turn it off in Safari > Settings > Extensions.",
        macOffSettings: "IncomeVsDesires is currently off. You can turn it on in Safari > Settings > Extensions, then allow it on websites.",
        openPreferencesSettings: "Quit and Open Safari Settings…",
    },
};

const LANG = /^tr\b/i.test(navigator.language || "") ? "tr" : "en";
const TEXT = STRINGS[LANG];

document.documentElement.lang = LANG;
document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.innerText = TEXT[el.dataset.i18n];
});
document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.alt = TEXT[el.dataset.i18nAlt];
});

function show(platform, enabled, useSettingsInsteadOfPreferences) {
    document.body.classList.add(`platform-${platform}`);

    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName('platform-mac state-on')[0].innerText = TEXT.macOnSettings;
        document.getElementsByClassName('platform-mac state-off')[0].innerText = TEXT.macOffSettings;
        document.getElementsByClassName('platform-mac state-unknown')[0].innerText = TEXT.macUnknownSettings;
        document.getElementsByClassName('platform-mac open-preferences')[0].innerText = TEXT.openPreferencesSettings;
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

document.querySelector("button.open-preferences").addEventListener("click", openPreferences);
