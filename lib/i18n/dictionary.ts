export const en = {
  "common.loading":"Loading…", "common.search":"Search", "common.cancel":"Cancel", "common.save":"Save",
  "navigation.home":"Home", "navigation.meet":"Meet", "navigation.chats":"Chats", "navigation.profile":"Profile",
  "settings.title":"Settings", "settings.subtitle":"Personalize the app for you.", "settings.appearance":"Appearance",
  "settings.language":"Language", "settings.notifications":"Notifications", "settings.blacklist":"Blocked users",
  "theme.system":"System", "theme.systemHint":"Like your device", "theme.light":"Light", "theme.lightHint":"Always light",
  "theme.dark":"Dark", "theme.darkHint":"Always dark", "language.search":"Search languages…", "language.current":"Current language",
  "home.loading":"Loading…", "home.tagline":"Find your energy 💙", "home.login":"Continue with Telegram",
  "home.terms":"By continuing, you accept", "home.termsLinks":"Terms of Use and Privacy Policy", "home.online":"Online", "home.recently":"Recently",
  "profile.about":"About", "profile.interests":"Interests", "profile.location":"Location", "profile.photos":"photos",
  "profile.actions":"Actions", "profile.report":"Report", "profile.block":"Block", "profile.reportTitle":"Report profile",
  "profile.reportSubmit":"Send report", "profile.noCity":"City not specified",
  "notifications.newMessage":"New message", "notifications.meetingPrefix":"Meeting",
  "notifications.requestAccepted":"Request accepted", "notifications.requestRejected":"Request rejected",
  "notifications.chatAvailable":"The meeting chat is now available.", "notifications.requestRejectedText":"The organizer declined the request.",
  "notifications.newLike":"New like", "notifications.newLikeText":"Someone liked your profile.",
  "notifications.newMatch":"New match", "notifications.newMatchText":"You can start chatting now.",
  "notifications.meetCancelled":"Meeting cancelled", "notifications.meetCancelledText":"The organizer cancelled the meeting.",
  "notifications.meetChanged":"Meeting changed", "notifications.newTime":"New time", "notifications.newPlace":"New place",
  "notifications.placePending":"to be confirmed", "notifications.newRequest":"New meeting request",
  "notifications.newRequestText":"A new request was received.", "notifications.participantJoined":"New meeting participant",
  "notifications.participantLeft":"A participant left the meeting", "notifications.participantJoinedText":"A participant joined the meeting.",
  "notifications.participantLeftText":"A participant left the meeting.", "notifications.meetSoon":"Meeting starts soon",
  "notifications.meetSoonText":"Starts in 30 minutes.", "notifications.meetEnded":"Meeting ended",
} as const;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey,string>;
type DictionaryOverride = Partial<Dictionary>;

