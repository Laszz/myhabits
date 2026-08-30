export type Language = 'en' | 'id';

const translations = {
  en: {
    // Common
    all: 'All',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    error: 'Error',
    off: 'Off',
    today: 'Today',
    yesterday: 'Yesterday',
    save: 'Save Changes',
    create: 'Create Habit',
    back: 'Back',

    // Categories
    health: 'Health',
    mind: 'Mind',
    focus: 'Focus',
    fitness: 'Fitness',
    sleep: 'Sleep',
    finance: 'Finance',
    learning: 'Learning',
    selfCare: 'Self-Care',
    productivity: 'Productivity',
    other: 'Other',

    // Home
    appTitle: 'Habit Streak',
    todayProgress: "Today's Progress",
    habitsCompleted: (n: number, total: number) => `${n} of ${total} habits completed today`,
    progressMessage: (pct: number) => {
      if (pct === 0) return "Let's get started!";
      if (pct < 50) return 'Keep going!';
      if (pct < 100) return 'Almost there!';
      return 'All done! Great work!';
    },
    todayHabits: "Today's Habits",
    dayStreak: (n: number) => `${n} Day Streak`,

    // History
    history: 'History',
    currentStreak: 'Current Streak',
    bestStreak: 'Best Streak',
    totalCompletions: 'Total Completions',
    last3Months: 'Last 3 Months',
    less: 'Less',
    more: 'More',
    recentCompletions: 'Recent Completions',
    noCompletions: 'No completions yet',

    // Statistics
    statistics: 'Statistics',
    totalCheckins: 'Total Check-ins',
    completionRate: 'Completion Rate',
    perHabit: 'Per Habit',
    noStatistics: 'No Statistics Yet',
    noStatisticsDesc: 'Complete habits for a few days to unlock your statistics.',

    // Settings
    settings: 'Settings',
    appearance: 'Appearance',
    language: 'Language',
    data: 'Data',
    clearAllData: 'Clear All Data',
    clearAllDataDesc: 'This will delete all habits and check-ins. This cannot be undone.',
    clearAllDataDone: 'All data has been cleared.',
    about: 'About',
    version: 'Version 1.0.0',
    visitGithub: 'Visit GitHub',
    light: 'Light',
    dark: 'Dark',

    // Add / Edit Habit
    newHabit: 'New Habit',
    editHabit: 'Edit Habit',
    habitName: 'Habit Name',
    habitNamePlaceholder: 'e.g. Morning Meditation',
    habitNameError: 'Habit name must be at least 2 characters',
    category: 'Category',
    icon: 'Icon',
    accentColor: 'Accent Color',
    schedule: 'Schedule',
    frequency: 'Frequency',
    reminder: 'Reminder',
    pickTime: 'Pick Time',
    hour: 'Hour',
    min: 'Min',
    period: 'Period',
    everyDay: 'Every Day',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    custom: 'Custom',
    habitNotFound: 'Habit not found',

    // Habit Detail
    habitDetail: 'Habit Detail',
    totalDone: 'Total Done',
    calendar: 'Calendar',

    // Habit Card
    chooseAction: 'Choose action',

    // Empty State
    noHabits: 'No habits yet',
    noHabitsDesc: 'Create your first habit and start building consistency.',

    // Progress Ring
    todayLabel: 'Today',

    // Days
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',

    // Months
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'May',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Aug',
    sep: 'Sep',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Dec',
  },
  id: {
    // Common
    all: 'Semua',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    done: 'Selesai',
    error: 'Error',
    off: 'Mati',
    today: 'Hari Ini',
    yesterday: 'Kemarin',
    save: 'Simpan Perubahan',
    create: 'Buat Habit',
    back: 'Kembali',

    // Categories
    health: 'Kesehatan',
    mind: 'Pikiran',
    focus: 'Fokus',
    fitness: 'Fitness',
    sleep: 'Tidur',
    finance: 'Keuangan',
    learning: 'Belajar',
    selfCare: 'Perawatan Diri',
    productivity: 'Produktivitas',
    other: 'Lainnya',

    // Home
    appTitle: 'Habit Streak',
    todayProgress: 'Progress Hari Ini',
    habitsCompleted: (n: number, total: number) => `${n} dari ${total} habit selesai hari ini`,
    progressMessage: (pct: number) => {
      if (pct === 0) return 'Ayo mulai!';
      if (pct < 50) return 'Terus semangat!';
      if (pct < 100) return 'Hampir selesai!';
      return 'Selesai semua! Kerja bagus!';
    },
    todayHabits: 'Habit Hari Ini',
    dayStreak: (n: number) => `${n} Hari Berturut-turut`,

    // History
    history: 'Riwayat',
    currentStreak: 'Streak Saat Ini',
    bestStreak: 'Streak Terbaik',
    totalCompletions: 'Total Selesai',
    last3Months: '3 Bulan Terakhir',
    less: 'Sedikit',
    more: 'Banyak',
    recentCompletions: 'Selesai Terakhir',
    noCompletions: 'Belum ada selesai',

    // Statistics
    statistics: 'Statistik',
    totalCheckins: 'Total Check-in',
    completionRate: 'Tingkat Selesai',
    perHabit: 'Per Habit',
    noStatistics: 'Belum Ada Statistik',
    noStatisticsDesc: 'Selesai habit beberapa hari untuk membuka statistik.',

    // Settings
    settings: 'Pengaturan',
    appearance: 'Tampilan',
    language: 'Bahasa',
    data: 'Data',
    clearAllData: 'Hapus Semua Data',
    clearAllDataDesc: 'Ini akan menghapus semua habit dan check-in. Tidak dapat dibatalkan.',
    clearAllDataDone: 'Semua data telah dihapus.',
    about: 'Tentang',
    version: 'Versi 1.0.0',
    visitGithub: 'Kunjungi GitHub',
    light: 'Terang',
    dark: 'Gelap',

    // Add / Edit Habit
    newHabit: 'Habit Baru',
    editHabit: 'Edit Habit',
    habitName: 'Nama Habit',
    habitNamePlaceholder: 'contoh: Meditasi Pagi',
    habitNameError: 'Nama habit minimal 2 karakter',
    category: 'Kategori',
    icon: 'Ikon',
    accentColor: 'Warna Aksen',
    schedule: 'Jadwal',
    frequency: 'Frekuensi',
    reminder: 'Pengingat',
    pickTime: 'Pilih Waktu',
    hour: 'Jam',
    min: 'Menit',
    period: 'Periode',
    everyDay: 'Setiap Hari',
    weekdays: 'Hari Kerja',
    weekends: 'Akhir Pekan',
    custom: 'Kustom',
    habitNotFound: 'Habit tidak ditemukan',

    // Habit Detail
    habitDetail: 'Detail Habit',
    totalDone: 'Total Selesai',
    calendar: 'Kalender',

    // Habit Card
    chooseAction: 'Pilih aksi',

    // Empty State
    noHabits: 'Belum ada habit',
    noHabitsDesc: 'Buat habit pertama kamu dan mulai bangun konsistensi.',

    // Progress Ring
    todayLabel: 'Hari Ini',

    // Days
    mon: 'Sen',
    tue: 'Sel',
    wed: 'Rab',
    thu: 'Kam',
    fri: 'Jum',
    sat: 'Sab',
    sun: 'Min',

    // Months
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'Mei',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Agu',
    sep: 'Sep',
    oct: 'Okt',
    nov: 'Nov',
    dec: 'Des',
  },
} as const;

export type TranslationKeys = keyof typeof translations.en;

export function t(lang: Language, key: TranslationKeys, ...args: any[]): string {
  const val = translations[lang][key];
  if (typeof val === 'function') {
    return (val as Function)(...args);
  }
  return val as string;
}

export function getMonthLabel(lang: Language, monthIndex: number): string {
  const keys: TranslationKeys[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return t(lang, keys[monthIndex]);
}

export function getDayLabel(lang: Language, dayIndex: number): string {
  // dayIndex: 0=Sun, 1=Mon, ... 6=Sat — maps to our Mon-Sun layout
  const keys: TranslationKeys[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return t(lang, keys[dayIndex]);
}
