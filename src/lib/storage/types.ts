import { STORAGE_KEYS } from '@/consts/ai'

export type AIConfig = KeyedRecord<typeof STORAGE_KEYS, string>
