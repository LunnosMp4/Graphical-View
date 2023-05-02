# graphical-view README

This is a Visual Studio Code extension that provides a graphical view of the files in the current workspace.

## Features

The extension adds two commands to the Command Palette:

`Graphical View: Show WebView`: opens a webview that shows a graph of the files in the current workspace.
`Graphical View: Manage WebView`: opens a configuration dialog to customize the webview.


The webview displays a graph where each file is represented as a node and each node is connected to its adjacent nodes. The nodes are colored according to their file type (HTML, CSS, or JS), and the edges represent the relationships between files.

## Requirements

The extension supports the following configuration options:

`graphical-view.groups`: an array of file types to group together in the graph.

## Usage

To use this extension, open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P) and select one of the two available commands :
- `Show WebView`
- `Manage WebView`

## Credits

This extension is based on the React Force Graph 2D library by [vasturiano](https://github.com/vasturiano)