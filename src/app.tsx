import type { Component } from 'solid-js'
import { useRoutes } from '@solidjs/router'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { routes } from './routes'
import { SignerProvider } from './hooks/signer'

const qc = new QueryClient()

const App: Component = () => {
  const Route = useRoutes(routes)
  return (
    <>
      <QueryClientProvider client={qc}>
        <SignerProvider>
          <main class="h-100vh w-100% max-w-500px p-5">
            <Route />
          </main>
        </SignerProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
