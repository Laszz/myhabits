# Product Requirements Document (PRD)

> **Project:** Habit Streak
>
> **Version:** 1.0.0
>
> **Platform:** React Native (Expo)
>
> **Styling:** NativeWind
>
> **Database:** Expo SQLite (Offline)
>
> **Status:** MVP Planning

---

# 1. Product Overview

Habit Streak adalah aplikasi mobile offline yang membantu pengguna membangun kebiasaan positif melalui pencatatan habit harian, sistem streak, statistik perkembangan, dan pengingat lokal.

Aplikasi tidak memerlukan akun maupun koneksi internet. Seluruh data disimpan menggunakan **Expo SQLite** pada perangkat sehingga tetap tersedia saat aplikasi ditutup dan otomatis hilang ketika aplikasi di-uninstall.

---

# 2. Problem Statement

Banyak pengguna ingin membangun rutinitas seperti olahraga, membaca, belajar, atau minum air, tetapi kesulitan menjaga konsistensi karena tidak memiliki sistem pelacakan yang sederhana.

Habit Streak memberikan solusi berupa:

- Checklist habit harian
- Perhitungan streak otomatis
- Statistik progres mingguan & bulanan
- Pengingat lokal
- UI minimal dan cepat digunakan

---

# 3. Product Goals

## Primary Goals

- Membantu pengguna membangun kebiasaan positif.
- Menjaga konsistensi melalui sistem streak.
- Menampilkan perkembangan secara visual.
- Memberikan pengalaman mobile yang cepat dan offline.

## Success Metrics

- Pengguna dapat membuat habit pertama kurang dari **1 menit**.
- Check-in harian maksimal **2 tap**.
- Streak dihitung otomatis setiap hari.
- Seluruh fitur inti berjalan tanpa internet.

---

# 4. Target Users

## Primary User

Mahasiswa, pelajar, dan pekerja berusia **16–35 tahun**.

## User Needs

- Melacak rutinitas harian.
- Menjaga motivasi melalui streak.
- Melihat progres secara sederhana.
- Tidak ingin login atau membuat akun.

---

# 5. MVP Features

## Phase 1 — Home & Daily Habit

### Features

- Menampilkan daftar habit aktif
- Progress harian
- Tandai habit selesai
- Current streak

### User Story

Sebagai pengguna, saya ingin melihat seluruh habit hari ini agar dapat menyelesaikannya dengan cepat.

---

## Phase 2 — Habit Management

### Features

- Tambah habit
- Edit habit
- Hapus habit
- Pilih ikon
- Pilih warna
- Pilih kategori

### User Story

Sebagai pengguna, saya ingin membuat dan mengelola habit sesuai kebutuhan saya.

---

## Phase 3 — History & Statistics

### Features

- Kalender aktivitas
- Riwayat check-in
- Completion rate
- Best streak
- Statistik mingguan
- Statistik bulanan

---

## Phase 4 — Reminder

### Features

- Reminder per habit
- Atur jam pengingat
- Aktif / nonaktif notifikasi lokal

---

## Phase 5 — Settings

### Features

- Light Mode
- Dark Mode
- Ikuti tema sistem
- Tentang aplikasi

---

# 6. User Flow

```text
Splash
   │
   ▼
Home
   │
   ├── Tambah Habit
   │        │
   │        ▼
   │    Simpan Habit
   │
   ▼
Check-in Harian
   │
   ▼
Riwayat
   │
   ▼
Statistik
   │
   ▼
Pengaturan
```

---

# 7. Screen List

| Screen     | Description                        |
| ---------- | ---------------------------------- |
| Splash     | Logo & loading                     |
| Home       | Progress ring + daftar habit       |
| Add Habit  | Form membuat habit                 |
| History    | Kalender & riwayat                 |
| Statistics | Grafik & completion rate           |
| Settings   | Tema, reminder, informasi aplikasi |

---

# 8. Functional Requirements

| ID    | Requirement            | Priority |
| ----- | ---------------------- | -------- |
| FR-01 | Tambah habit           | High     |
| FR-02 | Edit habit             | High     |
| FR-03 | Hapus habit            | High     |
| FR-04 | Check-in harian        | High     |
| FR-05 | Hitung streak otomatis | High     |
| FR-06 | Kalender aktivitas     | Medium   |
| FR-07 | Statistik progres      | Medium   |
| FR-08 | Reminder lokal         | Medium   |
| FR-09 | Dark Mode              | Low      |

---

# 9. Non Functional Requirements

| Item           | Target              |
| -------------- | ------------------- |
| Platform       | Android & iOS       |
| Framework      | React Native (Expo) |
| Offline        | Yes                 |
| Database       | SQLite              |
| Startup        | < 2 detik           |
| Internet       | Tidak diperlukan    |
| Authentication | Tidak ada (MVP)     |

---

# 10. Database Design

## Table — habits

| Field      | Type                |
| ---------- | ------------------- |
| id         | INTEGER PRIMARY KEY |
| title      | TEXT                |
| icon       | TEXT                |
| color      | TEXT                |
| category   | TEXT                |
| is_active  | INTEGER             |
| created_at | TEXT                |

---

## Table — habit_logs

| Field      | Type                |
| ---------- | ------------------- |
| id         | INTEGER PRIMARY KEY |
| habit_id   | INTEGER             |
| date       | TEXT                |
| completed  | INTEGER             |
| created_at | TEXT                |

---

## Table — reminders

| Field    | Type                |
| -------- | ------------------- |
| id       | INTEGER PRIMARY KEY |
| habit_id | INTEGER             |
| time     | TEXT                |
| enabled  | INTEGER             |

---

## Relationship

```text
habits
   │
   ├──────────────┐
   │              │
   ▼              ▼
habit_logs    reminders
```

Satu habit memiliki banyak riwayat dan banyak reminder.

---

# 11. Navigation

## Bottom Tab

1. Home
2. Riwayat
3. Statistik
4. Pengaturan

## Floating Action Button

FAB digunakan untuk membuat habit baru dari halaman Home.

---

# 12. Technical Stack

| Layer        | Technology          |
| ------------ | ------------------- |
| Framework    | React Native (Expo) |
| Styling      | NativeWind          |
| Language     | TypeScript          |
| Navigation   | Expo Router         |
| State        | Zustand             |
| Database     | Expo SQLite         |
| Notification | Expo Notifications  |
| Icons        | Lucide React Native |

---

# 13. Development Roadmap

## Sprint 1

- Splash
- Home
- Bottom Navigation
- SQLite Setup

## Sprint 2

- CRUD Habit
- Icon Picker
- Color Picker

## Sprint 3

- Check-in
- Streak Engine
- Progress Ring

## Sprint 4

- Calendar
- Statistics
- Completion Rate

## Sprint 5

- Reminder
- Dark Mode
- Settings

---

# 14. Data Persistence

Habit Streak menggunakan **Expo SQLite** sebagai penyimpanan lokal.

### Rules

- Data disimpan pada internal storage aplikasi.
- Tidak menggunakan cloud maupun backend.
- Tidak memerlukan login.
- Data tetap ada setelah aplikasi ditutup.
- Data otomatis terhapus ketika aplikasi di-uninstall.

---

# 15. Future Features (Post MVP)

- Backup & Restore
- Cloud Sync
- Widget Home Screen
- Achievement & Badge
- Habit Sharing
- Multiple Device Sync
