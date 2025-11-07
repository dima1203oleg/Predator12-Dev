# 📚 INGEST HUB - QUICK REFERENCE

## 🎯 Overview

The Ingest Hub is a unified data ingestion center supporting multiple sources:

- 📁 Files (CSV, XLSX, PDF, Images, Videos)
- 🔗 Links (URL, RSS, Sitemap)
- 📱 Telegram (Channels & Groups)
- 📊 Real-time task monitoring

---

## 📂 File Structure

```
/frontend/src/modules/ingest/
├── IngestPage.tsx          # Main hub with tab navigation
├── FileDropzone.tsx        # File upload component (drag & drop)
├── LinkCollector.tsx       # URL/RSS/Sitemap collector
├── TelegramConnector.tsx   # Telegram integration
├── TaskStream.tsx          # Task queue monitor
└── FlowCanvas.tsx          # Data flow visualization
```

---

## 🚀 Quick Start

### Import in Your App

```typescript
import IngestPage from './modules/ingest/IngestPage';

// In your router
<Route path="/ingest" element={<IngestPage />} />
```

### Component Usage

```typescript
// Use individual components
import FileDropzone from './modules/ingest/FileDropzone';
import LinkCollector from './modules/ingest/LinkCollector';
import TelegramConnector from './modules/ingest/TelegramConnector';
import TaskStream from './modules/ingest/TaskStream';

// FileDropzone
<FileDropzone />

// LinkCollector
<LinkCollector />

// TelegramConnector
<TelegramConnector />

// TaskStream with callback
<TaskStream onTaskCountChange={(count) => console.log(`${count} active tasks`)} />
```

---

## 🔧 API Integration Points

### File Upload

```typescript
POST /api/ingest/upload
Content-Type: multipart/form-data

FormData:
  - file: File

Response:
{
  "id": "task-uuid",
  "status": "pending",
  "filename": "data.csv"
}
```

### Link Crawl

```typescript
POST /api/ingest/crawl
Content-Type: application/json

Body:
{
  "url": "https://example.com",
  "type": "url" | "rss" | "sitemap",
  "depth": 1 | 2 | 3,
  "extractImages": true,
  "extractLinks": false
}

Response:
{
  "id": "task-uuid",
  "status": "pending"
}
```

### Telegram Connection

```typescript
// Step 1: Connect API
POST /api/ingest/telegram/connect
Content-Type: application/json

Body:
{
  "token": "telegram-api-token"
}

Response:
{
  "status": "connected",
  "userId": "12345"
}

// Step 2: Subscribe to source
POST /api/ingest/telegram/subscribe
Content-Type: application/json

Body:
{
  "identifier": "@channel" | "invite-link",
  "filters": {
    "media": true,
    "links": true,
    "forwards": false,
    "minLength": 100
  }
}

Response:
{
  "id": "source-uuid",
  "status": "pending"
}

// Step 3: Sync messages
POST /api/ingest/telegram/:id/sync
Response:
{
  "messagesCollected": 150
}
```

### Task Status (WebSocket)

```typescript
// Connect to WebSocket
const ws = new WebSocket("ws://backend/ws/ingest");

// Events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "task.created":
      // { id, type, name, status: 'pending' }
      break;
    case "task.progress":
      // { id, progress: 45, itemsProcessed: 45, itemsTotal: 100 }
      break;
    case "task.completed":
      // { id, status: 'success', itemsProcessed: 100 }
      break;
    case "task.failed":
      // { id, status: 'error', error: 'message' }
      break;
    case "task.log":
      // { id, log: 'Processing...' }
      break;
  }
};
```

---

## 🎨 Theme Customization

### Color Variables

```typescript
import { nexusColorsDark as nexusColors } from "../../theme/nexusThemeV2";

// Background
nexusColors.background.default; // #0a0e1a
nexusColors.background.paper; // #111827
nexusColors.background.elevated; // #1a1f35

// Primary
nexusColors.primary.main; // #00f2ff
nexusColors.primary.glow; // rgba(0, 242, 255, 0.3)

// Status
nexusColors.status.success; // #00ff88
nexusColors.status.warning; // #ffd700
nexusColors.status.error; // #ff006e
nexusColors.status.info; // #00f2ff

// Accent
nexusColors.accent.cyan; // #00f2ff
nexusColors.accent.purple; // #8a2be2
nexusColors.accent.green; // #00ff88
```

### Custom Styling

```typescript
// Example: Custom card style
<Card sx={{
  background: nexusColors.background.paper,
  border: `1px solid ${nexusColors.border.light}`,
  p: 3
}}>
  {/* Content */}
</Card>
```

