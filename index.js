const foodItems = [];
const baseFoodId = 'fooditem';
const dailyCalorieLimit = 2000;

// подсчет калорий
window.addFoodItem = function() {
    const form = document.forms.caloriesForm;
    const calories = parseInt(form.elements.calories.value) || 0;
    const weight = parseInt(form.elements.weight.value) || 100;

    if (!form.elements.product.value.trim()) {
        alert('Пожалуйста, введите название продукта');
        return;
    }

    const calculatedCalories = Math.round(calories * weight / 100);

    const newFoodItem = {
        id: Date.now(),
        product: form.elements.product.value.trim(),
        calories: calculatedCalories,
        weight: weight,
        color: getColorByCalories(calculatedCalories)
    };

    foodItems.push(newFoodItem);
    renderFoodItem(newFoodItem);
    updateCaloriesSummary();

    form.elements.product.value = '';
    form.elements.calories.value = '';
    form.elements.weight.value = '100';
    form.elements.product.focus();
};

window.deleteFoodItem = function(id) {
    const index = foodItems.findIndex(item => item.id === id);
    if (index !== -1) {
        foodItems.splice(index, 1);
        const element = document.getElementById(baseFoodId + id);
        if (element) {
            element.classList.add('fade-out');
            setTimeout(() => {
                element.remove();
                updateCaloriesSummary();
            }, 300);
        }
    }
};

function renderFoodItem(item) {
    const foodList = document.getElementById('foodItemsList');
    const itemElement = document.createElement('div');
    itemElement.id = baseFoodId + item.id;
    itemElement.className = 'food-item fade-in';

    itemElement.innerHTML = `
        <div class="food-color" style="background-color: ${item.color}"></div>
        <div class="food-info">
            <h3>${item.product}</h3>
            <p>${item.calories} ккал · ${item.weight}г</p>
        </div>
        <button class="delete-btn" onclick="deleteFoodItem(${item.id})">×</button>
    `;

    foodList.prepend(itemElement);
    setTimeout(() => itemElement.classList.remove('fade-in'), 10);
}

function updateCaloriesSummary() {
    const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
    const remainingCalories = Math.max(0, dailyCalorieLimit - totalCalories);
    const percentage = Math.min(Math.round((totalCalories / dailyCalorieLimit) * 100), 100);

    document.getElementById('totalCalories').textContent = totalCalories;
    document.getElementById('remainingCalories').textContent = remainingCalories;

    const progressBar = document.getElementById('caloriesProgress');
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    progressBar.className = 'progress-bar ' +
        (percentage > 100 ? 'bg-danger' :
            percentage > 75 ? 'bg-warning' : 'bg-success');
}

function getColorByCalories(calories) {
    if (calories > 500) return '#E52626';
    if (calories > 300) return '#ff9900';
    if (calories > 100) return '#ffcc00';
    return '#198754';
}

document.addEventListener('DOMContentLoaded', function() {
    updateCaloriesSummary();
    const form = document.forms.caloriesForm;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addFoodItem();
    });
});

// Регистрация и управление Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                setInterval(() => registration.update(), 60000);
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                if (confirm('Доступна новая версия приложения. Обновить?')) {
                                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                                    window.location.reload();
                                }
                            }
                        });
                    }
                });
            });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

function showInstallButton() {
    const installButton = document.createElement('button');
    installButton.textContent = 'Установить приложение';
    installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #E52626;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        z-index: 1000;
        font-family: Bangers, sans-serif;
    `;

    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('PWA установлено');
            }
            deferredPrompt = null;
            installButton.remove();
        }
    });

    document.body.appendChild(installButton);
    setTimeout(() => installButton.remove(), 10000);
}

window.addEventListener('appinstalled', () => {
    console.log('PWA установлено');
});