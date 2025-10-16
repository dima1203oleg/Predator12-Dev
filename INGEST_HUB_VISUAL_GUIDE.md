# 🎨 INGEST HUB - VISUAL GUIDE

## 📊 Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         INGEST HUB                              │
│                    (Main Container Page)                        │
└────────────────────────────────────────────────────────────────┘
                              │
                              │
                ┌─────────────┴─────────────┐
                │      Tab Navigation       │
                └─────────────┬─────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│    FILES     │      │    LINKS     │     │  TELEGRAM    │
│              │      │              │     │              │
│ FileDropzone │      │LinkCollector │     │TelegramConn  │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │    STATUS    │
                      │              │
                      │  TaskStream  │
                      └──────────────┘
```

---

## 🌊 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
├─────────────┬─────────────┬─────────────────────────────────────┤
│   📁 Files  │  🔗 Links   │       📱 Telegram                   │
│             │             │                                     │
│ • CSV       │ • URL       │ • @channels                         │
│ • XLSX      │ • RSS       │ • Groups (invite links)            │
│ • PDF       │ • Sitemap   │ • Media extraction                  │
│ • Images    │             │ • Message filtering                 │
│ • Videos    │             │                                     │
└─────┬───────┴──────┬──────┴───────────┬───────────────────────┘
      │              │                  │
      │              │                  │
      └──────────────┼──────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │   TRANSFORM    │
            │   & VALIDATE   │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │    STORAGE     │
            │  (PostgreSQL)  │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │   OPENSEARCH   │
            │    INDEXING    │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │   DASHBOARD    │
            │   ANALYTICS    │
            └────────────────┘
```

---

## 📂 File Upload Flow

```
  User Action                Component State              Backend
  ───────────                ───────────────              ───────

     Drag File
        │
        ▼
  ┌──────────┐
  │ Dropzone │──────────────────────────────────┐
  └──────────┘                                  │
        │                                       │
        │                                       │
        ▼                                       ▼
   Show Preview                          Add to Queue
        │                                       │
        │                                       │
        ▼                                       ▼
  Click Upload                           Status: pending
        │                                       │
        │                                       │
        ▼                                       ▼
   Start Upload ───────────────────►  POST /api/ingest/upload
        │                                       │
        │                                       │
        ▼                                       ▼
  Show Progress  ◄───────────────────  Progress Events (0-100%)
        │                                       │
        │                                       │
        ▼                                       ▼
  Upload Complete ◄──────────────────  Status: success / error
        │
        │
        ▼
   Update Stats
```

---

## 🔗 Link Collection Flow

```
  User Action                Component State              Backend
  ───────────                ───────────────              ───────

   Enter URL
        │
        ▼
  ┌──────────┐
  │Auto-detect│────────────────────────────────┐
  │   Type    │                                │
  └──────────┘                                 │
        │                                      │
        ▼                                      ▼
  Configure Options                      Add to Queue
    • Depth                                    │
    • Extract Images                           │
    • Extract Links                            │
        │                                      │
        ▼                                      ▼
   Add to Queue                          Status: pending
        │                                      │
        │                                      │
        ▼                                      ▼
  Click Process ───────────────────►  POST /api/ingest/crawl
        │                                      │
        │                                      │
        ▼                                      ▼
  Show Processing  ◄──────────────  Crawling + Parsing
        │                                      │
        │                                      │
        ▼                                      ▼
   Show Results  ◄─────────────────  Status: success
    (Items Found)                        (Count: N)
```

---

## 📱 Telegram Integration Flow

```
  User Action                Component State              Backend
  ───────────                ───────────────              ───────

  Enter API Token
        │
        ▼
  ┌──────────┐
  │ Connect  │────────────────────────────────┐
  │   API    │                                │
  └──────────┘                                │
        │                                     ▼
        ▼                            POST /api/telegram/connect
  API Connected  ◄──────────────────  Verify Token
        │                                     │
        │                                     │
        ▼                                     │
  Enter @channel                              │
        │                                     │
        ▼                                     │
  Configure Filters                           │
    • Media                                   │
    • Links                                   │
    • Forwards                                │
    • Min Length                              │
        │                                     │
        ▼                                     ▼
  Add Source ──────────────────►  POST /api/telegram/subscribe
        │                                     │
        │                                     │
        ▼                                     ▼
  Show Connecting ◄─────────────  Connecting to Channel
        │                                     │
        │                                     │
        ▼                                     ▼
  Show Active  ◄────────────────  Status: active
   (Avatar, Stats)                    (Members, Messages)
        │                                     │
        │                                     │
        ▼                                     ▼
  Click Sync ──────────────────►  POST /api/telegram/:id/sync
        │                                     │
        │                                     │
        ▼                                     ▼
  Update Stats ◄────────────────  New Messages Collected
```

---

## 📊 Task Status Flow