const ru:Dictionary = {
  "common.loading":"Загрузка…", "common.search":"Поиск", "common.cancel":"Отмена", "common.save":"Сохранить",
  "navigation.home":"Главная", "navigation.meet":"Встречи", "navigation.chats":"Чаты", "navigation.profile":"Профиль",
  "settings.title":"Настройки", "settings.subtitle":"Персонализируйте приложение под себя.", "settings.appearance":"Оформление",
  "settings.language":"Язык", "settings.notifications":"Уведомления", "settings.blacklist":"Чёрный список",
  "theme.system":"Системная", "theme.systemHint":"Как на устройстве", "theme.light":"Светлая", "theme.lightHint":"Всегда светлая",
  "theme.dark":"Тёмная", "theme.darkHint":"Всегда тёмная", "language.search":"Поиск языка…", "language.current":"Текущий язык",
  "home.loading":"Загрузка…", "home.tagline":"Найди свою энергию 💙", "home.login":"Войти через Telegram",
  "home.terms":"Продолжая, вы принимаете", "home.termsLinks":"Условия использования и Политику конфиденциальности", "home.online":"Онлайн", "home.recently":"Был недавно",
  "profile.about":"О себе", "profile.interests":"Интересы", "profile.location":"Расположение", "profile.photos":"фото",
  "profile.actions":"Действия", "profile.report":"Пожаловаться", "profile.block":"Заблокировать", "profile.reportTitle":"Пожаловаться",
  "profile.reportSubmit":"Отправить жалобу", "profile.noCity":"Город не указан",
  "notifications.newMessage":"Новое сообщение", "notifications.meetingPrefix":"Встреча",
  "notifications.requestAccepted":"Заявка принята", "notifications.requestRejected":"Заявка отклонена",
  "notifications.chatAvailable":"Теперь вам доступен чат встречи.", "notifications.requestRejectedText":"Организатор отклонил заявку.",
  "notifications.newLike":"Новый лайк", "notifications.newLikeText":"Кому-то понравился ваш профиль.",
  "notifications.newMatch":"Новое совпадение", "notifications.newMatchText":"Теперь можно начать общение.",
  "notifications.meetCancelled":"Встреча отменена", "notifications.meetCancelledText":"Организатор отменил встречу.",
  "notifications.meetChanged":"Встреча изменена", "notifications.newTime":"Новое время", "notifications.newPlace":"Новое место",
  "notifications.placePending":"уточняется", "notifications.newRequest":"Новая заявка на встречу",
  "notifications.newRequestText":"Поступила новая заявка.", "notifications.participantJoined":"Новый участник встречи",
  "notifications.participantLeft":"Участник покинул встречу", "notifications.participantJoinedText":"К встрече присоединился участник.",
  "notifications.participantLeftText":"Участник вышел из встречи.", "notifications.meetSoon":"Встреча скоро начнётся",
  "notifications.meetSoonText":"Начнётся через 30 минут.", "notifications.meetEnded":"Встреча завершилась",
};

const be:Dictionary = {...en,"navigation.home":"Галоўная","navigation.meet":"Сустрэчы","navigation.chats":"Чаты","navigation.profile":"Профіль","settings.title":"Налады","settings.language":"Мова","profile.about":"Пра сябе","profile.interests":"Інтарэсы","profile.location":"Месцазнаходжанне"};
const uk:Dictionary = {...en,"navigation.home":"Головна","navigation.meet":"Зустрічі","navigation.chats":"Чати","navigation.profile":"Профіль","settings.title":"Налаштування","settings.language":"Мова","profile.about":"Про себе","profile.interests":"Інтереси","profile.location":"Розташування"};