---

## 📊 Component Props

### FileDropzone

```typescript
interface FileDropzoneProps {
  // No props - fully self-contained
}
```

### LinkCollector

```typescript
interface LinkCollectorProps {
  // No props - fully self-contained
}
```

### TelegramConnector

```typescript
interface TelegramConnectorProps {
  // No props - fully self-contained
}
```

### TaskStream

```typescript
interface TaskStreamProps {
  onTaskCountChange?: (count: number) => void;
}

// Usage
<TaskStream
  onTaskCountChange={(count) => {
    // Update badge count, etc.
    setBadgeCount(count);
  }}
/>
```

### FlowCanvas

```typescript
interface FlowCanvasProps {
  // No props - fully self-contained
}
```

---

## 🔍 Testing Guide

### Manual Testing

#### FileDropzone

1. Drag a file onto the dropzone
2. Verify file appears in list with "pending" status
3. Click "Upload" button
4. Observe progress bar animation
5. Verify status changes to "success"
6. Test with multiple files
7. Test remove individual file
8. Test "Clear All" button

#### LinkCollector

1. Enter a URL (e.g., https://example.com)
2. Verify type auto-detected as "url"
3. Configure crawl depth and options
4. Click "Add to Queue"
5. Verify link appears in list
6. Click "Process"
7. Observe processing status
8. Verify items found count

#### TelegramConnector

1. Enter API token
2. Click "Connect API"
3. Verify connection success
4. Enter channel (e.g., @news)
5. Configure filters
6. Click "Add Source"
7. Verify source appears
8. Click "Connect"
9. Observe connection status
10. Click "Sync" button
11. Verify messages collected updates

#### TaskStream

1. Open Status tab
2. Verify tasks listed
3. Observe auto-refresh
4. Click filter tabs
5. Verify filtering works
6. Expand task details
7. Verify logs displayed
8. Check duration calculation

---

## 🐛 Troubleshooting

### Issue: Files not uploading

**Solution:** Currently using mock upload. Connect to backend API.

### Issue: Progress not updating

**Solution:** Check auto-refresh is enabled. Verify WebSocket connection.

### Issue: Theme colors not applied

**Solution:** Verify `nexusThemeV2.ts` is imported correctly.

### Issue: Animations not smooth

**Solution:** Check framer-motion is installed. Verify browser performance.

### Issue: Telegram connection fails

**Solution:** Currently using mock connection. Implement real Telegram API.

---

## 📈 Performance Tips

### Optimize Re-renders

```typescript
// Use useCallback for handlers
const handleUpload = useCallback(() => {
  // Handler logic
}, [dependencies]);

// Use useMemo for computed values
const stats = useMemo(
  () => ({
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
  }),
  [files],
);
```

### Lazy Loading

```typescript
// Lazy load components
const FileDropzone = lazy(() => import('./FileDropzone'));
const LinkCollector = lazy(() => import('./LinkCollector'));

// Use with Suspense
<Suspense fallback={<CircularProgress />}>
  <FileDropzone />
</Suspense>
```

### Debounce Input

```typescript
import { debounce } from "lodash";

const handleInputChange = debounce((value) => {
  // Handle change
}, 300);
```

---

## 🔐 Security Considerations

### File Upload

- ✅ Validate file types
- ✅ Check file size limits
- ✅ Scan for malware
- ✅ Sanitize filenames

### Link Crawl

- ✅ Validate URLs
- ✅ Check robots.txt
- ✅ Rate limiting
- ✅ Timeout handling

### Telegram

- ✅ Secure token storage
- ✅ Encrypt credentials
- ✅ Validate API responses
- ✅ Handle rate limits

---

## 📚 Related Documentation

- [INGEST_HUB_COMPLETION_REPORT.md](./INGEST_HUB_COMPLETION_REPORT.md) - Full completion report
- [NEXUS_THEME_V2.md](./NEXUS_THEME_V2.md) - Theme documentation
- [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) - Backend API guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment instructions

---

## 🎯 Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🤝 Contributing

### Adding a New Source Type

1. Create new component in `/modules/ingest/`
2. Add tab in `IngestPage.tsx`
3. Add icon and description
4. Implement UI and logic
5. Add to documentation

### Modifying Existing Component

1. Locate component file
2. Update UI/logic
3. Test thoroughly
4. Update documentation
5. Submit PR

---

## 📞 Support

**Issues:** Create issue in GitHub  
**Questions:** Contact development team  
**Documentation:** See related docs above

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Use
