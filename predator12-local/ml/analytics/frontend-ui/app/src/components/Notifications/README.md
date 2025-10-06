# Notification Center Component

The NotificationCenter component provides a global notification system for Predator Analytics, displaying real-time alerts and updates to users. It connects to a WebSocket endpoint for real-time notifications and provides a user-friendly interface for managing those notifications.

## Features

- **Real-time notifications** via WebSocket connection
- **Visual and audio alerts** for different notification severities
- **Notification categories**: info, success, warning, error, critical
- **Notification management**: mark as read, delete, clear all
- **Unread count badge** for quick visibility
- **Action buttons** for interactive notifications
- **Connection status indicator** showing WebSocket connection health
- **Responsive design** for all screen sizes
- **User preferences**: customize notification types and settings
- **Notification batching**: optimized performance for high-frequency updates
- **Toast notifications**: pop-up style alerts with auto-dismiss functionality

## Integration

The NotificationCenter can be integrated directly or through the optimized NotificationManager:

```jsx
// Simple integration
import NotificationCenter from './Notifications/NotificationCenter';

const Header = () => {
  return (
    <header>
      {/* ... */}
      <div className="flex items-center">
        <NotificationCenter />
        {/* ... */}
      </div>
    </header>
  );
};

// Optimized integration with batching
import NotificationManager from './Notifications/NotificationManager';

const Header = () => {
  return (
    <header>
      {/* ... */}
      <div className="flex items-center">
        <NotificationManager />
        {/* ... */}
      </div>
    </header>
  );
};

// Toast notification integration
import { ToastProvider, useToast } from './Notifications/ToastProvider';

// Wrap your app with the provider
const App = () => {
  return (
    <ToastProvider
      position="top-right"
      autoCloseDelay={5000}
      pauseOnHover={true}
      theme="cyberpunk"
      animationStyle="slide-right"
    >
      <YourApp />
    </ToastProvider>
  );
};

// Use in components
const YourComponent = () => {
  const { addToast } = useToast();
  
  const showSuccessToast = () => {
    addToast({
      title: "Успіх",
      message: "Операцію успішно виконано",
      severity: "success"
    });
  };
  
  return (
    <button onClick={showSuccessToast}>
      Показати сповіщення
    </button>
  );
};
```

## WebSocket Integration

The system uses global WebSocket context to maintain a shared connection to the notifications endpoint:

```jsx
// Connect to the notifications WebSocket endpoint
const { connectionStatus } = useGlobalWebSocket(
  'notifications',
  {
    onMessage: handleNotification,
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10
  }
);
```

## Performance Optimization

### Notification Batching

The system includes batch processing to optimize performance with high-frequency notifications:

```jsx
// Initialize batching with custom settings
const {
  addNotification,
  isActive: isBatchingActive
} = useNotificationBatching({
  maxBatchSize: 5,       // Maximum batch size
  flushInterval: 800,    // Interval in ms
  onBatchProcess: handleBatchProcess
});
```

Batching provides several performance benefits:
- Reduces DOM updates by processing notifications in groups
- Decreases CPU usage for high-frequency notifications
- Optimizes audio playback by only playing for the highest severity
- Eliminates unnecessary renders

## Notification Format

Notifications should be sent from the backend in the following JSON format:

```json
{
  "type": "notification",
  "id": "unique-id",
  "title": "Notification Title",
  "message": "This is the notification message content",
  "severity": "info", // One of: info, success, warning, error, critical
  "timestamp": "2023-05-15T14:30:00Z",
  "action": {
    "label": "View Details",
    "url": "/details/123",
    "target": "_self" // Optional, defaults to _self
  }
}
```

The `action` field is optional and provides a clickable button within the notification.

## User Preferences

Users can customize their notification preferences through a preferences modal:

- **Type filtering**: Choose which severity levels to receive
- **Sound settings**: Enable/disable notification sounds
- **Auto-close settings**: Set notifications to auto-close after a delay

Preferences are stored both on the server via API and in localStorage (as offline fallback). The system will:

- Filter out notifications of disabled severity types
- Disable sounds if sound setting is turned off
- Automatically close the notification panel after a specified delay if enabled

To access preferences, users can click the settings icon in the notification panel.

### Server Integration

Preferences are synchronized with the server via API endpoints:

```javascript
// To get saved preferences
const preferences = await getNotificationPreferences();

// To update preferences
await updateNotificationPreferences(preferences);

// To reset to defaults
await resetNotificationPreferences();
```

The API handles authentication via JWT tokens and provides appropriate error handling for offline scenarios.

## Sound Alerts

The component can play sound alerts for higher severity notifications:

- Critical and Error notifications play `/notification-critical.mp3`
- Warning notifications play `/notification-warning.mp3`

Make sure these audio files are available in the public directory of your application.

## User Interaction

Users can:

