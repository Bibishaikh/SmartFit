document.addEventListener("DOMContentLoaded", function() {
    // Agar localStorage mein koi order nahi hai, toh default order daal do jisme Aftab ho
    if (!localStorage.getItem('userOrders')) {
        const defaultOrders = [
            { orderId: 'SF12567', customerName: 'Aftab', item: 'SmartFit Product', total: '2,798', status: 'Completed' }
        ];
        localStorage.setItem('userOrders', JSON.stringify(defaultOrders));
    }

    loadOrders();
    setupOrderModal();
});

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    const tableBody = document.getElementById('orderTableBody');
    
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (orders.length === 0) {
        tableBody.innerHTML = <tr><td colspan="6" style="text-align: center; padding: 20px; color: #777;">No orders found</td></tr>;
        return;
    }

    // Naye orders ko upar dikhane ke liye reverse()
    orders.slice().reverse().forEach((order, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.orderId || order.id || 'SF12500'}</td>
            <td>${order.customerName || order.customer || order.name || 'Aftab'}</td>
            <td>${order.item || order.itemName || 'SmartFit Product'}</td>
            <td>₹${order.total || order.amount || order.totalPrice || '0'}</td>
            <td><span class="badge ${(order.status || 'Completed').toLowerCase()}">${order.status || 'Completed'}</span></td>
            <td><button onclick="deleteOrder(${index})" style="background: #ff4d4d; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;"><i class="fa-regular fa-trash-can"></i> Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function setupOrderModal() {
    const modal = document.getElementById('orderModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('orderForm');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.style.display = 'flex');
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const newOrder = {
                orderId: 'SF' + Math.floor(10000 + Math.random() * 90000),
                customerName: document.getElementById('custName').value,
                item: document.getElementById('itemName').value,
                total: document.getElementById('itemAmount').value,
                status: document.getElementById('orderStatus').value
            };

            let orders = JSON.parse(localStorage.getItem('userOrders')) || [];
            orders.push(newOrder);
            localStorage.setItem('userOrders', JSON.stringify(orders));

            modal.style.display = 'none';
            form.reset();
            loadOrders();
        });
    }
}

function deleteOrder(index) {
    let orders = JSON.parse(localStorage.getItem('userOrders')) || [];
    const actualIndex = orders.length - 1 - index;
    orders.splice(actualIndex, 1);
    localStorage.setItem('userOrders', JSON.stringify(orders));
    loadOrders();
}