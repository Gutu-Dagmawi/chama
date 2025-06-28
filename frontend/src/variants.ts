import type { Variant, Product } from './types';

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

export function setupVariants() {
  const container = document.getElementById('tab-variants');
  if (!container) return;
  renderVariantList(container);
}

async function renderVariantList(container: HTMLElement) {
  showLoading('One sec, loading things up for you');
  try {
    container.innerHTML = '<h2>Variants</h2><div id="variants-list"></div><button id="add-variant-btn">Add Variant</button>';
    const listDiv = container.querySelector('#variants-list') as HTMLDivElement;
    const addBtn = container.querySelector('#add-variant-btn') as HTMLButtonElement;
    addBtn.onclick = async () => await renderVariantForm(container);
    
    // Fetch both variants and products
    const [variants, products] = await Promise.all([fetchVariants(), fetchProducts()]);
    
    // Create a map for quick product lookup
    const productMap = new Map(products.map(p => [p.id, p]));
    
    listDiv.innerHTML = variants.length ? `<table class="crud-list"><thead><tr><th>Image</th><th>SKU</th><th>Color</th><th>Size</th><th>Product</th><th>Actions</th></tr></thead><tbody>${variants.map(v => {
      const product = productMap.get(v.product_id);
      const productName = product ? `${product.name} (${product.brand})` : v.product_id;
      return `<tr><td>${v.images && v.images.length ? `<img src='${v.images[0]}' class='variant-img' alt='variant image' />` : ''}</td><td>${v.sku}</td><td><span style='display:inline-flex;align-items:center;gap:0.5em;'><span style='display:inline-block;width:22px;height:22px;border-radius:5px;border:1.5px solid #374151;background:${v.color};box-shadow:0 1px 4px rgba(20,24,32,0.18);'></span><span>${v.color}</span></span></td><td>${v.size}</td><td>${productName}</td><td><button data-sku="${v.sku}" class="edit">Edit</button> <button data-sku="${v.sku}" class="delete">Delete</button></td></tr>`;
    }).join('')}</tbody></table>` : '<p>No variants found.</p>';
    
    listDiv.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', async () => await renderVariantForm(container, variants.find(v => v.sku === (btn as HTMLButtonElement).dataset.sku))));
    listDiv.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Delete this variant?')) { await deleteVariant((btn as HTMLButtonElement).dataset.sku!); renderVariantList(container); } }));
  } finally {
    hideLoading();
  }
}

