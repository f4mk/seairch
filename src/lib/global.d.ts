type ValueOf<T> = T[keyof T]
type KeyedRecord<T extends Record<string, string>, U> = Record<ValueOf<T>, U>
