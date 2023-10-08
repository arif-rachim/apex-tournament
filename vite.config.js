import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
export default defineConfig({
    base: '/apex-tournament/', // Set your desired base URL here
    // Other Vite configuration options...
    plugins: [react()]
});