const uriBacklog = 'api/UserBacklogs';
const uriGames = 'api/Games';

const currentUserId = localStorage.getItem('userId'); 
const currentUsername = localStorage.getItem('username');

// ПЕРЕВІРКА: Якщо користувач не увійшов, повертаємо його на головну
if (!currentUserId) {
    window.location.href = 'index.html';
}

// Відображаємо ім'я користувача на сторінці відразу при завантаженні
document.addEventListener("DOMContentLoaded", () => {
    const userNameSpan = document.getElementById('user-name');
    if (userNameSpan) {
        userNameSpan.innerText = currentUsername || "Користувач";
    }
});

//  Функція ВИХОДУ
//  Функція, яку викликає кнопка "Вийти з акаунту" в шапці
function logout() {
     document.getElementById('logoutModal').style.display = 'flex';
}

//  Функція для кнопки "Скасувати"
function closeLogoutModal() {
    document.getElementById('logoutModal').style.display = 'none';
}

//  Функція для кнопки "Так, вийти"
function confirmLogout() {
    localStorage.clear(); 
    window.location.href = 'index.html'; 
}

let backlogData = [];

// 1. Завантаження довідників при старті
async function initializePage() {

    document.getElementById('user-name').innerText = currentUsername || "Користувач";

    await fillSelect('api/Genres', 'sel-genre');
    await fillSelect('api/Platforms', 'sel-platform');
    await fillSelect('api/Status', 'sel-status'); 

    copyOptions('sel-genre', 'filter-genre', 'Усі жанри');
    copyOptions('sel-platform', 'filter-platform', 'Усі платформи');
    copyOptions('sel-status', 'filter-status', 'Усі статуси');

    getBacklog();
}
function copyOptions(sourceId, targetId, defaultText) {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    target.innerHTML = `<option value="">${defaultText}</option>` + source.innerHTML;
    if (target.options[1] && target.options[1].value === "") target.remove(1);
}

async function fillSelect(apiUrl, selectId) {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const select = document.getElementById(selectId);
    data.forEach(item => {
        let opt = document.createElement('option');
        opt.value = item.id;
        opt.innerHTML = item.name;
        select.appendChild(opt);
    });
}

// 2. Отримання беклогу (використовуємо метод з Include)
function getBacklog() {
    fetch(`${uriBacklog}/user/${currentUserId}`)
        .then(response => {
            if (response.status === 404) return []; 
            return response.json();
        })
        .then(data => _displayBacklog(data))
        .catch(error => console.error('Помилка отримання беклогу.', error));
}

// 3. ДОДАТИ ГРУ (Прецедент: Додати гру до списку)
async function addBacklogItem() {
    const titleInput = document.getElementById('add-game-title');
    const title = titleInput.value.trim();
    const gId = document.getElementById('sel-genre').value;
    const pId = document.getElementById('sel-platform').value;
    const sId = document.getElementById('sel-status').value;
    const interest = document.getElementById('add-interest').value;

    if (!title || !gId || !pId || !sId || !interest) {
        alert("Будь ласка, заповніть усі поля!");
        return;
    }

    const activeUserId = parseInt(localStorage.getItem('userId'));

    const requestData = {
        gameTitle: title, 
        userId: activeUserId,
        genreId: parseInt(gId),
        platformId: parseInt(pId),
        statusId: parseInt(sId),
        interestLevel: parseInt(interest)
    };

    try {
        const response = await fetch(uriBacklog, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            titleInput.value = '';
            document.getElementById('add-interest').value = '';
            getBacklog();
        } else {
            const errorMsg = await response.text();
            showInfoModal(errorMsg); 
        }
    } catch (error) {
        console.error('Помилка:', error);
    }
}

// 4. ОЦІНИТИ ГРУ (Прецедент: Оцінити гру через PATCH)
function rateGame(id) {
    // Зберігаємо ID запису
    document.getElementById('quick-rating-id').value = id;

    // Знаходимо поточну оцінку, щоб підставити її в поле 
    const item = backlogData.find(i => i.id === id);
    if (item && item.finalScore) {
        document.getElementById('quick-rate-value').value = item.finalScore;
    } else {
        document.getElementById('quick-rate-value').value = "";
    }

    // Показуємо блок оцінювання та ховаємо блок статусу 
    document.getElementById('ratingUpdateDiv').style.display = 'block';
    if (document.getElementById('statusUpdateDiv')) {
        document.getElementById('statusUpdateDiv').style.display = 'none';
    }

    // Плавно прокручуємо до форми
    document.getElementById('ratingUpdateDiv').scrollIntoView({ behavior: 'smooth' });
}

