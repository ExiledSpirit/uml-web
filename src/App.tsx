import { Theme } from '@radix-ui/themes'
import Home from '@/pages/page'

function App() {
  return (
    <Theme className='h-screen w-screen' accentColor='green' appearance='dark' radius='none'>
      <Home></Home>      
    </Theme>
  )
}

export default App
