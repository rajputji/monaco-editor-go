#Follow these steps:

0. Clone the repository in your project's root folder or `src` folder.

1. Copy all the dependencies from `package.json` to your project's `package.json`

2. create a file `config-overrides.js` in your project's root folder with following code :

```javascript
module.exports = (config, env) => {
  config.resolve.alias["vscode"] = require.resolve(
    "monaco-languageclient/lib/vscode-compatibility"
  );
  return config;
};
```

3. change `"start"` script in your `package.json` file as
```
   "start" : "react-app-rewired start"
```
4. `import MoanacoGo from "PATH_TO_EDITOR"` in your react component.

5. start language server by running following command :

```
    node PATH_TO_EDITOR/language-server/server.js
```

6. pass the server details to 'MonacoGo' component for Code Completions :

```jsx
const langServer = {
  //if server address is  =>  localhost:30001/sampleServer
  //host : localhost
  //port : 3001
  //path : /sampleServer
  host: "localhost",
  port: "3001",
  path: "/sampleServer"
};

  <MoanacoGo langServer={langServer} />
```

7. run your react-app :

```
  npm install
  npm start
```