async function saveQuickRating() {
    const id = document.getElementById('quick-rating-id').value;
    const score = document.getElementById('quick-rate-value').value;

    if (!score || score < 1 || score > 10) {
        alert("Будь ласка, введіть коректну оцінку від 1 до 10");
        return;
    }

    try {
        // Викликаємо  метод PATCH
        const response = await fetch(`${uriBacklog}/${id}/rate?score=${score}`, {
            method: 'PATCH'
        });

        if (response.ok) {
            getBacklog(); 
            document.getElementById('ratingUpdateDiv').style.display = 'none';
        } else {
            alert("Помилка при збереженні оцінки на сервері.");
        }
    } catch (error) {
        console.error('Помилка мережі:', error);
    }
}

// Функція для перетворення числа в зірочки
function getStars(score) {
    if (!score || score === 0) return "—";

    // Перетворюємо шкалу 1-10 у 1-5 (наприклад, 7 стає 3.5)
    let rating = score / 2;
    let html = '<div class="star-rating">';

    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            // Малюємо цілу зірку
            html += '<span class="star-full">★</span>';
        } else if (i - 0.5 === rating) {
            // Малюємо половинку (якщо рейтинг закінчується на .5)
            html += '<span class="star-half">★</span>';
        } else {
            // Малюємо порожню зірку
            html += '<span>★</span>';
        }
    }

    html += '</div>';
    return html;
}

// 5. ОНОВИТИ СТАТУС (Прецедент: Оновити статус проходження через PATCH)
function updateStatus(id) {
    // Зберігаємо ID запису, який хочемо змінити
    document.getElementById('quick-status-id').value = id;

    // Копіюємо список статусів з основного селекта у наш новий селект
    const source = document.getElementById('sel-status');
    const target = document.getElementById('quick-sel-status');
    target.innerHTML = source.innerHTML;

    // Знаходимо поточний статус цього запису в даних, щоб відразу вибрати його в списку
    const item = backlogData.find(i => i.id === id);
    if (item) {
        target.value = item.statusId;
    }

    // Показуємо блок зміни статусу
    document.getElementById('statusUpdateDiv').style.display = 'block';
    // Прокручуємо до форми, щоб користувач її бачив
    document.getElementById('statusUpdateDiv').scrollIntoView({ behavior: 'smooth' });
}
async function saveQuickStatus() {
    const id = document.getElementById('quick-status-id').value;
    const statusId = document.getElementById('quick-sel-status').value;

    if (!statusId) {
        alert("Будь ласка, виберіть статус");
        return;
    }

    try {
        // Викликаємо  PATCH метод, який ми створили в контролері
        const response = await fetch(`${uriBacklog}/${id}/status?statusId=${statusId}`, {
            method: 'PATCH'
        });

        if (response.ok) {
            getBacklog(); 
            document.getElementById('statusUpdateDiv').style.display = 'none';
        } else {
            alert("Не вдалося оновити статус на сервері.");
        }
    } catch (error) {
        console.error('Помилка:', error);
    }
}

