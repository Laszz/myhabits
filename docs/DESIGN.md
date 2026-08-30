# Habit Streak — Design System

> **Version:** 1.0.0
> **Platform:** React Native (Expo)
> **Styling:** NativeWind
> **Design Style:** Modern Minimal Productivity

---

## 1. Design Principles

Habit Streak menggunakan pendekatan **Clean Productivity** dengan fokus pada tiga prinsip utama:

- **Fast Interaction** — mayoritas aksi pengguna maksimal 2 tap.
- **Visual Motivation** — progress, streak, dan achievement menjadi elemen motivasi utama.
- **Minimal Distraction** — antarmuka bersih dengan ruang kosong yang lega dan warna yang konsisten.

**Design Rules**

- Mobile-first (390 × 844)
- 8pt Grid System
- Rounded modern components
- Soft shadow & subtle border
- Light dan Dark Mode wajib didukung

---

## 2. Color System

Luminous Habit menggunakan identitas visual **Emerald + Orange + Blue**.

### Primary

| Token         | Hex       | Usage                       |
| ------------- | --------- | --------------------------- |
| Primary       | `#10B981` | CTA, progress, active state |
| Primary Dark  | `#059669` | Pressed button              |
| Primary Light | `#D1FAE5` | Selected background         |

### Secondary

| Token       | Hex       | Usage                 |
| ----------- | --------- | --------------------- |
| Orange      | `#F97316` | Streak & achievements |
| Orange Soft | `#FFEDD5` | Badge background      |

### Tertiary

| Token     | Hex       | Usage                |
| --------- | --------- | -------------------- |
| Blue      | `#3B82F6` | Statistics & charts  |
| Blue Soft | `#DBEAFE` | Analytics background |

### Neutral

| Token          | Hex       |
| -------------- | --------- |
| Background     | `#FFFFFF` |
| Surface        | `#FFFFFF` |
| Surface Soft   | `#F3F4F6` |
| Border         | `#E5E7EB` |
| Text           | `#000000` |
| Secondary Text | `#6B7280` |

### Dark Mode

| Token      | Hex       |
| ---------- | --------- |
| Background | `#000000` |
| Surface    | `#111111` |
| Border     | `#262626` |
| Text       | `#FFFFFF` |

---

## 3. Typography

### Font Family

| Usage          | Font              |
| -------------- | ----------------- |
| Heading        | Plus Jakarta Sans |
| Body           | Inter             |
| Label & Number | JetBrains Mono    |

### Type Scale

| Style   | Size | Weight |
| ------- | ---: | -----: |
| Display |   32 |    700 |
| H1      |   28 |    700 |
| H2      |   22 |    700 |
| H3      |   18 |    600 |
| Body    |   16 |    400 |
| Small   |   14 |    400 |
| Caption |   12 |    500 |

---

## 4. Spacing System

Menggunakan **8-point grid**.

| Token | Value |
| ----- | ----: |
| xs    |     4 |
| sm    |     8 |
| md    |    16 |
| lg    |    24 |
| xl    |    32 |

**Page Padding:** 20px

---

## 5. Border Radius

| Token  | Value |
| ------ | ----: |
| Small  |     8 |
| Medium |    12 |
| Large  |    16 |
| XL     |    24 |
| Full   |  9999 |

Semua **Card**, **Button**, dan **Input** menggunakan radius **16px**.

---

## 6. Iconography

**Library:** Lucide React Native

### Icon Set

- Flame
- CheckCircle2
- CalendarDays
- Bell
- BarChart3
- Trophy
- Plus
- Moon
- Sun
- Droplet
- BookOpen
- Dumbbell

**Default Size:** 22px

---

# 7. Components

## Primary Button

| Property   | Value            |
| ---------- | ---------------- |
| Height     | 52px             |
| Radius     | 16px             |
| Background | Primary          |
| Text       | White · Semibold |

**Interaction**

- Scale: 0.97
- Duration: 180ms
- Haptic feedback

---

## Secondary Button

- White background
- 1px border
- Radius 16px
- Text menggunakan warna Primary

---

## Habit Card

### Structure

- Icon kiri
- Nama habit
- Current streak
- Mini heat indicator
- Checkbox kanan

**Minimum Height:** 84px

### States

**Default**

- White background
- Gray border

**Completed**

- Light emerald background
- Filled checkbox
- Green icon

