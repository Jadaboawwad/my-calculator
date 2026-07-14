import React, { useState } from 'react'
import UnifiedSystemComplete from './components/UnifiedSystemComplete'
import { HurufModule } from './features/huruf'

function App() {
  const [view, setView] = useState('calculator')

  return (
    <div className="App">
      <div className="flex justify-center gap-2 bg-gray-900 p-2">
        <button
          onClick={() => setView('calculator')}
          className={`rounded px-3 py-1.5 text-sm ${view === 'calculator' ? 'bg-white text-gray-900' : 'text-white'}`}
        >
          الحاسبة
        </button>
        <button
          onClick={() => setView('huruf')}
          className={`rounded px-3 py-1.5 text-sm ${view === 'huruf' ? 'bg-white text-gray-900' : 'text-white'}`}
        >
          نطاق الحروف
        </button>
      </div>
      {view === 'calculator' ? <UnifiedSystemComplete /> : <HurufModule />}
    </div>
  )
}

export default App