async function renderVariantForm(container: HTMLElement, variant?: Variant) {
  // Fetch products for the dropdown
  const products = await fetchProducts();
  
  container.innerHTML = `<h2>${variant ? 'Edit' : 'Add'} Variant</h2>
    <form class="crud-form" id="variant-form">
      <label>SKU<input name="sku" required value="${variant?.sku || ''}" ${variant ? 'readonly' : ''} /></label>
      <label>Color<input name="color" required value="${variant?.color || ''}" type="color" style="width:48px;height:32px;padding:0;border:none;" /></label>
      <label>Size<input name="size" type="number" required value="${variant?.size || ''}" /></label>
      ${!variant ? `<label>Product<select name="product_id" required>
        <option value="">Select a product...</option>
        ${products.map(p => `<option value="${p.id}">${p.name} (${p.brand})</option>`).join('')}
      </select></label>` : ''}
      <label>Images<input name="images" type="file" multiple accept="image/*" /></label>
      <button type="submit">${variant ? 'Update' : 'Create'}</button>
      <button type="button" id="cancel-btn">Cancel</button>
    </form>
    ${variant ? '<p style="color: #a1a7b7; font-size: 0.9em; margin-top: 1rem;">Note: Product cannot be changed for existing variants. SKU cannot be changed.</p>' : ''}`;
  
  const form = container.querySelector('#variant-form') as HTMLFormElement;
  form.onsubmit = async e => {
    e.preventDefault();
    
    // Check if we have file inputs (images)
    const fileInput = form.querySelector('input[name="images"]') as HTMLInputElement;
    const hasImages = fileInput && fileInput.files && fileInput.files.length > 0;
    
    if (variant) {
      // For editing
      if (hasImages) {
        // We have images, use FormData
        const formData = new FormData();
        
        // Add all form fields except SKU (which is in the URL)
        const formDataObj = Object.fromEntries(new FormData(form).entries());
        Object.entries(formDataObj).forEach(([key, value]) => {
          if (key !== 'sku') {
            formData.append(`variant[${key}]`, value as string);
          }
        });
        
        // Add images
        Array.from(fileInput.files).forEach(file => {
          formData.append('images[]', file);
        });
        
        console.log('Update form data with images:', formData);
        await updateVariant(variant.sku, formData);
      } else {
        // No images, use JSON format
        const data = Object.fromEntries(new FormData(form).entries());
        console.log('Form data:', data);
        console.log('Original variant:', variant);
        
        // For editing, don't send product_id as it should remain the same
        delete data.product_id;
        
        // Check if SKU was changed
        const newSku = data.sku as string;
        const originalSku = variant.sku;
        
        console.log('Original SKU:', originalSku);
        console.log('New SKU:', newSku);
        console.log('Original SKU type:', typeof originalSku);
        console.log('New SKU type:', typeof newSku);
        
        // Validate that we have a valid original SKU
        if (!originalSku) {
          console.error('Original SKU is missing or null:', originalSku);
          alert('Error: Original SKU is missing. Please try again.');
          return;
        }
        
        if (newSku !== originalSku) {
          // SKU was changed - we need to handle this differently
          // For now, let's prevent SKU changes during edit to avoid complexity
          alert('SKU cannot be changed during edit. Please create a new variant instead.');
          return;
        }
        
        console.log('Calling updateVariant with SKU:', originalSku);
        await updateVariant(originalSku, data);
      }
    } else {
      // For creating
      if (hasImages) {
        // We have images, use FormData
        const formData = new FormData();
        
        // Add all form fields to variant parameter
        const formDataObj = Object.fromEntries(new FormData(form).entries());
        Object.entries(formDataObj).forEach(([key, value]) => {
          if (key !== 'images') {
            formData.append(`variant[${key}]`, value as string);
          }
        });
        
        // Add images separately (not nested under variant)
        Array.from(fileInput.files).forEach(file => {
          formData.append('images[]', file);
        });
        
        console.log('Create form data with images:', formData);
        await createVariant(formData);
      } else {
        // No images, use JSON format
        const data = Object.fromEntries(new FormData(form).entries());
        console.log('Create form data without images:', data);
        await createVariant(data);
      }
    }
    renderVariantList(container);
  };
  form.querySelector('#cancel-btn')!.addEventListener('click', () => renderVariantList(container));
}

async function fetchVariants(): Promise<Variant[]> {
  const res = await fetch(`${API_BASE}/variants`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.variants || [];
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.products || [];
}

async function createVariant(data: FormData | any) {
  showLoading('One sec, loading things up for you');
  try {
    let response: Response;
    
    if (data instanceof FormData) {
      // Handle FormData (with images)
      response = await fetch(`${API_BASE}/variants`, {
        method: 'POST',
        body: data // FormData will automatically set the correct Content-Type header
      });
    } else {
      // Handle regular data object (without images)
      response = await fetch(`${API_BASE}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant: data })
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('Variant creation failed:', error);
    alert(`Failed to create variant: ${error.message}`);
  } finally {
    hideLoading();
  }
}

async function updateVariant(sku: string, data: FormData | any) {
  showLoading('One sec, loading things up for you');
  try {
    let response: Response;
    
    if (data instanceof FormData) {
      // Handle FormData (with images)
      response = await fetch(`${API_BASE}/variants/${sku}`, {
        method: 'PUT',
        body: data
      });
    } else {
      // Handle regular data object (without images)
      // Remove SKU from the request body since it's in the URL
      const { sku: _, ...updateData } = data;
      
      console.log('Update data without SKU:', updateData);
      
      response = await fetch(`${API_BASE}/variants/${sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant: updateData })
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('Variant update failed:', error);
    alert(`Failed to update variant: ${error.message}`);
  } finally {
    hideLoading();
  }
}

async function deleteVariant(sku: string) {
  showLoading('One sec, loading things up for you');
  try {
    const response = await fetch(`${API_BASE}/variants/${sku}`, { method: 'DELETE' });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('Variant deletion failed:', error);
    alert(`Failed to delete variant: ${error.message}`);
  } finally {
    hideLoading();
  }
} 