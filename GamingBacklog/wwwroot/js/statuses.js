const uri = 'api/Status'; 
let statuses = [];

function getStatuses() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayStatuses(data))
        .catch(error => console.error('Unable to get status.', error));
}

function addStatus() {
    const addNameTextbox = document.getElementById('add-status-name');

    const status = {
        name: addNameTextbox.value.trim()
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(status)
    })
        .then(response => response.json())
        .then(() => {
            getStatuses();
            addNameTextbox.value = '';
        })
        .catch(error => console.error('Unable to add status.', error));
}

function deleteStatus(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getStatuses())
        .catch(error => console.error('Unable to delete status.', error));
}

function displayEditForm(id) {
    const item = statuses.find(status => status.id === id);

    document.getElementById('edit-status-id').value = status.id;
    document.getElementById('edit-status-name').value = status.name;
    document.getElementById('editStatus').style.display = 'block';
}

function updateStatus() {
    const statusId = document.getElementById('edit-status-id').value;
    const status = {
        id: parseInt(statusId, 10),
        name: document.getElementById('edit-status-name').value.trim()
    };

    fetch(`${uri}/${statusId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(status)
    })
        .then(() => getStatuses())
        .catch(error => console.error('Unable to update status.', error));

    closeInput();
    return false;
}

function closeInput() {
    document.getElementById('editStatus').style.display = 'none';
}

function _displayStatuses(data) {
    const tBody = document.getElementById('statuses');
    tBody.innerHTML = '';
    
    const button = document.createElement('button');

    data.forEach(status => {
        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${status.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deleteStatus(${status.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        let textNode = document.createTextNode(status.name);
        td1.appendChild(textNode);

        let td2 = tr.insertCell(1);
        td2.appendChild(editButton);

        let td3 = tr.insertCell(2);
        td3.appendChild(deleteButton);
    });

    statuses = data;
}