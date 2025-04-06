const API_BASE_URL = 'http://localhost:3000/beans';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Load initial data
    loadBeans();
    
    // Set up search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        filterBeans(e.target.value);
    });
    
    // Set up add bean form
    document.getElementById('addBeanForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await addBean();
    });
    
    // Set up edit bean form
    document.getElementById('editBeanForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await updateBean();
    });
});

function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

// Check for saved theme preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
}

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

function filterBeans(searchTerm) {
    const rows = document.querySelectorAll('#beansTableBody tr');
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
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
            <td>${formatNumber(bean.MajorAxisLength || bean.major_axis_length)}</td>
            <td>${formatNumber(bean.MinorAxisLength || bean.minor_axis_length)}</td>
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
    // View button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const beanId = this.getAttribute('data-id');
            await viewBean(beanId);
        });
    });

    // Edit button
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const beanId = this.getAttribute('data-id');
            await loadBeanForEdit(beanId);
        });
    });

    // Delete button
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const beanId = this.getAttribute('data-id');
            await deleteBean(beanId);
        });
    });
}

async function viewBean(beanId) {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/${beanId}`);

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const bean = await response.json();

        const modalContent = document.getElementById('beanDetailsContent');
        modalContent.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>Class:</h6>
                    <p>${bean.Class || bean.class || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Area:</h6>
                    <p>${formatNumber(bean.Area || bean.area)}</p>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>Perimeter:</h6>
                    <p>${formatNumber(bean.Perimeter || bean.perimeter)}</p>
                </div>
                <div class="col-md-6">
                    <h6>Major Axis Length:</h6>
                    <p>${formatNumber(bean.MajorAxisLength || bean.major_axis_length)}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h6>Minor Axis Length:</h6>
                    <p>${formatNumber(bean.MinorAxisLength || bean.minor_axis_length)}</p>
                </div>
            </div>
        `;

        const viewModal = new bootstrap.Modal(document.getElementById('viewBeanModal'));
        viewModal.show();
    } catch (error) {
        console.error('Error viewing bean:', error);
        showError(`Error viewing bean: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function loadBeanForEdit(beanId) {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/${beanId}`);

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const bean = await response.json();

        document.getElementById('editBeanId').value = bean.id || bean._id;
        document.getElementById('editBeanClass').value = bean.Class || bean.class || '';
        document.getElementById('editBeanArea').value = bean.Area || bean.area || '';
        document.getElementById('editBeanPerimeter').value = bean.Perimeter || bean.perimeter || '';
        document.getElementById('editBeanMajorAxis').value = bean.MajorAxisLength || bean.major_axis_length || '';
        document.getElementById('editBeanMinorAxis').value = bean.MinorAxisLength || bean.minor_axis_length || '';

        const editModal = new bootstrap.Modal(document.getElementById('editBeanModal'));
        editModal.show();
    } catch (error) {
        console.error('Error loading bean for edit:', error);
        showError(`Error loading bean for editing: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function addBean() {
    try {
        showLoading(true);
        const formData = {
            class: document.getElementById('addBeanClass').value,
            area: parseFloat(document.getElementById('addBeanArea').value),
            perimeter: parseFloat(document.getElementById('addBeanPerimeter').value),
            major_axis_length: parseFloat(document.getElementById('addBeanMajorAxis').value),
            minor_axis_length: parseFloat(document.getElementById('addBeanMinorAxis').value)
        };

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const result = await response.json();
        
        // Close the modal and refresh the table
        const addModal = bootstrap.Modal.getInstance(document.getElementById('addBeanModal'));
        addModal.hide();
        
        await loadBeans();
        showMessage('Bean added successfully!');
    } catch (error) {
        console.error('Error adding bean:', error);
        showError(`Failed to add bean: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function updateBean() {
    try {
        showLoading(true);
        const beanId = document.getElementById('editBeanId').value;
        
        const formData = {
            class: document.getElementById('editBeanClass').value,
            area: parseFloat(document.getElementById('editBeanArea').value),
            perimeter: parseFloat(document.getElementById('editBeanPerimeter').value),
            major_axis_length: parseFloat(document.getElementById('editBeanMajorAxis').value),
            minor_axis_length: parseFloat(document.getElementById('editBeanMinorAxis').value)
        };

        const response = await fetch(`${API_BASE_URL}/${beanId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const result = await response.json();
        
        // Close the modal and refresh the table
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editBeanModal'));
        editModal.hide();
        
        await loadBeans();
        showMessage('Bean updated successfully!');
    } catch (error) {
        console.error('Error updating bean:', error);
        showError(`Failed to update bean: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function deleteBean(beanId) {
    if (!confirm('Are you sure you want to delete this bean?')) return;

    try {
        showLoading(true);
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
    } finally {
        showLoading(false);
    }
}

// Helper functions
function formatNumber(value) {
    return value ? Number(value).toFixed(2) : 'N/A';
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (show) {
        loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
    } else {
        loader.innerHTML = '';
    }
}

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = 'alert alert-success';
    messageDiv.style.display = 'block';
    setTimeout(() => messageDiv.style.display = 'none', 3000);
}

function showError(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = 'alert alert-danger';
    messageDiv.style.display = 'block';
}
