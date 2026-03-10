export interface GatewayMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

class GatewayAPI {
  async checkHealth(): Promise<boolean> {
    if (window.electronAPI?.checkGateway) {
      return await window.electronAPI.checkGateway()
    }
    return false
  }

  async chat(
    messages: GatewayMessage[],
    onChunk?: (content: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    if (!window.electronAPI?.gatewayChat) {
      throw new Error('Gateway not available in browser mode')
    }

    const message = messages[messages.length - 1]?.content || ''
    
    if (signal) {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(new Error('Request aborted'))
        })
        
        window.electronAPI.gatewayChat(message)
          .then(resolve)
          .catch(reject)
      })
    }

    const result = await window.electronAPI.gatewayChat(message)
    if (onChunk && result) {
      onChunk(result)
    }
    return result
  }

  async executeCode(code: string, language: string): Promise<{ output: string; error?: string }> {
    return { output: '', error: 'Not implemented' }
  }
}

export default new GatewayAPI()
