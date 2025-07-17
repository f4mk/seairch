import React from 'react'

import { SubscribeFunction } from './types'

export const StreamEventsContext = React.createContext<SubscribeFunction | null>(null)