```
  ┌────────────────────────────────────────────────────────┐
  │                    TASK QUEUE                          │
  └────────────────────────────────────────────────────────┘
                         │
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
  ┌─────────┐      ┌─────────┐      ┌─────────┐
  │ PENDING │      │PROCESSING│      │COMPLETED│
  └─────────┘      └─────────┘      └─────────┘
       │                 │                 │
       │                 │                 │
       │        ┌────────┴────────┐        │
       │        │                 │        │
       │        ▼                 ▼        │
       │   ┌─────────┐      ┌─────────┐   │
       │   │ SUCCESS │      │  ERROR  │   │
       │   └─────────┘      └─────────┘   │
       │        │                 │        │
       └────────┴─────────────────┴────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  STATISTICS  │
                  │   • Total    │
                  │   • Success  │
                  │   • Failed   │
                  │   • Duration │
                  └──────────────┘
```

---

## 🎨 UI Component Layout

### FileDropzone
```
┌─────────────────────────────────────────────────────────┐
│                     FILE DROPZONE                        │
│                                                          │
│              ┌─────────────────────────┐                │
│              │     ☁️  UPLOAD ICON     │                │
│              │                         │                │
│              │  Drag & Drop or Click   │                │
│              │      to Upload          │                │
│              │                         │                │
│              │  Supported: CSV, XLSX   │                │
│              │  PDF, Images, Videos    │                │
│              └─────────────────────────┘                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Statistics                                         │ │
│  │ Total: 5 | Pending: 2 | Success: 3 | Errors: 0   │ │
│  │                                                    │ │
│  │                           [Upload] [Clear All]    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ File List                                          │ │
│  │ ─────────────────────────────────────────────────  │ │
│  │ 📄 data.csv          | [████████░░] 80% | [×]     │ │
│  │ 📊 report.xlsx       | [✓] Success      | [×]     │ │
│  │ 📑 document.pdf      | [⏱] Pending      | [×]     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### LinkCollector
```
┌─────────────────────────────────────────────────────────┐
│                    LINK COLLECTOR                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Add Link Source                                    │ │
│  │ ────────────────────────────────────────────────── │ │
│  │                                                    │ │
│  │ URL: [_________________________________]           │ │
│  │                                                    │ │
│  │ Type: [URL ▼]  Depth: [1 ▼]                      │ │
│  │                                                    │ │
│  │ [✓] Extract Images  [✓] Extract Links            │ │
│  │                                                    │ │
│  │                              [Add to Queue]       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Queue (3 pending)              [Process] [Clear]  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔗 https://example.com  | [⏱] Pending    | [×]   │ │
│  │ 📡 https://feed.rss     | [✓] 45 items   | [×]   │ │
│  │ 🗺️ https://sitemap.xml | [❌] Error      | [×]   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### TelegramConnector
```
┌─────────────────────────────────────────────────────────┐
│                  TELEGRAM CONNECTOR                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📱 Connect Telegram API                            │ │
│  │ ────────────────────────────────────────────────── │ │
│  │                                                    │ │
│  │ API Token: [***************************]          │ │
│  │                                                    │ │
│  │                              [Connect API]        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Add Telegram Source                                │ │
│  │ ────────────────────────────────────────────────── │ │
│  │                                                    │ │
│  │ Channel/Group: [@__________________]              │ │
│  │                                                    │ │
│  │ Filters:                                          │ │
│  │ [✓] Media  [✓] Links  [ ] Forwards               │ │
│  │ Min Length: [100+ chars ▼]                        │ │
│  │                                                    │ │
│  │                              [Add Source]         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Active Sources                                     │ │
│  │ ────────────────────────────────────────────────── │ │
│  │ 👤 @tech_news_ua  | 5,420 members | 150 msgs  [🔄]│ │
│  │ 👥 Tech Group     | 1,234 members | 45 msgs   [🔄]│ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### TaskStream
```
┌─────────────────────────────────────────────────────────┐
│                      TASK STREAM                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Total: 5 | Processing: 2 | Success: 2 | Failed: 1 │ │
│  │                           [Auto-Refresh: ON]       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [All] [Processing] [Completed] [Failed]            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📄 customs_data.csv                          [▼]   │ │
│  │    [████████████████████] 100% • 2m 15s     [✓]   │ │
│  │    └─ Logs: Upload → Parse → Validate → Index     │ │
│  │                                                    │ │
│  │ 🔗 https://feed.rss                          [▼]   │ │
│  │    [██████████░░░░░░░░░░] 65% • 1m 30s      [⏱]   │ │
│  │    └─ Logs: Fetch → Parse → Extract...           │ │
│  │                                                    │ │
│  │ 📱 @tech_channel                             [▼]   │ │
│  │    [████░░░░░░░░░░░░░░░░] 30% • 45s         [⏱]   │ │
│  │    └─ Logs: Connect → Fetch messages...          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Dark Cyber Theme

