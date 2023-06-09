const vscode = require('vscode');
let config = vscode.workspace.getConfiguration('graphical-view');
let groups = config.get('groups');

async function getFilenames() {
    const files = await vscode.workspace.findFiles();

    const filteredFiles = files.filter((file) =>
        file.path.match(/\.(js|html|css|c|h|cpp|rb|py|java|cs|swift|go|php|jsx|kt|rs|asm|s|hs|lhs|lisp|cl|pl|ps1|r|ts|vb|sh|m|h|ex|exs|erl|hrl|groovy|jl|ml|mli|sb2|sb3|st|tcl)$/i)
    );
    const filenames = filteredFiles.map(file => file.fsPath.split('/').pop());

    return [filenames, filteredFiles];
}

function getFileFolder(filename) {
    let parts = filename.split("/");
    return parts[parts.length - 2];
}

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

function createNodes(files, filteredFiles, groups) {
    let nodes = [];
    for (let i = 0; i < files.length; i++) {
        let fileType = getFileType(files[i]);
        let filePath = filteredFiles[i].path;

        let node = {
            name: files[i],
            label: files[i],
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

        node.id = i;
        nodes.push(node);
    }
    return nodes;
}

function createLinks(nodes, groups) {
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
    return links;
}

function createforceGraph(nodes, links) {
    const elem = document.getElementById('root');
    const Graph = ForceGraph2D()(elem)
        .graphData({nodes, links})
        .nodeLabel('name')
        .nodeColor(node => node.color)
        .nodeCanvasObjectMode(() => 'before')
        .nodeCanvasObject((node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);
        })
        .linkColor(() => 'rgba(255, 255, 255, 0.2)')
        .linkWidth(1)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(2)
        .linkDirectionalParticleSpeed(0.005)
        .linkDirectionalParticleColor(() => '#ffffff')
        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeClick(node => {
            if (node && node.path) {
                vscode.workspace.openTextDocument(node.path).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });
    return Graph;
}

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
    
    // Get filenames from the current workspace
    let [files, filteredFiles] = await getFilenames();
    
    let groups = {};
    let nodes = createNodes(files, filteredFiles, groups)
    let links = createLinks(nodes, groups)

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
        <button id="toggle-mode">Toggle Mode</button>
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