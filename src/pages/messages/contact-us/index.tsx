import { useState, useEffect, useCallback, useRef } from 'react'

type LogEntry = string


if (!process.env.NEXT_PUBLIC_HUBSPOT_TACKING_CODE) {
    throw new Error('Missing env.NEXT_PUBLIC_HUBSPOT_TACKING_CODE')
}


const ContactUs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [status, setStatus] = useState<string>('Checking...')
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scriptLoadedRef = useRef<boolean>(false)

  const addLog = useCallback((message: string)  => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prevLogs) => [...prevLogs, `[${timestamp}] ${message}`])
  }, [])

  const updateStatus = useCallback((message: string)  => {
    setStatus(message)
  }, [])

  const checkHubspotStatus = useCallback(()  => {
    if (window.HubSpotConversations) {
      try {
        const status = window.HubSpotConversations.widget.status()
        addLog(`Widget status: ${JSON.stringify(status)}`)
        updateStatus(status.loaded ? 'Loaded' : 'Not loaded')
      } catch (e) {
        const error = e as Error
        addLog(`Error checking status: ${error.message}`)
        updateStatus('Error checking status')
      }
    } else {
      addLog('HubSpotConversations not available yet')
      updateStatus('Not available')
    }
  }, [addLog, updateStatus])

  const forceLoadWidget = useCallback(()  => {
    addLog('Attempting to force load widget...')

    if (window.HubSpotConversations) {
      try {
        window.HubSpotConversations.widget.load()
        addLog('Widget load command issued')

        setTimeout(() => {
          checkHubspotStatus()
        }, 1000)
      } catch (e) {
        const error = e as Error
        addLog(`Error loading widget: ${error.message}`)
      }
    } else {
      addLog('HubSpotConversations not available, cannot load widget')
    }
  }, [addLog, checkHubspotStatus])

  const openWidget = useCallback(()  => {
    addLog('Attempting to open widget...')

    if (window.HubSpotConversations) {
      try {
        window.HubSpotConversations.widget.open()
        addLog('Widget open command issued')
      } catch (e) {
        const error = e as Error
        addLog(`Error opening widget: ${error.message}`)
      }
    } else {
      addLog('HubSpotConversations not available, cannot open widget')
    }
  }, [addLog])

  // Load script
  const loadHubspotScript = useCallback(()  => {
    if (scriptLoadedRef.current) return

    addLog('Loading HubSpot script...')
    scriptLoadedRef.current = true

    const script = document.createElement('script')
    script.src = `//js.hs-scripts.com/${process.env.NEXT_PUBLIC_HUBSPOT_TACKING_CODE}.js`
    script.id = 'hs-script-loader'
    script.async = true
    script.defer = true

    script.onload = () => {
      addLog('HubSpot script loaded successfully')
    }

    script.onerror = () => {
      addLog('Error loading HubSpot script')
      updateStatus('Failed to load script')
      scriptLoadedRef.current = false
    }

    document.body.appendChild(script)
  }, [addLog, updateStatus])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.hsConversationsSettings = {
        debug: true,
        loadImmediately: true
      }

      addLog('Page loaded, initializing HubSpot chat test')
      loadHubspotScript()

      statusIntervalRef.current = setInterval(() => {
        checkHubspotStatus()
      }, 5000)
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }

      if (typeof window !== 'undefined') {
        const existingScript = document.getElementById('hs-script-loader')
        if (existingScript) {
          document.body.removeChild(existingScript)
        }
      }

      addLog('HubSpot tester component unmounted')
    }
  }, [addLog, loadHubspotScript, checkHubspotStatus])

  return (
    <>


      <div className="font-sans max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          HubSpot Chat Widget Test
        </h1>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm">
 
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={forceLoadWidget}
              className="bg-orange-400 hover:bg-orange-600 text-white px-4 py-2 rounded-md 
                        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              Force Load Widget
            </button>

            <button
              onClick={openWidget}
              className="bg-orange-400 hover:bg-orange-600  text-white px-4 py-2 rounded-md 
                        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              Open Widget
            </button>

            <button
              onClick={checkHubspotStatus}
              className="bg-orange-400 hover:bg-orange-600 text-white px-4 py-2 rounded-md 
                        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              Check Status
            </button>
          </div>

          <div className="bg-mint-80 p-3 rounded-md border border-mint-100 mb-6">
            <span className="font-medium">Widget status:</span> {status}
          </div>

          <div className="border rounded-md p-3 h-64 overflow-y-auto font-mono text-sm">
            <div className="font-medium mb-2">Debug log:</div>
            {logs.map((log, index) => (
              <div key={index} className="text-gray-700 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}

export default ContactUs
