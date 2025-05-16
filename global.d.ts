interface Window { 
    HubSpotConversations?: {
      widget: {
        load: () => void
        open: () => void
        refresh: () => void
        status: () => { loaded: boolean; pending: boolean }
      }
    }
    hsConversationsSettings?: {
      debug?: boolean
      loadImmediately?: boolean
    }
  }