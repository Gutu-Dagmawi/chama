import type { Category } from './types';

const API_BASE = 'http://localhost:3000';

// Loading helpers
function showLoading(message = 'Loading...') {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="spinner"></div>
      <div class="loading-text">${message}</div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

export function setupCategories() {
  const container = document.getElementById('tab-categories');
  if (!container) return;
  renderCategoryList(container);
}

async function renderCategoryList(container: HTMLElement) {
  showLoading('One sec, loading things up for you');
  try {
    container.innerHTML = '<h2>Categories</h2><div id="categories-list"></div><button id="add-category-btn">Add Category</button>';
    const listDiv = container.querySelector('#categories-list') as HTMLDivElement;
    const addBtn = container.querySelector('#add-category-btn') as HTMLButtonElement;
    addBtn.onclick = () => renderCategoryForm(container);
    const categories = await fetchCategories();
    listDiv.innerHTML = categories.length ? `<table class="crud-list"><thead><tr><th>Name</th><th>Actions</th></tr></thead><tbody>${categories.map(c => `<tr><td>${c.name}</td><td><button data-id="${c.id}" class="edit">Edit</button> <button data-id="${c.id}" class="delete">Delete</button></td></tr>`).join('')}</tbody></table>` : '<p>No categories found.</p>';
    listDiv.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', () => renderCategoryForm(container, categories.find(c => c.id === +(btn as HTMLButtonElement).dataset.id!))));
    listDiv.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Delete this category?')) { await deleteCategory(Number((btn as HTMLButtonElement).dataset.id!)); renderCategoryList(container); } }));
  } finally {
    hideLoading();
  }
}

function renderCategoryForm(container: HTMLElement, category?: Category) {
  container.innerHTML = `<h2>${category ? 'Edit' : 'Add'} Category</h2>
    <form class="crud-form" id="category-form">
      <label>Name<input name="name" required value="${category?.name || ''}" /></label>
      <button type="submit">${category ? 'Update' : 'Create'}</button>
      <button type="button" id="cancel-btn">Cancel</button>
    </form>`;
  const form = container.querySelector('#category-form') as HTMLFormElement;
  form.onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (category) {
      await updateCategory(category.id, data);
    } else {
      await createCategory(data);
    }
    renderCategoryList(container);
  };
  form.querySelector('#cancel-btn')!.addEventListener('click', () => renderCategoryList(container));
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) return [];
  return res.json();
}

async function createCategory(data: any) {
  showLoading('One sec, loading things up for you');
  try {
    await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } finally {
    hideLoading();
  }
}

async function updateCategory(id: number, data: any) {
  showLoading('One sec, loading things up for you');
  try {
    await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } finally {
    hideLoading();
  }
}

async function deleteCategory(id: number) {
  showLoading('One sec, loading things up for you');
  try {
    await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
  } finally {
    hideLoading();
  }
} 