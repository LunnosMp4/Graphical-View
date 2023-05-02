const vscode = require('vscode');
let config = vscode.workspace.getConfiguration('graphical-view');
let groups = config.get('groups');

async function manageWebview() {
    const panel = vscode.window.createWebviewPanel(
        'manage-groups', // Webview identifier
        'Manage Groups', // Webview title
        vscode.ViewColumn.One,
        {
            enableScripts: true,
        }
    );

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Groups</title>
    </head>
    <body>
    <!-- Bouton "Create new group" qui ouvre l'interface de création de groupe -->
    <button id="create-group-button">Create new group</button>

    <!-- Interface de création de groupe -->
    <div id="create-group-interface" style="display: none;">

        <label for="files-select">Select files:</label>
        <select id="files-select" multiple>
            <option value="file1">File 1</option>
            <option value="file2">File 2</option>
            <option value="file3">File 3</option>
        </select>

        <label for="group-name-input">Group name:</label>
        <input type="text" id="group-name-input">

        <label for="group-color-input">Group color:</label>
        <input type="color" id="group-color-input">

        <button id="create-group-submit-button">Create group</button>
    </div>

    </body>
    </html>
    
    <script>
    const groups = ${JSON.stringify(groups)};

    // Récupérer les éléments de l'interface
    const createGroupButton = document.getElementById('create-group-button');
    const createGroupInterface = document.getElementById('create-group-interface');
    const filesSelect = document.getElementById('files-select');
    const groupNameInput = document.getElementById('group-name-input');
    const groupColorInput = document.getElementById('group-color-input');
    const createGroupSubmitButton = document.getElementById('create-group-submit-button');

    // Afficher l'interface de création de groupe lorsque le bouton "Create new group" est cliqué
    createGroupButton.addEventListener('click', function () {
        createGroupInterface.style.display = 'block';
    });

    // Remplir la liste de sélection avec les noms de fichiers
    // Cette fonction devra être appelée depuis le script principal de l'extension pour récupérer les noms de fichiers
    function populateFilesSelect(filenames) {
    for (const filename of filenames) {
        // Créer une option pour chaque fichier
        let option = document.createElement('option');
        option.value = filename;
        option.text = filename;
        filesSelect.appendChild(option);
    }
    }

    // Valider la création du groupe lorsque le bouton "Create group" est cliqué
    createGroupSubmitButton.addEventListener('click', function () {
        createGroupInterface.style.display = 'none';
    });
    </script>

    <style>
    body {
        font-family: sans-serif;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }
    
    button {
        display: block;
        width: 100%;
        padding: 10px;
        font-size: 1rem;
        background-color: #0072c6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    button:hover {
        background-color: #005c99;
    }
    
    button:active {
        background-color: #004c6a;
    }
    
    #create-group-interface {
        display: none;
        background-color: transparent;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 20px;
        margin: 20px 0;
    }
    
    label {
        display: block;
        margin-bottom: 5px;
        font-size: 0.9rem;
    }
    
    input[type='text'],
    input[type='color'] {
        display: block;
        width: 100%;
        height: 34px;
        padding: 6px 12px;
        font-size: 1rem;
        color: #555;
        background-color: transparent;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    
    select {
        display: block;
        width: 100%;
        height: 200px;
        padding: 6px 12px;
        font-size: 1rem;
        color: #555;
        background-color: transparent;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    </style>

    `
    
    panel.webview.html = html;
}

module.exports = {
    manageWebview,
};