// 6. ВИДАЛИТИ (Прецедент: Видалити гру з списку)
function deleteItem(id) {
    document.getElementById('delete-item-id').value = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function showInfoModal(message) {
    document.getElementById('infoModalMessage').innerText = message;
    document.getElementById('infoModal').style.display = 'flex';
}

function closeInfoModal() {
    document.getElementById('infoModal').style.display = 'none';
}

async function confirmDelete() {
    const id = document.getElementById('delete-item-id').value;

    try {
        const response = await fetch(`${uriBacklog}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            getBacklog(); 
            closeDeleteModal(); 
        } else {
            alert("Помилка при видаленні гри з сервера.");
        }
    } catch (error) {
        console.error('Помилка:', error);
    }
}

// 7. ФУНКЦІЇ РЕДАГУВАННЯ
// Відкриття форми редагування
function displayEditForm(id) {
    const item = backlogData.find(i => i.id === id);
    if (!item) return;

    document.getElementById('edit-id').value = item.id;

    // Копіюємо опції в селекти редагування
    copySelectOptions('sel-genre', 'edit-genre');
    copySelectOptions('sel-platform', 'edit-platform');
    copySelectOptions('sel-status', 'edit-status');

    // Підставляємо поточні значення
    document.getElementById('edit-genre').value = item.genreId;
    document.getElementById('edit-platform').value = item.platformId;
    document.getElementById('edit-status').value = item.statusId;
    document.getElementById('edit-interest').value = item.interestLevel;
    document.getElementById('edit-score').value = item.finalScore || "";

    document.getElementById('editBacklog').style.display = 'block';
}

// Допоміжна функція для копіювання списків
function copySelectOptions(sourceId, targetId) {
    const source = document.getElementById(sourceId);
    const target = document.getElementById(targetId);
    if (target.options.length <= 1) {
        target.innerHTML = source.innerHTML;
    }
}

// Відправка оновлених даних (PUT)
async function updateBacklogItem() {
    const id = document.getElementById('edit-id').value;
    const originalItem = backlogData.find(i => i.id == id);

    const updatedItem = {
        id: parseInt(id),
        userId: originalItem.userId,
        gameId: originalItem.gameId,
        genreId: parseInt(document.getElementById('edit-genre').value),
        platformId: parseInt(document.getElementById('edit-platform').value),
        statusId: parseInt(document.getElementById('edit-status').value),
        interestLevel: parseInt(document.getElementById('edit-interest').value),
        finalScore: document.getElementById('edit-score').value ? parseInt(document.getElementById('edit-score').value) : null
    };

    const response = await fetch(`${uriBacklog}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
    });

    if (response.ok) {
        getBacklog();
        closeEditForm();
    }
}
function closeEditForm() {
    document.getElementById('editBacklog').style.display = 'none';
}

// 8. ФУНКЦІЯ ФІЛЬТРАЦІЇ
async function applyFilter() {
    const genreId = document.getElementById('filter-genre').value;
    const platformId = document.getElementById('filter-platform').value;
    const statusId = document.getElementById('filter-status').value;
    const interest = document.getElementById('filter-interest').value;

    let queryParams = [];

    // Додаємо UserId, щоб фільтрувати тільки свої ігри
    queryParams.push(`userId=${currentUserId}`); 

    if (genreId) queryParams.push(`genreId=${genreId}`);
    if (platformId) queryParams.push(`platformId=${platformId}`);
    if (statusId) queryParams.push(`statusId=${statusId}`);
    if (interest) queryParams.push(`interestLevel=${interest}`);

    const url = `${uriBacklog}/filter?${queryParams.join('&')}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        _displayBacklog(data); 
    } catch (error) {
        console.error('Помилка фільтрації:', error);
    }
}

function resetFilter() {
    document.getElementById('filter-genre').value = "";
    document.getElementById('filter-platform').value = "";
    document.getElementById('filter-status').value = "";
    document.getElementById('filter-interest').value = "";
    getBacklog(); 
}

// Відображення таблиці
function _displayBacklog(data) {
    backlogData = data;
    const tBody = document.getElementById('backlog-list');
    const table = document.getElementById('backlog-table');
    const emptyState = document.getElementById('empty-state');

    if (!data || data.length === 0) {
        table.style.display = 'none';      
        emptyState.style.display = 'block'; 
        return;
    } else {
        table.style.display = 'table'; 
        emptyState.style.display = 'none'; 
    }

    tBody.innerHTML = '';

    data.forEach(item => {
        let tr = tBody.insertRow();

        tr.insertCell(0).innerText = item.game ? item.game.title : "Невідома гра";
        tr.insertCell(1).innerText = item.genre ? item.genre.name : "-";
        tr.insertCell(2).innerText = item.platform ? item.platform.name : "-";
        tr.insertCell(3).innerText = item.status ? item.status.name : "-";
        tr.insertCell(4).innerText = item.interestLevel;
        tr.insertCell(5).innerHTML = getStars(item.finalScore);

        let tdActions = tr.insertCell(6);

        let btnEdit = document.createElement('button');
        btnEdit.innerText = '📝 Редагувати';
        btnEdit.onclick = () => displayEditForm(item.id);
        tdActions.appendChild(btnEdit);

        // Кнопка оцінки
        let btnRate = document.createElement('button');
        btnRate.innerText = '⭐ Оцінити гру';
        btnRate.onclick = () => rateGame(item.id);
        tdActions.appendChild(btnRate);

        // Кнопка статусу
        let btnStatus = document.createElement('button');
        btnStatus.innerText = '🔄 Оновити статус проходження гри';
        btnStatus.onclick = () => updateStatus(item.id);
        tdActions.appendChild(btnStatus);

        // Кнопка видалення
        let btnDel = document.createElement('button');
        btnDel.innerText = '🗑️';
        btnDel.style.color = 'red';
        btnDel.onclick = () => deleteItem(item.id);
        tdActions.appendChild(btnDel);
    });
}