const vscode = require('vscode');
let config = vscode.workspace.getConfiguration('graphical-view');
let groups = config.get('groups');

async function initWebview() {

    // Create and show a new webview
    const panel = vscode.window.createWebviewPanel(
        'node-view', // Webview identifier
        'Node View', // Webview title
        vscode.ViewColumn.One,
        {
            enableScripts: true,
        }
    );

    
    async function getFilenames() {
        const files = await vscode.workspace.findFiles();

        const filteredFiles = files.filter(file => file.path.endsWith('.js') || file.path.endsWith('.html') || file.path.endsWith('.css') || file.path.endsWith('.c') || file.path.endsWith('.h') || file.path.endsWith('.cpp') || file.path.endsWith('.rb') || file.path.endsWith('.py') || file.path.endsWith('.java') || file.path.endsWith('.cs') || file.path.endsWith('.swift') || file.path.endsWith('.go') || file.path.endsWith('.php') || file.path.endsWith('.jsx') || file.path.endsWith('.kt') || file.path.endsWith('.rs') || file.path.endsWith('.asm') || file.path.endsWith('.s') || file.path.endsWith('.hs') || file.path.endsWith('.lhs') || file.path.endsWith('.lisp') || file.path.endsWith('.cl') || file.path.endsWith('.pl') || file.path.endsWith('.ps1') || file.path.endsWith('.r') || file.path.endsWith('.ts') || file.path.endsWith('.vb') || file.path.endsWith('.sh') || file.path.endsWith('.m') || file.path.endsWith('.h') || file.path.endsWith('.ex') || file.path.endsWith('.exs') || file.path.endsWith('.erl') || file.path.endsWith('.hrl') || file.path.endsWith('.groovy') || file.path.endsWith('.jl') || file.path.endsWith('.ml') || file.path.endsWith('.mli') || file.path.endsWith('.sb2') || file.path.endsWith('.sb3') || file.path.endsWith('.st') || file.path.endsWith('.tcl'));
    
        const filenames = filteredFiles.map(file => file.fsPath.split('/').pop());
    
        return filenames;
    }
    
    // Get filenames from the current workspace
    let files = await getFilenames();

    function getFileType(filename) {
        let parts = filename.split(".");
        return parts[parts.length - 1];
    }

    function getColorForFileType(fileType) {
        if (fileType == "html") return "#e34c26";
        if (fileType == "css") return "#563d7c";
        if (fileType == "js") return "#f1e05a";
    }

    let groups = {};

    function createNode(filename) {
        let fileType = getFileType(filename);

        let node = {
            name: filename,
            label: filename,
            group: fileType,
            color: getColorForFileType(fileType)
        };

        if (!groups[fileType]) {
            groups[fileType] = {
                nodes: [node]
            };
        } else {
            groups[fileType].nodes.push(node);
        }

        return node;
    }

    let nodes = [];
    for (let i = 0; i < files.length; i++) {
        let node = createNode(files[i]);
        node.id = i;
        nodes.push(node);
    }

    let links = [];
    for (let groupName in groups) {
        let group = groups[groupName];
        let nodes = group.nodes;

        for (let i = 0; i < nodes.length; i++) {
            let j = (i + 1) % nodes.length;
            let source = nodes[i].id;
            let target = nodes[j].id;

            links.push({source, target});
        }
    }

    const html = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Graph</title>
        </head>
        <body>
            <div id="root"></div>
            <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
            <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
            <script src="https://unpkg.com/react-force-graph-2d@1.23.13/dist/react-force-graph-2d.min.js"></script>
            <script src="https://d3js.org/d3.v5.min.js"></script>
        </body>
    </html>

    <style>
        body {
            overflow: hidden;
        }
    </style>

    <script>
        const vscode = acquireVsCodeApi();
        
        let data = {
            nodes: ${JSON.stringify(nodes)},
            links: ${JSON.stringify(links)}
        };

        const width = window.innerWidth;
        const height = window.innerHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        ReactDOM.render(
            React.createElement(ForceGraph2D, {
                graphData: data,
                width: width,
                height: height,
                d3Force: ['link', 'charge', 'center'],
                d3ForceConfig: {
                    link: { strength: 0.1 },
                    charge: { strength: 10 },
                    center: { x: centerX, y: centerY }
                },
                onNodeClick: (node) => {
                    vscode.postMessage({
                        command: 'nodeClick',
                        text: node.name
                    })
                }}),
            document.getElementById('root')
        );
        </script>
    `;
    panel.webview.html = html;

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
            case 'nodeClick':
            vscode.workspace.openTextDocument(message.text).then((document) => {
                vscode.window.showTextDocument(document);
            }, (error) => {
                vscode.env.openExternal(vscode.Uri.file(message.text));
            });
            break;
        }
    });
}

module.exports = {
    initWebview
}