import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const target = document.getElementById('app');

if (!target) {
  throw new Error("Elemento target #app non trovato nel DOM!");
}

const app = mount(App, {
  target: target,
})

export default app