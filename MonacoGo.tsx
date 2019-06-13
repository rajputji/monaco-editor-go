import React, { useState } from "react";
import "./MonacoGo.css";

import MonacoEditor, { MonacoEditorProps } from "react-monaco-editor";
import { listen, MessageConnection } from "@sourcegraph/vscode-ws-jsonrpc";
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection
} from "monaco-languageclient";
import normalizeUrl from "normalize-url";
import ReconnectingWebSocket from "reconnecting-websocket";

interface EditorProps extends MonacoEditorProps {
  langServer?: {
    host: string;
    port: string;
    path: string;
  };
  value?: string;
}

const MonacoGo: React.FC<EditorProps> = props => {
  console.log(props);
  const [state, setState] = useState({
    value:
      props.value !== undefined
        ? props.value
        : `package main
import "fmt" 

func main(){
}
`
  });
  const editorDidMount = (editor: any, monaco: any) => {
    const modelURI = monaco.Uri.parse("file:go-langserver");
    monaco.languages.register({
      id: "go",
      extensions: [".go"],
      aliases: ["go", "GO"]
    });

    editor.setModel(monaco.editor.createModel(state.value, "go", modelURI));

    if (props.langServer === undefined) return;

    MonacoServices.install(editor);
    const url = createUrl(
      props.langServer.host,
      props.langServer.port,
      props.langServer.path
    );
    const webSocket = (createWebSocket(url) as unknown) as WebSocket;
    // listen when the web socket is opened
    listen({
      webSocket,
      onConnection: connection => {
        // create and start the language client
        const languageClient = createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
      }
    });
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="title">
          Code Editor <span style={{ fontSize: ".5em" }}>(GoLang)</span>{" "}
        </h3>
      </div>
      <MonacoEditor
        language="go"
        theme="vs-dark"
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
          glyphMargin: true,
          lightbulb: {
            enabled: true
          }
        }}
        value={state.value}
        onChange={v => setState({ value: v })}
        editorDidMount={editorDidMount}
        {...props}
      />
    </div>
  );
};

function createUrl(host: string, port: string, path: string) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return normalizeUrl(
    `${protocol}://${host + ":" + port}${
      window.location.pathname === "/" ? "" : window.location.pathname
    }${path}`
  );
}
function createWebSocket(url: string) {
  const socketOptions = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,
    maxRetries: Infinity,
    debug: false
  };
  return new ReconnectingWebSocket(url, undefined, socketOptions);
}
function createLanguageClient(connection: MessageConnection) {
  return new MonacoLanguageClient({
    name: "Monaco Language Client",
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ["go"],
      // disable the default error handler
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart
      }
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(
          createConnection(connection as any, errorHandler, closeHandler)
        );
      }
    }
  });
}

export default MonacoGo;
