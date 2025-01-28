export const AnalyticsEvents = {
  // User Actions
  USER: {
    SIGN_IN: 'user_sign_in',
    SIGN_OUT: 'user_sign_out',
    UPDATE_PROFILE: 'user_update_profile',
  },
  // Space Actions
  SPACE: {
    CREATE: 'space_create',
    JOIN: 'space_join',
    LEAVE: 'space_leave',
    UPDATE: 'space_update',
    DELETE: 'space_delete',
  },
  // Channel Actions
  CHANNEL: {
    CREATE: 'channel_create',
    JOIN: 'channel_join',
    LEAVE: 'channel_leave',
    UPDATE: 'channel_update',
    DELETE: 'channel_delete',
    TYPE_SWITCH: 'channel_type_switch', // When switching between text/voice/video
  },
  // Message Actions
  MESSAGE: {
    SEND: 'message_send',
    EDIT: 'message_edit',
    DELETE: 'message_delete',
    FILE_UPLOAD: 'message_file_upload',
  },
  // Error Events
  ERROR: {
    API: 'error_api',
    AUTH: 'error_auth',
    UPLOAD: 'error_upload',
    SOCKET: 'error_socket',
  },
  // Performance
  PERFORMANCE: {
    PAGE_LOAD: 'performance_page_load',
    API_LATENCY: 'performance_api_latency',
    SOCKET_LATENCY: 'performance_socket_latency',
  }
} as const;
