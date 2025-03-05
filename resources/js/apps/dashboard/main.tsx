"use client"
import ReactDOM from 'react-dom/client';
import '@/styles/index.css';
import { AppProvider } from './provider';
import { AppRouter } from './router';
import 'intersection-observer';

const App = () => {
    return (
      <AppProvider>
        <AppRouter  />
      </AppProvider>
    )
}

ReactDOM.createRoot(document.getElementById('app')!).render(<App />);