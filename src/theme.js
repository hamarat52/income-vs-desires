/**
 * Temayı boyamadan **önce** uygular.
 *
 * Kalıcı kayıt chrome.storage.sync'te ama o asenkron; sayfa önce aydınlık
 * çizilip sonra karanlığa atlardı. Bu yüzden tercihin bir kopyası localStorage'da
 * tutuluyor ve <head> içinde senkron okunuyor.
 *
 * MV3 satır içi betiğe izin vermediği için ayrı dosya.
 * Varsayılan aydınlık: sistem karanlık olsa bile kullanıcı seçmedikçe değişmez.
 */
(function () {
  'use strict';
  try {
    if (localStorage.getItem('ivd-theme') === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    }
  } catch {
    // localStorage kapalıysa aydınlıkta kal.
  }
})();