- Click the bell icon to open/close the notification panel
- Click on a notification to mark it as read
- Click on notification action buttons to navigate to related content
- Delete individual notifications
- Mark all notifications as read
- Clear all notifications
- Customize notification preferences via settings

## Toast Notifications

The ToastContainer component provides pop-up style notifications that appear temporarily and automatically dismiss:

### Features:
- **Multiple positions**: top-right, top-left, bottom-right, bottom-left
- **Auto-dismissal**: with animated progress bar
- **Pause on hover**: pauses the dismissal timer when hovering
- **Click to dismiss**: can be dismissed by clicking
- **Severity styles**: different visual styles based on severity
- **Action buttons**: support for actionable notifications
- **Accessibility**: keyboard navigable and screen reader friendly
- **Responsive design**: adapts to different screen sizes
- **Multiple animation styles**: slide, fade, bounce, and cyberpunk glitch effects
- **Smooth animations**: entrance and exit transitions
- **Cyberpunk theme**: glow effects and advanced styling
- **Batch handling**: multiple simultaneous notifications

### Configuration Options:
```jsx
<ToastContainer
  position="top-right"       // Position on screen
  autoClose={true}           // Auto-dismiss toasts
  autoCloseDelay={5000}      // Time before auto-dismiss in ms
  closeOnClick={true}        // Dismiss on click
  pauseOnHover={true}        // Pause timer on hover
  limit={5}                  // Max number of toasts
  animationStyle="slide-right" // Animation style (slide-right, slide-up, fade, bounce, glitch)
  onClose={handleClose}      // Callback when toast closes
/>
```

### Using with Context:
The ToastProvider and useToast hook provide a convenient way to trigger toast notifications from anywhere in your app:

```jsx
// Show a success toast
const { addToast } = useToast();
addToast({
  title: "Успіх",
  message: "Дані успішно збережено",
  severity: "success",
  animationStyle: "bounce", // optional, overrides global setting
  action: {
    label: "Переглянути",
    url: "/data/123"
  }
});

// Show an error toast with a glitch animation
addToast({
  title: "Помилка",
  message: "Не вдалося зберегти дані",
  severity: "error",
  animationStyle: "glitch" // cyberpunk glitch effect
});

// Show notification with fade animation
addToast({
  title: "Інформація",
  message: "Оновлення даних завершено",
  severity: "info",
  animationStyle: "fade"
});
```

### Advanced Toast Implementation:

The toast implementation has several key technical features:

1. **Animation System**:
   - Multiple animation styles (slide, fade, bounce, glitch)
   - Customizable per-toast or globally
   - Smooth entrance and exit animations
   - Cyberpunk-themed visual effects
   - Hardware-accelerated CSS transitions

2. **Exit Animation**:
   - Uses a state-based approach to track exiting toasts
   - Applies CSS transitions for smooth exit animations
   - Properly removes toast from DOM after animation completes
   - Different exit animations based on entrance style

3. **Optimized Rendering**:
   - Minimizes rerenders by using callback references
   - Only updates DOM when toast list changes
   - Uses CSS for animations instead of JavaScript
   - Efficient DOM manipulation

4. **Progress Bar**:
   - Synchronized with timeout through CSS animation
   - Pauses on mouse hover
   - Visually indicates remaining time
   - Glowing effect matching notification severity

5. **Theme Integration**:
   - Uses CSS custom properties for theming
   - Supports a cyberpunk theme with glow effects
   - Responsive to different device sizes
   - Dynamic color handling based on severity

6. **Accessibility**:
   - Keyboard navigable
   - High contrast design
   - Support for screen readers
   - Proper ARIA attributes

### Demo Page:

A comprehensive demo page is available at `/notification-demo` to showcase the various toast notification features.

## Backend Implementation

The backend must implement a WebSocket endpoint at `/ws/notifications` that sends notification objects in the format described above. See the `websockets.py` implementation for details.

## Styling

The notification components use their own CSS files for styling. The components are designed to match the cyberpunk-noir aesthetic of Predator Analytics with:

- Dark backgrounds with subtle borders
- Cyan highlights for active elements
- Red accents for alerts and errors
- Subtle animations for transitions
- Pulsing effects for critical notifications
- Glowing borders matching the notification severity
- Advanced effects like the scanning line in critical notifications
- Custom hover effects with box-shadow glows

## Performance Considerations

The notification system is optimized for performance:

- It limits the maximum number of stored notifications to 50
- It uses CSS transitions and animations instead of JS-driven animations
- It efficiently manages the WebSocket connection via the global context
- It applies preference filtering on the client-side to reduce unnecessary UI updates
- It implements notification batching to handle high-volume messages efficiently
- Toast components use requestAnimationFrame for smoother animations
- DOM updates are minimized by only updating when notifications change
- CSS animations are hardware-accelerated through transform properties
- Event handler optimizations with useCallback 