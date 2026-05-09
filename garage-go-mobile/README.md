# Garage Go Mobile

Flutter mobile application for garage management and booking system.

## Features

- **Authentication**: Secure login and registration with JWT tokens
- **Garage Discovery**: Find and browse nearby garages
- **Booking System**: Schedule service appointments
- **Vehicle Management**: Track your vehicles and service history
- **Real-time Updates**: Push notifications for booking status
- **User Profile**: Manage your account and preferences

## Tech Stack

- **Framework**: Flutter 3.0+
- **State Management**: Riverpod (Flutter Riverpod)
- **Navigation**: Go Router
- **HTTP Client**: Dio with Retrofit
- **Local Storage**: Shared Preferences & Flutter Secure Storage
- **Notifications**: Firebase Messaging & Local Notifications
- **UI**: Material 3 Design System
- **Validation**: Form Builder Validators

## Project Structure

```
lib/
├── core/                    # Core utilities and configurations
│   ├── app/               # App configuration
│   ├── constants/         # App constants and endpoints
│   ├── router/           # Navigation setup
│   ├── services/         # Core services (storage, notifications)
│   ├── theme/            # App themes and styles
│   └── utils/            # Utility functions
├── features/               # Feature modules
│   ├── auth/            # Authentication feature
│   ├── home/            # Home screen
│   ├── garages/         # Garage browsing
│   ├── bookings/        # Booking management
│   ├── vehicles/        # Vehicle management
│   ├── profile/         # User profile
│   ├── notifications/   # Notifications
│   ├── splash/          # Splash screen
│   └── onboarding/      # Onboarding flow
├── shared/              # Shared components and models
└── widgets/             # Reusable widgets
```

## Getting Started

### Prerequisites

- Flutter SDK 3.0+
- Dart SDK 2.17+
- Android Studio / VS Code
- Android SDK / Xcode (for iOS)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd garage-go-mobile
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Generate code:
   ```bash
   flutter packages pub run build_runner build
   ```

4. Run the app:
   ```bash
   flutter run
   ```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
BASE_URL=http://localhost:3000/api/v1

# Firebase Configuration (optional)
FCM_API_KEY=your_fcm_api_key
```

## Architecture

### Clean Architecture

The app follows Clean Architecture principles with clear separation of concerns:

- **Presentation Layer**: UI components, pages, widgets, and state management
- **Domain Layer**: Business logic, use cases, and entities
- **Data Layer**: Repository implementations, data sources, and models

### State Management

Using Riverpod for reactive state management:

- **Providers**: Global state providers for services and data
- **Notifiers**: State notifiers for business logic
- **Consumer Widgets**: UI components that consume state

### Navigation

Go Router for declarative navigation:

- **Route Definitions**: Centralized route configuration
- **Nested Navigation**: Support for bottom navigation and nested routes
- **Route Guards**: Authentication and authorization checks

## Key Features Implementation

### Authentication

- JWT-based authentication with refresh tokens
- Secure storage using Flutter Secure Storage
- Automatic token refresh
- Biometric authentication (future enhancement)

### Real-time Updates

- Firebase Cloud Messaging for push notifications
- Local notifications for in-app alerts
- WebSocket integration for real-time booking updates

### Data Persistence

- Shared Preferences for app settings
- Secure Storage for sensitive data
- Local database for offline support (future enhancement)

## Testing

### Unit Tests

```bash
flutter test
```

### Integration Tests

```bash
flutter test integration_test/
```

### Widget Tests

```bash
flutter test test/widget/
```

## Build & Deployment

### Android

```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
```

## Code Quality

### Linting

```bash
flutter analyze
```

### Formatting

```bash
dart format .
```

## Contributing

1. Follow the existing code style and architecture
2. Write tests for new features
3. Update documentation
4. Create pull requests with clear descriptions

## Dependencies

See `pubspec.yaml` for a complete list of dependencies.

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
