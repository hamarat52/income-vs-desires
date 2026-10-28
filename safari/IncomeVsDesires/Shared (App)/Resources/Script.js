function show(platform, enabled, useSettingsInsteadOfPreferences) {
    document.body.classList.add(`platform-${platform}`);

    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName('platform-mac state-on')[0].innerText = "IncomeVsDesires uzantısı şu anda açık. Safari > Ayarlar > Uzantılar bölümünden kapatabilirsin.";
        document.getElementsByClassName('platform-mac state-off')[0].innerText = "IncomeVsDesires uzantısı şu anda kapalı. Safari > Ayarlar > Uzantılar bölümünden açabilir, ardından web sitelerine izin verebilirsin.";
        document.getElementsByClassName('platform-mac state-unknown')[0].innerText = "IncomeVsDesires uzantısını Safari > Ayarlar > Uzantılar bölümünden açabilirsin.";
        document.getElementsByClassName('platform-mac open-preferences')[0].innerText = "Çık ve Safari Ayarlarını Aç…";
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
