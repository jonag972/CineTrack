# CinéTrack - Your Movie Companion 🎬

CinéTrack is a personal student project built with React Native and Expo. This application serves as a comprehensive movie management platform where users can discover, search, track, and organize their movie experiences.

## What This Application Does

CinéTrack provides a complete movie exploration and management experience:

- **Browse Movies**: Discover trending, currently playing, and upcoming films with high-quality posters and essential information at a glance
- **Search Functionality**: Find specific movies by title or explore films by genre categories
- **Detailed Movie Information**: Access comprehensive movie details including:
  - Synopsis and plot overview
  - Cast information with character names
  - User ratings and release year
  - Similar movie recommendations
- **Personal Collection Management**:
  - Keep track of movies you've watched
  - Save favorite films for quick access
  - Create custom-themed collections with personalized descriptions
  - Add/remove movies to/from any collection
  - Manage collection details (rename, update description)
- **User Profile System**:
  - Create and manage your personal account
  - Secure authentication with email and password
  - View collection statistics in your profile
  - Access app settings and preferences
- **iOS-Inspired User Interface**:
  - Clean, intuitive navigation with tab-based structure
  - Native-feeling interactions and animations
  - Dark theme with blur effects for an immersive experience
  - Adaptive layouts for different device sizes

## Installation and Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the application

   ```bash
   npx expo start
   ```

In the terminal output, you'll find options to open the app in:

- An iOS simulator
- An Android emulator
- Expo Go app (by scanning the QR code with your mobile device)

## Documentation

### Project Structure

- `app/` - Main application screens and navigation
  - `(tabs)/` - Tab-based navigation screens (home, search, collections, profile)
  - `movie/` - Movie detail screens
  - `collections/` - Collection management screens
  - `_layout.tsx` - Root navigation configuration
- `components/` - Reusable UI components
- `services/` - API integration for movie data
- `utils/` - Utility functions and helpers
- `lib/` - Core functionality libraries
- `assets/` - Static resources like images

### Technologies

- **React Native** - Mobile application framework
- **Expo** - Development platform and toolchain
- **TypeScript** - Type safety and improved developer experience
- **Expo Router** - File-based navigation system
- **AsyncStorage** - Local data persistence
- **Axios** - API request management
- **React Native Safe Area Context** - Safe area management
- **Expo BlurView** - Native blur effects for iOS-style visuals

### Building for Production

#### For iOS

```bash
npx expo run:ios
```

#### For Android

```bash
npx expo run:android
```

### Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements.

### Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
