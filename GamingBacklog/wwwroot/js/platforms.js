const uri = 'api/Platforms';
let platforms = [];

function getPlatforms() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayPlatforms(data))
        .catch(error => console.error('Unable to get platforms.', error));
}

function addPlatform() {
    const addNameTextbox = document.getElementById('add-platform-name');

    const platform = {
        name: addNameTextbox.value.trim()
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(platform)
    })
        .then(response => response.json())
        .then(() => {
            getPlatforms();
            addNameTextbox.value = '';
        })
        .catch(error => console.error('Unable to add platform.', error));
}

function deletePlatform(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getPlatforms())
        .catch(error => console.error('Unable to delete platform.', error));
}

function displayEditForm(id) {
    const platform = platforms.find(platform => platform.id === id);

    document.getElementById('edit-platform-id').value = platform.id;
    document.getElementById('edit-platform-name').value = platform.name;
    document.getElementById('editPlatform').style.display = 'block';
}

function updatePlatform() {
    const platformId = document.getElementById('edit-platform-id').value;
    const platform = {
        id: parseInt(platformId, 10),
        name: document.getElementById('edit-platform-name').value.trim()
    };

    fetch(`${uri}/${platformId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(platform)
    })
        .then(() => getPlatforms())
        .catch(error => console.error('Unable to update platform.', error));

    closeInput();
    return false;
}

function closeInput() {
    document.getElementById('editPlatform').style.display = 'none';
}

function _displayPlatforms(data) {
    const tBody = document.getElementById('platforms');
    tBody.innerHTML = '';

    const button = document.createElement('button');

    data.forEach(platform => {
        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${platform.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deletePlatform(${platform.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        let textNode = document.createTextNode(platform.name);
        td1.appendChild(textNode);

        let td2 = tr.insertCell(1);
        td2.appendChild(editButton);

        let td3 = tr.insertCell(2);
        td3.appendChild(deleteButton);
    });

    platforms = data;
}