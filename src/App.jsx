import { BrowserRouter } from 'react-router-dom'
import { Providers } from './app/providers'  
import { Router } from './app/Router'

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Router />
      </Providers>
    </BrowserRouter>
  )
}

export default App