const core:Record<string,DictionaryOverride> = {
  pl:{"navigation.home":"Główna","navigation.meet":"Spotkania","navigation.chats":"Czaty","navigation.profile":"Profil","settings.title":"Ustawienia","settings.language":"Język","settings.appearance":"Wygląd"},
  de:{"navigation.home":"Start","navigation.meet":"Treffen","navigation.chats":"Chats","navigation.profile":"Profil","settings.title":"Einstellungen","settings.language":"Sprache","settings.appearance":"Darstellung"},
  fr:{"navigation.home":"Accueil","navigation.meet":"Rencontres","navigation.chats":"Discussions","navigation.profile":"Profil","settings.title":"Paramètres","settings.language":"Langue","settings.appearance":"Apparence"},
  es:{"navigation.home":"Inicio","navigation.meet":"Encuentros","navigation.chats":"Chats","navigation.profile":"Perfil","settings.title":"Ajustes","settings.language":"Idioma","settings.appearance":"Apariencia"},
  it:{"navigation.home":"Home","navigation.meet":"Incontri","navigation.chats":"Chat","navigation.profile":"Profilo","settings.title":"Impostazioni","settings.language":"Lingua","settings.appearance":"Aspetto"},
  pt:{"navigation.home":"Início","navigation.meet":"Encontros","navigation.chats":"Conversas","navigation.profile":"Perfil","settings.title":"Definições","settings.language":"Idioma","settings.appearance":"Aparência"},
  nl:{"navigation.home":"Home","navigation.meet":"Ontmoeten","navigation.chats":"Chats","navigation.profile":"Profiel","settings.title":"Instellingen","settings.language":"Taal","settings.appearance":"Weergave"},
  cs:{"navigation.home":"Domů","navigation.meet":"Setkání","navigation.chats":"Chaty","navigation.profile":"Profil","settings.title":"Nastavení","settings.language":"Jazyk","settings.appearance":"Vzhled"},
  sk:{"navigation.home":"Domov","navigation.meet":"Stretnutia","navigation.chats":"Chaty","navigation.profile":"Profil","settings.title":"Nastavenia","settings.language":"Jazyk","settings.appearance":"Vzhľad"},
  hu:{"navigation.home":"Kezdőlap","navigation.meet":"Találkozók","navigation.chats":"Csevegések","navigation.profile":"Profil","settings.title":"Beállítások","settings.language":"Nyelv","settings.appearance":"Megjelenés"},
  ro:{"navigation.home":"Acasă","navigation.meet":"Întâlniri","navigation.chats":"Conversații","navigation.profile":"Profil","settings.title":"Setări","settings.language":"Limbă","settings.appearance":"Aspect"},
  bg:{"navigation.home":"Начало","navigation.meet":"Срещи","navigation.chats":"Чатове","navigation.profile":"Профил","settings.title":"Настройки","settings.language":"Език","settings.appearance":"Облик"},
  el:{"navigation.home":"Αρχική","navigation.meet":"Συναντήσεις","navigation.chats":"Συνομιλίες","navigation.profile":"Προφίλ","settings.title":"Ρυθμίσεις","settings.language":"Γλώσσα","settings.appearance":"Εμφάνιση"},
  sr:{"navigation.home":"Početna","navigation.meet":"Susreti","navigation.chats":"Ćaskanja","navigation.profile":"Profil","settings.title":"Podešavanja","settings.language":"Jezik","settings.appearance":"Izgled"},
  hr:{"navigation.home":"Početna","navigation.meet":"Susreti","navigation.chats":"Razgovori","navigation.profile":"Profil","settings.title":"Postavke","settings.language":"Jezik","settings.appearance":"Izgled"},
  sl:{"navigation.home":"Domov","navigation.meet":"Srečanja","navigation.chats":"Klepeti","navigation.profile":"Profil","settings.title":"Nastavitve","settings.language":"Jezik","settings.appearance":"Videz"},
  lt:{"navigation.home":"Pradžia","navigation.meet":"Susitikimai","navigation.chats":"Pokalbiai","navigation.profile":"Profilis","settings.title":"Nustatymai","settings.language":"Kalba","settings.appearance":"Išvaizda"},
  lv:{"navigation.home":"Sākums","navigation.meet":"Tikšanās","navigation.chats":"Tērzēšanas","navigation.profile":"Profils","settings.title":"Iestatījumi","settings.language":"Valoda","settings.appearance":"Izskats"},
  et:{"navigation.home":"Avaleht","navigation.meet":"Kohtumised","navigation.chats":"Vestlused","navigation.profile":"Profiil","settings.title":"Seaded","settings.language":"Keel","settings.appearance":"Välimus"},
  sv:{"navigation.home":"Hem","navigation.meet":"Träffar","navigation.chats":"Chattar","navigation.profile":"Profil","settings.title":"Inställningar","settings.language":"Språk","settings.appearance":"Utseende"},
  no:{"navigation.home":"Hjem","navigation.meet":"Møter","navigation.chats":"Chatter","navigation.profile":"Profil","settings.title":"Innstillinger","settings.language":"Språk","settings.appearance":"Utseende"},
  da:{"navigation.home":"Hjem","navigation.meet":"Møder","navigation.chats":"Chats","navigation.profile":"Profil","settings.title":"Indstillinger","settings.language":"Sprog","settings.appearance":"Udseende"},
  fi:{"navigation.home":"Koti","navigation.meet":"Tapaamiset","navigation.chats":"Keskustelut","navigation.profile":"Profiili","settings.title":"Asetukset","settings.language":"Kieli","settings.appearance":"Ulkoasu"},
  tr:{"navigation.home":"Ana Sayfa","navigation.meet":"Buluşmalar","navigation.chats":"Sohbetler","navigation.profile":"Profil","settings.title":"Ayarlar","settings.language":"Dil","settings.appearance":"Görünüm"},
  ar:{"navigation.home":"الرئيسية","navigation.meet":"اللقاءات","navigation.chats":"الدردشات","navigation.profile":"الملف","settings.title":"الإعدادات","settings.language":"اللغة","settings.appearance":"المظهر"},
  he:{"navigation.home":"בית","navigation.meet":"מפגשים","navigation.chats":"שיחות","navigation.profile":"פרופיל","settings.title":"הגדרות","settings.language":"שפה","settings.appearance":"מראה"},
  fa:{"navigation.home":"خانه","navigation.meet":"دیدارها","navigation.chats":"گفتگوها","navigation.profile":"نمایه","settings.title":"تنظیمات","settings.language":"زبان","settings.appearance":"ظاهر"},
  hi:{"navigation.home":"होम","navigation.meet":"मुलाकातें","navigation.chats":"चैट","navigation.profile":"प्रोफ़ाइल","settings.title":"सेटिंग्स","settings.language":"भाषा","settings.appearance":"रूप"},
  id:{"navigation.home":"Beranda","navigation.meet":"Pertemuan","navigation.chats":"Obrolan","navigation.profile":"Profil","settings.title":"Pengaturan","settings.language":"Bahasa","settings.appearance":"Tampilan"},
  ms:{"navigation.home":"Utama","navigation.meet":"Pertemuan","navigation.chats":"Sembang","navigation.profile":"Profil","settings.title":"Tetapan","settings.language":"Bahasa","settings.appearance":"Paparan"},
  ko:{"navigation.home":"홈","navigation.meet":"모임","navigation.chats":"채팅","navigation.profile":"프로필","settings.title":"설정","settings.language":"언어","settings.appearance":"화면"},
  ja:{"navigation.home":"ホーム","navigation.meet":"ミート","navigation.chats":"チャット","navigation.profile":"プロフィール","settings.title":"設定","settings.language":"言語","settings.appearance":"外観"},
  "zh-CN":{"navigation.home":"首页","navigation.meet":"见面","navigation.chats":"聊天","navigation.profile":"个人资料","settings.title":"设置","settings.language":"语言","settings.appearance":"外观"},
  "zh-TW":{"navigation.home":"首頁","navigation.meet":"見面","navigation.chats":"聊天","navigation.profile":"個人檔案","settings.title":"設定","settings.language":"語言","settings.appearance":"外觀"},
  vi:{"navigation.home":"Trang chủ","navigation.meet":"Gặp mặt","navigation.chats":"Trò chuyện","navigation.profile":"Hồ sơ","settings.title":"Cài đặt","settings.language":"Ngôn ngữ","settings.appearance":"Giao diện"},
  th:{"navigation.home":"หน้าหลัก","navigation.meet":"นัดพบ","navigation.chats":"แชท","navigation.profile":"โปรไฟล์","settings.title":"การตั้งค่า","settings.language":"ภาษา","settings.appearance":"รูปลักษณ์"},
};

export const DICTIONARIES:Record<string,Dictionary> = {en,ru,be,uk,...Object.fromEntries(Object.entries(core).map(([locale,overrides])=>[locale,{...en,...overrides}]))};

export function dictionaryFor(locale:string):Dictionary{
  return DICTIONARIES[locale] || en;
}
