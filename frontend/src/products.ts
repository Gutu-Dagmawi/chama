import type { Product } from './types';

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

export function setupProducts() {
  const container = document.getElementById('tab-products');
  if (!container) return;
  renderProductList(container);
}

async function renderProductList(container: HTMLElement) {
  showLoading('One sec, loading things up for you');
  try {
    container.innerHTML = '<h2>Products</h2><div id="products-list"></div><button id="add-product-btn">Add Product</button>';
    const listDiv = container.querySelector('#products-list') as HTMLDivElement;
    const addBtn = container.querySelector('#add-product-btn') as HTMLButtonElement;
    addBtn.onclick = () => renderProductForm(container);
    const products = await fetchProducts();
    listDiv.innerHTML = products.length ? `<table class="crud-list"><thead><tr><th>Name</th><th>Type</th><th>Price</th><th>Actions</th></tr></thead><tbody>${products.map(p => `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.base_price}</td><td><button data-id="${p.id}" class="edit">Edit</button> <button data-id="${p.id}" class="delete">Delete</button></td></tr>`).join('')}</tbody></table>` : '<p>No products found.</p>';
    listDiv.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', () => renderProductForm(container, products.find(p => p.id === (btn as HTMLButtonElement).dataset.id))));
    listDiv.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Delete this product?')) { await deleteProduct((btn as HTMLButtonElement).dataset.id!); renderProductList(container); } }));
  } finally {
    hideLoading();
  }
}

