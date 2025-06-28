import './style.css'
import { setupTabs } from './tabs'
import { setupProducts } from './products'
import { setupCategories } from './categories'
import { setupVariants } from './variants'

document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app')
  if (!app) return
  // Load the tabbed interface HTML
  const res = await fetch('/src/tabs.html')
  app.innerHTML = await res.text()
  setupTabs()
  setupProducts()
  setupCategories()
  setupVariants()
})
