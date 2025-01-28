# Changelog

## [1.1.0] - 2024-03-21

### Added
- Server/client boundary optimizations for improved performance
- Comprehensive error handling system in space layouts
- Enhanced session management with secure cookie policies
- Improved invite modal with better UX and validation
- Real-time SSE connection management with auto-reconnect

### Fixed
- Proper HTML structure in error and layout components
- Authentication redirect loops in middleware
- Server-side import path resolution issues
- Type safety improvements across components
- SSE connection cleanup on unmount

### Changed
- Reorganized layout structure for better maintainability
- Optimized React provider hierarchy
- Implemented proper error boundaries with logging
- Enhanced gradient background handling
- Improved state management with URL parameters

### Security
- Added rate limiting for authentication routes
- Implemented proper CORS policies
- Enhanced session cookie security
- Added request validation middleware