function renderProductForm(container: HTMLElement, product?: Product) {
  // Helper to render variant fields
  function renderVariantsFields(variants: any[] = []) {
    return variants.map((v, i) => `
      <div class="variant-fields" data-index="${i}" style="margin-bottom:1.5em;padding:1em;background:#232a36;border-radius:8px;border:1px solid #374151;">
        <label>SKU<input name="variant_sku_${i}" required value="${v.sku || ''}" /></label>
        <label>Color<input name="variant_color_${i}" required value="${v.color || ''}" type="color" style="width:48px;height:32px;padding:0;border:none;" /></label>
        <label>Size<input name="variant_size_${i}" type="number" required value="${v.size || ''}" /></label>
        <label>Image<input name="variant_image_${i}" type="file" accept="image/*" /></label>
        <button type="button" class="btn btn-delete remove-variant-btn" data-index="${i}">Remove</button>
      </div>
    `).join('');
  }
  
  // Fetch and render categories dropdown
  async function renderCategoriesDropdown() {
    try {
      const categories = await fetchCategories();
      const categorySelect = document.querySelector('#category-select') as HTMLSelectElement;
      if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select a category</option>' + 
          categories.map(c => `<option value="${c.id}" ${product?.category_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }
  
  // Initial variants (for edit, or one empty for create)
  let variants = product?.variants?.length ? product.variants : [{ sku: '', color: '#000000', size: 42 }];
  container.innerHTML = `<h2>${product ? 'Edit' : 'Add'} Product</h2>
    <form class="crud-form" id="product-form" enctype="multipart/form-data">
      <label>Name<input name="name" required value="${product?.name || ''}" /></label>
      <label>Type<input name="type" required value="${product?.type || 'Shoe'}" /></label>
      <label>Base Price<input name="base_price" type="number" step="0.01" required value="${product?.base_price || ''}" /></label>
      <label>Description<textarea name="description">${product?.description || ''}</textarea></label>
      <label>Category<select name="category_id" id="category-select" required><option value="">Loading categories...</option></select></label>
      <label>Brand<input name="brand" value="${product?.brand || ''}" /></label>
      <label>Gender<select name="gender"><option value="male" ${product?.gender === 'male' ? 'selected' : ''}>Male</option><option value="female" ${product?.gender === 'female' ? 'selected' : ''}>Female</option></select></label>
      <div id="variants-section">
        <h3 style="margin-bottom:0.5em;">Variants</h3>
        <div id="variants-list">${renderVariantsFields(variants)}</div>
        <button type="button" class="btn btn-add" id="add-variant-btn">Add Variant</button>
      </div>
      <button type="submit">${product ? 'Update' : 'Create'}</button>
      <button type="button" class="btn btn-cancel" id="cancel-btn">Cancel</button>
    </form>`;
  
  // Load categories after form is rendered
  renderCategoriesDropdown();
  
  // Add/remove variant logic
  const form = container.querySelector('#product-form') as HTMLFormElement;
  const variantsList = form.querySelector('#variants-list') as HTMLDivElement;
  form.querySelector('#add-variant-btn')!.addEventListener('click', () => {
    variants.push({ sku: '', color: '#000000', size: 42 });
    variantsList.innerHTML = renderVariantsFields(variants);
    attachRemoveVariantHandlers();
  });
  function attachRemoveVariantHandlers() {
    form.querySelectorAll('.remove-variant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = +(btn as HTMLButtonElement).dataset.index!;
        variants.splice(idx, 1);
        variantsList.innerHTML = renderVariantsFields(variants);
        attachRemoveVariantHandlers();
      });
    });
  }
  attachRemoveVariantHandlers();
  // On submit, build FormData
  form.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('product[name]', (form.elements.namedItem('name') as HTMLInputElement).value);
    fd.append('product[type]', (form.elements.namedItem('type') as HTMLInputElement).value);
    fd.append('product[base_price]', (form.elements.namedItem('base_price') as HTMLInputElement).value);
    fd.append('product[description]', (form.elements.namedItem('description') as HTMLInputElement).value);
    fd.append('product[category_id]', (form.elements.namedItem('category_id') as HTMLSelectElement).value);
    fd.append('product[brand]', (form.elements.namedItem('brand') as HTMLInputElement).value);
    fd.append('product[gender]', (form.elements.namedItem('gender') as HTMLSelectElement).value);
    
    // Gather variants dynamically by scanning form elements
    const variantObjs = [];
    const variantFields = form.querySelectorAll('.variant-fields');
    console.log('Found variant fields:', variantFields.length);
    
    variantFields.forEach((field, i) => {
      const skuInput = field.querySelector(`input[name="variant_sku_${i}"]`) as HTMLInputElement;
      const colorInput = field.querySelector(`input[name="variant_color_${i}"]`) as HTMLInputElement;
      const sizeInput = field.querySelector(`input[name="variant_size_${i}"]`) as HTMLInputElement;
      const imgInput = field.querySelector(`input[name="variant_image_${i}"]`) as HTMLInputElement;
      
      if (skuInput && colorInput && sizeInput) {
        const sku = skuInput.value.trim();
        const color = colorInput.value;
        const size = sizeInput.value;
        
        if (sku && color && size) {
          console.log(`Variant ${i}:`, { sku, color, size });
          // Add variants as nested attributes
          fd.append(`product[variants_attributes][${i}][sku]`, sku);
          fd.append(`product[variants_attributes][${i}][color]`, color);
          fd.append(`product[variants_attributes][${i}][size]`, size);
          
          // Attach image if present
          if (imgInput && imgInput.files && imgInput.files.length > 0) {
            fd.append(`variant_images[${sku}][]`, imgInput.files[0]);
            console.log(`Attached image for variant ${sku}`);
          }
        }
      }
    });
    
    console.log('Total variants to send:', variantFields.length);
    await createProduct(fd);
    renderProductList(container);
  };
  form.querySelector('#cancel-btn')!.addEventListener('click', () => renderProductList(container));
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.products || [];
}

async function fetchCategories(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function createProduct(fd: FormData) {
  showLoading('One sec, loading things up for you');
  try {
    // Log the FormData contents for debugging
    console.log('Sending FormData:');
    for (let [key, value] of fd.entries()) {
      console.log(`${key}:`, value);
    }
    
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      body: fd
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
  } catch (error) {
    console.error('Product creation failed:', error);
    alert(`Failed to create product: ${error.message}`);
  } finally {
    hideLoading();
  }
}

async function updateProduct(uuid: string, data: any) {
  showLoading('One sec, loading things up for you');
  try {
    await fetch(`${API_BASE}/products/${uuid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } finally {
    hideLoading();
  }
}

async function deleteProduct(uuid: string) {
  showLoading('One sec, loading things up for you');
  try {
    await fetch(`${API_BASE}/products/${uuid}`, { method: 'DELETE' });
  } finally {
    hideLoading();
  }
} 