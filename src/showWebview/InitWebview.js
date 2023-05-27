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
    
        return [filenames, filteredFiles];
    }
    
    // Get filenames from the current workspace
    let [files, filteredFiles] = await getFilenames();

    function getFileType(filename) {
        let parts = filename.split(".");
        return parts[parts.length - 1];
    }

    function getColorForFileType(fileType) {
        const colorMap = {
            html: '#e34c26',     // orange
            css: '#563d7c',      // purple
            js: '#f1e05a',       // yellow
            c: '#555555',        // gray
            h: '#555555',        // gray
            cpp: '#f34b7d',      // pink
            rb: '#701516',       // maroon
            py: '#3572A5',       // blue
            java: '#b07219',     // brown
            cs: '#178600',       // green
            swift: '#ffac45',    // orange
            go: '#00ADD8',       // cyan
            php: '#4F5D95',      // indigo
            jsx: '#61dafb',     // light blue
            kt: '#A97BFF',       // lavender
            rs: '#DEA584',       // light brown
            asm: '#808080',      // dark gray
            s: '#808080',        // dark gray
            hs: '#5E5086',       // dark purple
            lhs: '#5E5086',      // dark purple
            lisp: '#3FB68B',     // teal
            cl: '#00ACD7',       // sky blue
            pl: '#1E9FFF',       // dodger blue
            ps1: '#012456',      // navy
            r: '#198CE7',        // royal blue
            ts: '#2b7489',       // dark cyan
            vb: '#945DB7',       // violet
            sh: '#89e051',       // lime green
            m: '#f0db4f',        // dark yellow
            ex: '#6E4A7E',       // dark lavender
            exs: '#6E4A7E',      // dark lavender
            erl: '#B83998',      // magenta
            hrl: '#B83998',      // magenta
            groovy: '#4298B8',   // medium blue
            jl: '#8A7FDF',       // dark lavender
            ml: '#DC8ADD',       // light lavender
            mli: '#DC8ADD',      // light lavender
            sb2: '#FFEF42',      // golden yellow
            sb3: '#FFEF42',      // golden yellow
            st: '#FF9B55',       // coral
            tcl: '#E4CC98',      // tan
        };
    
        return colorMap[fileType] || '#cccccc'; // default gray
    }

    let groups = {};

    function createNode(filename, filteredFiles) {
        let fileType = getFileType(filename);
        let filePath = filteredFiles.path;

        let node = {
            name: filename,
            label: filename,
            group: fileType,
            color: getColorForFileType(fileType),
            path: filePath
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
        let node = createNode(files[i], filteredFiles[i]);
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
                        text: node.path
                    })
                }}),
            document.getElementById('root')
        );
        </script>
    `;
    panel.webview.html = html;

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage((message) => {
        console.log(message.text);
        switch (message.command) {
            case 'nodeClick':
                try {
                    vscode.workspace.openTextDocument(message.text).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                } catch (error) {
                    console.log(error);
                }
        }
    });
}

module.exports = {
    initWebview
}