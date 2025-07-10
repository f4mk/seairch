export const MSG_INITIALIZE_AI = 'initialize_ai'
export const MSG_FETCH_AI_MESSAGE = 'fetch_ai_message'
export const MSG_SEARCH_AI_MESSAGE_STREAM = 'search_ai_message_stream'
export const MSG_AI_STREAM_CHUNK = 'ai_stream_chunk'
export const MSG_GET_AI_MODELS = 'get_ai_models'
export const MSG_VALIDATE_AI_API_KEY = 'validate_ai_api_key'
export const MSG_RESET_AI = 'reset_ai'
export const MSG_GET_DIALOGS = 'get_dialogs'
export const MSG_DELETE_DIALOG = 'delete_dialog'

export const MESSAGE_TYPES = [
  MSG_INITIALIZE_AI,
  MSG_FETCH_AI_MESSAGE,
  MSG_SEARCH_AI_MESSAGE_STREAM,
  MSG_AI_STREAM_CHUNK,
  MSG_GET_AI_MODELS,
  MSG_VALIDATE_AI_API_KEY,
  MSG_RESET_AI,
  MSG_GET_DIALOGS,
  MSG_DELETE_DIALOG,
] as const
