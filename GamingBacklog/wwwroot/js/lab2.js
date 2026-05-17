const uri = 'api/Games';
let games = [];

function getGames() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayGames(data))
        .catch(error => console.error('Unable to get games.', error));
}

function addGame() {
    const addTitleTextbox = document.getElementById('add-title');
    const addDescriptionTextbox = document.getElementById('add-description');

    const game = {
        title: addTitleTextbox.value.trim(),
        description: addDescriptionTextbox.value.trim(),
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(game)
    })
        .then(response => response.json())
        .then(() => {
            getGames();
            addTitleTextbox.value = '';
            addDescriptionTextbox.value = '';
        })
        .catch(error => console.error('Unable to add game.', error));
}

function deleteGame(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getGames())
        .catch(error => console.error('Unable to delete game.', error));
}

function displayEditForm(id) {
    const game = games.find(game => game.id === id);

    document.getElementById('edit-id').value = game.id;
    document.getElementById('edit-title').value = game.title;
    document.getElementById('edit-description').value = game.description;
    document.getElementById('editGame').style.display = 'block';
}

function updateGame() {
    const gameId = document.getElementById('edit-id').value;
    const game = {
        id: parseInt(gameId, 10),
        title: document.getElementById('edit-title').value.trim(),
        description: document.getElementById('edit-description').value.trim()
    };

    fetch(`${uri}/${gameId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(game)
    })
        .then(() => getGames())
        .catch(error => console.error('Unable to update game.', error));

    closeInput();

    return false;
}

function closeInput() {
    document.getElementById('editGame').style.display = 'none';
}


function _displayGames(data) {
    const tBody = document.getElementById('games');
    tBody.innerHTML = '';


    const button = document.createElement('button');

    data.forEach(game => {
        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${game.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deleteGame(${game.id})`);

        let tr = tBody.insertRow();


        let td1 = tr.insertCell(0);
        let textNode = document.createTextNode(game.title);
        td1.appendChild(textNode);

        let td2 = tr.insertCell(1);
        let textNodeInfo = document.createTextNode(game.description);
        td2.appendChild(textNodeInfo);

        let td3 = tr.insertCell(2);
        td3.appendChild(editButton);

        let td4 = tr.insertCell(3);
        td4.appendChild(deleteButton);
    });

    games = data;
}
