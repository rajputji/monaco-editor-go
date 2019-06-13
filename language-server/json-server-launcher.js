"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var path = require("path");
var rpc = require("@sourcegraph/vscode-ws-jsonrpc");
var server = require("@sourcegraph/vscode-ws-jsonrpc/lib/server");
var lsp = require("vscode-languageserver");
function launch(socket) {
    var reader = new rpc.WebSocketMessageReader(socket);
    var writer = new rpc.WebSocketMessageWriter(socket);
    // start the language server as an external process
    var socketConnection = server.createConnection(reader, writer, function () { return socket.dispose(); });
    var serverConnection = server.createServerProcess('go', path.resolve(__dirname, 'go-langserver'), ['-gocodecompletion', '-freeosmemory=false']);
    server.forward(socketConnection, serverConnection, function (message) {
        if (rpc.isRequestMessage(message)) {
            if (message.method === lsp.InitializeRequest.type.method) {
                var initializeParams = message.params;
                initializeParams.processId = process.pid;
                initializeParams.initializationOptions = {
                    formatTool: "gofmt",
                    gocodeCompletionEnabled: true,
                    funcSnippetEnabled: true,
                };
            }
        }
        return message;
    });

}
exports.launch = launch;
//# sourceMappingURL=json-server-launcher.js.map