**Missed**

- Soft red background
- Streak indicator menurun

---

## Progress Ring

| Property | Value              |
| -------- | ------------------ |
| Size     | 96px               |
| Stroke   | 10px               |
| Center   | Percentage + Today |

Warna progress mengikuti **Primary**.

---

## Statistic Card

Berisi:

- Icon
- Value
- Label

Layout menggunakan **2 columns** pada mobile.

---

## Floating Action Button

| Property | Value        |
| -------- | ------------ |
| Size     | 60px         |
| Position | Bottom Right |
| Icon     | Plus         |
| Shape    | Full Rounded |

---

# 8. Navigation

## Bottom Navigation

| Menu       | Icon         |
| ---------- | ------------ |
| Home       | House        |
| History    | CalendarDays |
| Statistics | BarChart3    |
| Settings   | Settings     |

### Active State

- Emerald background
- White icon
- White label

### Inactive State

- Slate icon
- Slate label

---

# 9. Screen Specification

## Splash

**Purpose**

Memperkenalkan identitas aplikasi.

**Elements**

- Logo
- App Name
- Fade animation (800ms)

---

## Home

### Layout

1. Greeting
2. Progress Ring
3. Today's Progress
4. Habit List
5. Floating Action Button

### Habit Card

Menampilkan:

- Icon
- Habit Name
- Current Streak
- Checkbox

Checklist langsung menyimpan data ke **SQLite**.

---

## Add Habit

### Required Fields

- Habit Name
- Category
- Icon
- Accent Color
- Reminder Time
- Frequency

### CTA

**Create Habit**

### Validation

- Nama minimal 2 karakter
- Icon wajib dipilih
- Warna default = Primary

---

## History

### Components

- Calendar Heatmap
- Daily Timeline
- Weekly / Monthly Filter

Heatmap menggunakan intensitas warna emerald berdasarkan jumlah completion.

---

## Statistics

### Sections

1. Completion Rate
2. Current Streak
3. Best Streak
4. Weekly Chart
5. Monthly Chart
6. Achievement Badge

Chart dibuat menggunakan **react-native-svg**.

---

## Settings

### Menu

- Dark Mode
- Follow System Theme
- Reminder Permission
- About App

---

# 10. Motion

| Animation     | Duration |
| ------------- | -------: |
| Button Press  |    150ms |
| Checkbox Pop  |    180ms |
| Card Fade     |    220ms |
| Progress Ring |    700ms |

**Easing:** `ease-out`

---

# 11. Accessibility

- Minimum touch target **44×44**
- Dynamic Font Support
- WCAG AA Contrast
- Full Dark Mode
- Haptic feedback pada checklist
- VoiceOver / TalkBack friendly

---

# 12. Empty States

## No Habit

**Icon:** Clipboard

**Title**

> No habits yet

**Subtitle**

> Create your first habit and start building consistency.

**Button**

Create Habit

---

## No Statistics

**Icon:** BarChart3

**Message**

> Complete habits for a few days to unlock your statistics.

---

# 13. Achievement System

| Badge       | Unlock Requirement    |
| ----------- | --------------------- |
| First Step  | Complete 1 habit      |
| 7 Days      | 7-day streak          |
| Consistent  | 30 completions        |
| Early Bird  | Complete before 08:00 |
| Bookworm    | 100 reading sessions  |
| Unstoppable | 100-day streak        |

### Badge States

**Locked**

- 50% opacity
- Gray icon

**Unlocked**

- Full color
- Soft glow
- Scale animation ketika diperoleh

---

# 14. Technical Design Rules

- React Native + Expo Router
- NativeWind only
- Zustand untuk state management
- Expo SQLite untuk offline storage
- Expo Notifications untuk reminder
- Lucide React Native untuk seluruh icon
- Hindari inline style kecuali animasi dinamis

---

# 15. Responsive Rules

| Device |  Width |
| ------ | -----: |
| Mobile |  390px |
| Tablet | ≥768px |

Card tidak boleh melebihi **640px** agar tetap nyaman dibaca.

---

# 16. Design Checklist

- [x] Light Mode
- [x] Dark Mode
- [x] Home Dashboard
- [x] Add Habit
- [x] History
- [x] Statistics
- [x] Settings
- [x] Achievement
- [x] Offline First
- [x] NativeWind Ready