```
┌─────────────────────────────────────────────────────┐
│              NEXUS DARK CYBER PALETTE                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Background                                          │
│  ───────────                                         │
│  Default:  #0a0e1a  ████████████████                │
│  Paper:    #111827  ████████████████                │
│  Elevated: #1a1f35  ████████████████                │
│                                                      │
│  Primary                                             │
│  ───────                                             │
│  Main:     #00f2ff  ████████████████  (Cyan)       │
│  Glow:     rgba(0, 242, 255, 0.3)                   │
│                                                      │
│  Accent Colors                                       │
│  ─────────────                                       │
│  Cyan:     #00f2ff  ████████████████                │
│  Purple:   #8a2be2  ████████████████                │
│  Pink:     #ff006e  ████████████████                │
│  Green:    #00ff88  ████████████████                │
│  Yellow:   #ffd700  ████████████████                │
│  Orange:   #ff7b00  ████████████████                │
│                                                      │
│  Status                                              │
│  ──────                                              │
│  Success:  #00ff88  ████████████████  (Green)      │
│  Warning:  #ffd700  ████████████████  (Yellow)     │
│  Error:    #ff006e  ████████████████  (Pink)       │
│  Info:     #00f2ff  ████████████████  (Cyan)       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📐 Component Hierarchy

```
App
 └─ Router
     └─ IngestPage
         ├─ Header
         │   ├─ Title
         │   └─ Description
         │
         ├─ FlowCanvas (Mini Data Flow)
         │   ├─ Source Nodes
         │   ├─ Process Nodes
         │   ├─ Storage Nodes
         │   └─ Output Nodes
         │
         ├─ Tabs Navigation
         │   ├─ Files Tab
         │   ├─ Links Tab
         │   ├─ Telegram Tab
         │   └─ Status Tab (with badge)
         │
         └─ Tab Content (AnimatePresence)
             ├─ FileDropzone
             │   ├─ Dropzone Area
             │   ├─ Statistics Bar
             │   └─ File List
             │       └─ FileItem[]
             │           ├─ Icon
             │           ├─ Name
             │           ├─ Progress Bar
             │           └─ Actions
             │
             ├─ LinkCollector
             │   ├─ Input Form
             │   │   ├─ URL Input
             │   │   ├─ Type Select
             │   │   ├─ Options
             │   │   └─ Add Button
             │   ├─ Statistics Bar
             │   └─ Link List
             │       └─ LinkItem[]
             │           ├─ Icon
             │           ├─ URL
             │           ├─ Status
             │           └─ Actions
             │
             ├─ TelegramConnector
             │   ├─ API Connection Form
             │   │   ├─ Token Input
             │   │   └─ Connect Button
             │   ├─ Source Form
             │   │   ├─ Identifier Input
             │   │   ├─ Filters
             │   │   └─ Add Button
             │   ├─ Statistics Bar
             │   └─ Source List
             │       └─ SourceItem[]
             │           ├─ Avatar
             │           ├─ Name & Stats
             │           ├─ Status
             │           └─ Actions
             │
             └─ TaskStream
                 ├─ Statistics Bar
                 ├─ Filter Tabs
                 └─ Task List
                     └─ TaskItem[]
                         ├─ Avatar
                         ├─ Details
                         │   ├─ Name
                         │   ├─ Progress Bar
                         │   └─ Metadata
                         ├─ Status Icon
                         └─ Expandable Logs
```

---

## 🎬 Animation Flow

```
    Page Load
        │
        ▼
  ┌──────────┐
  │  Fade In │
  └──────┬───┘
         │
         ▼
  ┌──────────────┐
  │ Flow Canvas  │◄─── Nodes appear left-to-right
  │   Animate    │     with staggered delay
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │   Tab Bar    │◄─── Slide in from top
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ Tab Content  │◄─── Fade in + slide up
  └──────────────┘
         │
         ▼
    User Interaction
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
  Files Links Telegram
    │    │    │
    └────┼────┘
         │
         ▼
  ┌──────────────┐
  │ Smooth Tab   │◄─── Fade out old content
  │  Transition  │     Fade in new content
  └──────┬───────┘     with slide animation
         │
         ▼
    Status Updates
         │
         ▼
  ┌──────────────┐
  │  Auto-Update │◄─── Real-time progress bars
  │  Animations  │     Pulsing indicators
  └──────────────┘     Smooth transitions
```

---

## 📱 Responsive Behavior

```
Desktop (>1200px)
┌─────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐ │
│ │               Full Width Layout                  │ │
│ │  • Wide Flow Canvas                              │ │
│ │  • 4 visible tabs                                │ │
│ │  • Spacious file/link lists                      │ │
│ │  • Side-by-side statistics                       │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

Tablet (768px - 1200px)
┌──────────────────────────────────┐
│ ┌──────────────────────────────┐ │
│ │    Adapted Layout            │ │
│ │  • Compact Flow Canvas       │ │
│ │  • Scrollable tabs           │ │
│ │  • Stacked statistics        │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘

Mobile (<768px)
┌───────────────────┐
│ ┌───────────────┐ │
│ │ Mobile Layout │ │
│ │ • Hidden Flow │ │
│ │ • Tab icons   │ │
│ │ • List view   │ │
│ └───────────────┘ │
└───────────────────┘
```

---

**Generated:** January 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete

🎯 **Visual guide for Ingest Hub components!**
