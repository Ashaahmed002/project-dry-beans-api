const API_BASE_URL = 'http://localhost:3000/beans';
let currentEditingId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadBeans();
    setupForm();
});

async function loadBeans() {
    try {
        showLoading(true);
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const beans = await response.json();

        if (!beans || !Array.isArray(beans)) {
            throw new Error('Invalid data format received from server');
        }

        if (beans.length === 0) {
            showMessage('No beans found in database');
        } else {
            renderBeansTable(beans);
        }
    } catch (error) {
        console.error('Failed to load beans:', error);
        showError(`Failed to load beans: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function renderBeansTable(beans) {
    const tableBody = document.getElementById('beansTableBody');
    tableBody.innerHTML = '';

    beans.forEach(bean => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bean.id || bean._id || 'N/A'}</td>
            <td>${bean.Class || bean.class || 'N/A'}</td>
            <td>${formatNumber(bean.Area || bean.area)}</td>
            <td>${formatNumber(bean.Perimeter || bean.perimeter)}</td>
            <td>
                <button class="btn btn-sm btn-info view-btn" data-id="${bean.id || bean._id}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${bean.id || bean._id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${bean.id || bean._id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    setupButtonEventListeners();
}

function setupButtonEventListeners() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const beanId = e.currentTarget.getAttribute('data-id');
            try {
                const response = await fetch(`${API_BASE_URL}/${beanId}`);
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }
                const bean = await response.json();
                showBeanDetails(bean);
            } catch (error) {
                console.error('Error viewing bean:', error);
                showError(`Error viewing bean: ${error.message}`);
            }
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const beanId = e.currentTarget.getAttribute('data-id');
            try {
                const response = await fetch(`${API_BASE_URL}/${beanId}`);
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }
                const bean = await response.json();
                populateEditForm(bean);
            } catch (error) {
                console.error('Error editing bean:', error);
                showError(`Error editing bean: ${error.message}`);
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteBean);
    });
}

function setupForm() {
    const form = document.getElementById('beanForm');
    const cancelBtn = document.getElementById('cancelBtn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveBean();
    });

    cancelBtn.addEventListener('click', resetForm);
}

async function saveBean() {
    try {
        const formData = {
            class: document.getElementById('beanClass').value,
            area: parseFloat(document.getElementById('beanArea').value),
            perimeter: parseFloat(document.getElementById('beanPerimeter').value),
            major_axis_length: parseFloat(document.getElementById('beanMajorAxis').value),
            minor_axis_length: parseFloat(document.getElementById('beanMinorAxis').value)
        };

        const url = currentEditingId ? `${API_BASE_URL}/${currentEditingId}` : API_BASE_URL;
        const method = currentEditingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const result = await response.json();
        resetForm();
        await loadBeans();
        showMessage(`Bean ${currentEditingId ? 'updated' : 'created'} successfully!`);
    } catch (error) {
        console.error('Error saving bean:', error);
        showError(`Failed to save bean: ${error.message}`);
    }
}

function showBeanDetails(bean) {
    const modalContent = document.getElementById('beanDetailsContent');
    modalContent.innerHTML = `
        <div class="bean-detail-row">
            <div class="bean-detail-label">Class:</div>
            <div class="bean-detail-value">${bean.Class || bean.class || 'N/A'}</div>
        </div>
        <div class="bean-detail-row">
            <div class="bean-detail-label">Area:</div>
            <div class="bean-detail-value">${formatNumber(bean.Area || bean.area)}</div>
        </div>
        <div class="bean-detail-row">
            <div class="bean-detail-label">Perimeter:</div>
            <div class="bean-detail-value">${formatNumber(bean.Perimeter || bean.perimeter)}</div>
        </div>
        <div class="bean-detail-row">
            <div class="bean-detail-label">Major Axis Length:</div>
            <div class="bean-detail-value">${formatNumber(bean.MajorAxisLength || bean.major_axis_length)}</div>
        </div>
        <div class="bean-detail-row">
            <div class="bean-detail-label">Minor Axis Length:</div>
            <div class="bean-detail-value">${formatNumber(bean.MinorAxisLength || bean.minor_axis_length)}</div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
}

function populateEditForm(bean) {
    document.getElementById('beanId').value = bean.id || bean._id;
    document.getElementById('beanClass').value = bean.Class || bean.class || '';
    document.getElementById('beanArea').value = bean.Area || bean.area || '';
    document.getElementById('beanPerimeter').value = bean.Perimeter || bean.perimeter || '';
    document.getElementById('beanMajorAxis').value = bean.MajorAxisLength || bean.major_axis_length || '';
    document.getElementById('beanMinorAxis').value = bean.MinorAxisLength || bean.minor_axis_length || '';

    document.getElementById('formTitle').textContent = 'Edit Bean';
    document.getElementById('cancelBtn').classList.remove('d-none');
    currentEditingId = bean.id || bean._id;

    document.getElementById('beanForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteBean(e) {
    if (!confirm('Are you sure you want to delete this bean?')) return;

    const beanId = e.currentTarget.getAttribute('data-id');
    try {
        const response = await fetch(`${API_BASE_URL}/${beanId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        await loadBeans();
        showMessage('Bean deleted successfully!');
    } catch (error) {
        console.error('Error deleting bean:', error);
        showError(`Failed to delete bean: ${error.message}`);
    }
}

function resetForm() {
    document.getElementById('beanForm').reset();
    document.getElementById('beanId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Bean';
    document.getElementById('cancelBtn').classList.add('d-none');
    currentEditingId = null;
}

// Helper functions
function formatNumber(value) {
    return value ? Number(value).toFixed(2) : 'N/A';
}

function showLoading(show) {
    const loader = document.createElement('div');
    loader.id = 'loadingIndicator';
    loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
    if (show) {
        document.body.appendChild(loader);
    } else {
        const existingLoader = document.getElementById('loadingIndicator');
        if (existingLoader) existingLoader.remove();
    }
}

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = 'alert alert-success';
        messageDiv.style.display = 'block';
        setTimeout(() => messageDiv.style.display = 'none', 3000);
    }
}

function showError(message) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = 'alert alert-danger';
        messageDiv.style.display = 'block';
    }
}