"use client"
import ReactDOM from 'react-dom/client';
import '@/styles/index.css';
import { AppProvider } from './provider';
import { AppRouter } from './router';


const App = () => {
    return (
      <AppProvider>
        <AppRouter  />
      </AppProvider>
    )
}

ReactDOM.createRoot(document.getElementById('app')!).render(<App />);