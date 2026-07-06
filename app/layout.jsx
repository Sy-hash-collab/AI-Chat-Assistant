import './globals.css'

export const metadata = {
  title: 'AI Chat Assistant',
  description: 'Clean UI, server-side API keys, Next.js App Router',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <header className="app__header">
            <div className="logo">AI</div>
            <div className="titles">
              <h1>AI Chatbot</h1>
              <p>Next.js App Router • Vercel AI SDK • Enter to send</p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
