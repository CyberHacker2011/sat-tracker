"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "uz" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && ["en", "uz", "ru"].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const translations: Record<Language, Record<string, string>> = {
    en: {
      // Settings
      "settings": "Settings",
      "language": "Language",
      "theme": "Theme",
      "theme.light": "Light",
      "theme.dark": "Dark",
      "theme.blue": "Blue",
      
      // Hero
      "hero.badge": "Your Complete SAT Success Platform",
      "hero.title.master": "Master Your",
      "hero.title.journey": "SAT Journey",
      "hero.subtitle.plan": "Plan",
      "hero.subtitle.smarter": "smarter",
      "hero.subtitle.study": "Study",
      "hero.subtitle.focused": "focused",
      "hero.subtitle.track": "Track",
      "hero.subtitle.progress": "progress",
      "hero.subtitle.desc": "Your all-in-one preparation platform for SAT excellence.",
      
      // Stats
      "stats.active_students": "Active Students",
      "stats.study_sessions": "Study Sessions",
      "stats.user_rating": "User Rating",
      
      // Buttons
      "btn.get_started": "Get Started Free",
      "btn.dashboard": "Open Dashboard",
      "btn.explore": "Explore Features",
      "btn.signin": "Sign In",
      "login.already_account": "Already have an account?",
      
      // Features
      "features.title": "Everything You Need For",
      "features.subtitle": "SAT Excellence",
      "features.desc": "Smart tools designed to transform your study habits and maximize your SAT performance.",
      
      "feature.planning.title": "Smart Study Planning",
      "feature.planning.desc": "Create customized study plans for Math, Reading, and Writing. Set target dates and organize your prep.",
      
      "feature.pomodoro.title": "Pomodoro Focus Timer",
      "feature.pomodoro.desc": "Stay focused with proven Pomodoro intervals. Study in blocks with automatic breaks to avoid burnout.",
      
      "feature.analytics.title": "Progress Analytics",
      "feature.analytics.desc": "View detailed statistics about your study patterns. Track hours, sessions, and improvement trends.",
      
      "feature.daily.title": "Daily Check-Ins",
      "feature.daily.desc": "Log your daily study sessions and track progress. Mark topics as completed and maintain accountability.",
      
      "feature.room.title": "Study Room",
      "feature.room.desc": "Access a dedicated study environment with progress tracking. Monitor daily streaks and invested hours.",
      
      "feature.profile.title": "Profile Customization",
      "feature.profile.desc": "Set your education level, target score, and study preferences. Customize your experience.",
      
      // Premium
      "premium.badge": "Premium Features",
      "premium.title": "Unlock Your Full Potential",
      "premium.subtitle": "Upgrade to Premium and get unlimited study plans, advanced analytics, and priority support.",
      "premium.footer": "Premium subscriptions are managed through direct contact. Once activated, you'll see a golden star icon.",
      
      "plan.monthly": "Monthly Plan",
      "plan.quarterly": "Quarterly Plan",
      "plan.per_month": "UZS per month",
      "plan.for_3_months": "UZS for 3 months",
      "plan.save": "Save 6,050 UZS ✨",
      "plan.choose_monthly": "Choose Monthly",
      "plan.choose_quarterly": "Choose Quarterly",
      
      "benefit.unlimited": "Unlimited Study Plans",
      "benefit.analytics": "Advanced Analytics",
      "benefit.support": "Priority Support",
      "benefit.everything": "Everything in Monthly",
      "benefit.lock": "Lock in current price for future features",
      "benefit.value": "Best Value 🔥",
      
      // Testimonials
      "reviews.title": "Real Results From",
      "reviews.subtitle": "Real Students",
      "reviews.desc": "Join thousands of students who are already achieving their SAT goals with our proven platform.",
      "reviews.sarah": "\"SAT Tracker completely transformed my study routine. The Pomodoro timer kept me accountable.\"",
      "reviews.james": "\"The study planning feature is incredible. I saw exactly what to study each day.\"",
      "reviews.emily": "\"Premium was worth every penny. Unlimited plans helped me target my weak areas.\"",
      "reviews.david": "\"The detailed analytics showed me where I was losing points. My score jumped 100 points.\"",
      "reviews.layla": "\"I love the daily check-ins. It keeps me honest about how much I'm actually studying.\"",
      "reviews.scored": "Scored",
      
      // Footer CTA
      "cta.title": "Ready to Ace Your SAT?",
      "cta.desc": "Join thousands of students using SAT Tracker to stay organized, focused, and motivated.",
      "cta.start": "Start Free Today",
      "cta.upgrade": "Upgrade to Premium",
      
      // Footer Links
      "footer.about": "About",
      "footer.privacy": "Privacy",
      "footer.contact": "Contact Support",
    },
    uz: {
      "settings": "Sozlamalar",
      "language": "Til",
      "theme": "Mavzu",
      "theme.light": "Yorug'",
      "theme.dark": "Qorong'i",
      "theme.blue": "Ko'k",
      
      "hero.badge": "SAT Muvaffaqiyati Uchun Mukammal Platforma",
      "hero.title.master": "SAT Cho'qqisini",
      "hero.title.journey": "Zabt Eting",
      "hero.subtitle.plan": "",
      "hero.subtitle.smarter": "Aqlli Rejalashtiring",
      "hero.subtitle.study": "",
      "hero.subtitle.focused": "Diqqat Bilan O'qing",
      "hero.subtitle.track": "va",
      "hero.subtitle.progress": "Natijani Kuzating",
      "hero.subtitle.desc": "SAT imtihoniga tayyorgarlik ko'rish uchun barchasi bitta platformada.",
      
      "stats.active_students": "Faol O'quvchilar",
      "stats.study_sessions": "O'quv Sessiyalari",
      "stats.user_rating": "Foydalanuvchi Reytingi",
      
      "btn.get_started": "Bepul Boshlash",
      "btn.dashboard": "Kabinetga Kirish",
      "btn.explore": "Imkoniyatlar",
      "btn.signin": "Kirish",
      "login.already_account": "Allaqachon hisobingiz bormi?",
      
      "features.title": "SAT Muvaffaqiyati Uchun",
      "features.subtitle": "Barcha Kerakli Vositalar",
      "features.desc": "O'qish odatlaringizni o'zgartirish va SAT natijangizni maksimal darajaga ko'tarish uchun aqlli vositalar.",
      
      "feature.planning.title": "Aqlli Rejalashtirish",
      "feature.planning.desc": "Matematika, O'qish va Yozish uchun shaxsiy rejalarni tuzing. Maqsadli sanalarni belgilang va tayyorgarlikni tartibga soling.",
      
      "feature.pomodoro.title": "Pomodoro Taymeri",
      "feature.pomodoro.desc": "Pomodoro usuli bilan diqqatni jamlang. Charchoqni oldini olish uchun avtomatik tanaffuslar bilan o'qing.",
      
      "feature.analytics.title": "Natijalar Tahlili",
      "feature.analytics.desc": "O'qish jarayoningiz haqida batafsil statistikani ko'ring. Soatlar, sessiyalar va o'sish tendentsiyalarini kuzating.",
      
      "feature.daily.title": "Kunlik Hisobotlar",
      "feature.daily.desc": "Kunlik o'quv sessiyalarini qayd eting va natijalarni kuzating. Mavzularni bajarilgan deb belgilang.",
      
      "feature.room.title": "O'quv Xonasi",
      "feature.room.desc": "Maxsus o'quv muhitiga kiring. Kunlik ketma-ketlik va sarflangan vaqtni nazorat qiling.",
      
      "feature.profile.title": "Profilni Sozlash",
      "feature.profile.desc": "Ta'lim darajasi, maqsadli ball va o'qish afzalliklarini belgilang. Tajribangizni moslashtiring.",
      
      "premium.badge": "Premium Imkoniyatlar",
      "premium.title": "To'liq Imkoniyatlarni Ochish",
      "premium.subtitle": "Premium ga o'ting va cheksiz o'quv rejalari, kengaytirilgan tahlillar va ustuvor yordamga ega bo'ling.",
      "premium.footer": "Premium obunalar to'g'ridan-to'g'ri aloqa orqali boshqariladi. Faollashtirilgach, oltin yulduz belgisini ko'rasiz.",
      
      "plan.monthly": "Oylik Reja",
      "plan.quarterly": "Choraklik Reja",
      "plan.per_month": "so'm / oyiga",
      "plan.for_3_months": "so'm / 3 oy uchun",
      "plan.save": "6,050 so'm tejang ✨",
      "plan.choose_monthly": "Oylikni Tanlash",
      "plan.choose_quarterly": "Choraklikni Tanlash",
      
      "benefit.unlimited": "Cheksiz O'quv Rejalari",
      "benefit.analytics": "Kengaytirilgan Tahlillar",
      "benefit.support": "Ustuvor Yordam",
      "benefit.everything": "Oylik rejadagi barcha narsalar",
      "benefit.lock": "Kelajakdagi yangiliklar uchun narxni saqlab qolish",
      "benefit.value": "Eng Yaxshi Taklif 🔥",
      
      "reviews.title": "Haqiqiy Natijalar",
      "reviews.subtitle": "Haqiqiy O'quvchilardan",
      "reviews.desc": "Bizning platformamiz orqali SAT maqsadlariga erishayotgan minglab o'quvchilarga qo'shiling.",
      "reviews.sarah": "\"SAT Tracker o'qish tartibimni butunlay o'zgartirdi. Pomodoro taymeri va natijalarni kuzatish meni har kuni mas'uliyatli qildi.\"",
      "reviews.james": "\"Rejalashtirish xususiyati ajoyib. Har kuni nima o'qishim kerakligini aniq ko'rib turdim.\"",
      "reviews.emily": "\"Premium har bir sarflangan so'mga arziydi. Cheksiz rejalar menga kuchsiz tomonlarimni kuchaytirishga yordam berdi.\"",
      "reviews.david": "\"Batafsil tahlillar qayerda ball yo'qotayotganimni ko'rsatdi. Bir oyda natijam 100 ballga oshdi.\"",
      "reviews.layla": "\"Kunlik hisobotlar menga juda yoqadi. Bu meni shunchaki rejalashtirishdan ko'ra, haqiqatdan ham o'qishga undaydi.\"",
      "reviews.scored": "Ball",
      
      "cta.title": "SAT dan Yuqori Ball Olishga Tayyormisiz?",
      "cta.desc": "SAT Tracker dan foydalanib, tartibli va diqqatli bo'lgan minglab o'quvchilarga qo'shiling.",
      "cta.start": "Bepul Boshlash",
      "cta.upgrade": "Premium ga O'tish",
      
      "footer.about": "Biz Haqimizda",
      "footer.privacy": "Maxfiylik",
      "footer.contact": "Yordam",
    },
    ru: {
      "settings": "Настройки",
      "language": "Язык",
      "theme": "Тема",
      "theme.light": "Светлая",
      "theme.dark": "Темная",
      "theme.blue": "Синяя",
      
      "hero.badge": "Ваша Платформа Успеха SAT",
      "hero.title.master": "Управляйте Своим",
      "hero.title.journey": "Путем к SAT",
      "hero.subtitle.plan": "Планируйте",
      "hero.subtitle.smarter": "умнее",
      "hero.subtitle.study": "Учитесь",
      "hero.subtitle.focused": "сфокусированно",
      "hero.subtitle.track": "Следите",
      "hero.subtitle.progress": "за прогрессом",
      "hero.subtitle.desc": "Ваша универсальная платформа для подготовки к SAT.",
      
      "stats.active_students": "Активных Студентов",
      "stats.study_sessions": "Учебных Сессий",
      "stats.user_rating": "Рейтинг Пользователей",
      
      "btn.get_started": "Начать Бесплатно",
      "btn.dashboard": "Открыть Дашборд",
      "btn.explore": "Функции",
      "btn.signin": "Войти",
      "login.already_account": "Уже есть аккаунт?",
      
      "features.title": "Всё, Что Нужно Для",
      "features.subtitle": "Успеха в SAT",
      "features.desc": "Умные инструменты для трансформации ваших учебных привычек и максимизации результата SAT.",
      
      "feature.planning.title": "Умное Планирование",
      "feature.planning.desc": "Создавайте планы для Математики, Чтения и Письма. Устанавливайте цели и организуйте подготовку.",
      
      "feature.pomodoro.title": "Таймер Pomodoro",
      "feature.pomodoro.desc": "Оставайтесь сфокусированными с интервалами Pomodoro. Учитесь блоками с перерывами.",
      
      "feature.analytics.title": "Аналитика Прогресса",
      "feature.analytics.desc": "Подробная статистика о вашем обучении. Отслеживайте часы, сессии и тренды улучшения.",
      
      "feature.daily.title": "Ежедневные Отчеты",
      "feature.daily.desc": "Логируйте учебные сессии и следите за прогрессом. Отмечайте пройденные темы.",
      
      "feature.room.title": "Учебная Комната",
      "feature.room.desc": "Выделенная среда для учебы. Следите за ежедневными сериями и потраченным временем.",
      
      "feature.profile.title": "Настройка Профиля",
      "feature.profile.desc": "Установите уровень образования, целевой балл и предпочтения. Настройте опыт под себя.",
      
      "premium.badge": "Premium Функции",
      "premium.title": "Раскройте Свой Потенциал",
      "premium.subtitle": "Перейдите на Premium и получите безлимитные планы, продвинутую аналитику и приоритетную поддержку.",
      "premium.footer": "Подписки Premium управляются напрямую. После активации вы увидите значок золотой звезды.",
      
      "plan.monthly": "Месячный План",
      "plan.quarterly": "Квартальный План",
      "plan.per_month": "сум / месяц",
      "plan.for_3_months": "сум / за 3 месяца",
      "plan.save": "Экономия 6,050 сум ✨",
      "plan.choose_monthly": "Выбрать Месячный",
      "plan.choose_quarterly": "Выбрать Квартальный",
      
      "benefit.unlimited": "Безлимитные Учебные Планы",
      "benefit.analytics": "Продвинутая Аналитика",
      "benefit.support": "Приоритетная Поддержка",
      "benefit.everything": "Всё, что в Месячном",
      "benefit.lock": "Фиксация цены для будущих функций",
      "benefit.value": "Лучший Выбор 🔥",
      
      "reviews.title": "Реальные Результаты",
      "reviews.subtitle": "Реальных Студентов",
      "reviews.desc": "Присоединяйтесь к тысячам студентов, достигающих своих целей SAT с нашей платформой.",
      "reviews.sarah": "\"SAT Tracker полностью изменил мою рутину. Таймер Pomodoro и трекер прогресса держали меня в тонусе каждый день.\"",
      "reviews.james": "\"Функция планирования невероятна. Я точно знал, что учить каждый день.\"",
      "reviews.emily": "\"Premium стоил каждого сума. Безлимитные планы помогли мне подтянуть слабые места.\"",
      "reviews.david": "\"Детальная аналитика показала, где я терял баллы. Мой результат вырос на 100 баллов за месяц.\"",
      "reviews.layla": "\"Обожаю ежедневные отчеты. Это заставляет меня реально учиться, а не просто планировать.\"",
      "reviews.scored": "Результат",
      
      "cta.title": "Готовы Сдать SAT на Отлично?",
      "cta.desc": "Присоединяйтесь к тысячам студентов, использующих SAT Tracker для организации и мотивации.",
      "cta.start": "Начать Бесплатно",
      "cta.upgrade": "Перейти на Premium",
      
      "footer.about": "О нас",
      "footer.privacy": "Конфиденциальность",
      "footer.contact": "Поддержка",
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
