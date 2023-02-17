# Development 🤓

## Linting 🔎

You may encounter linting messages like `Cannot find name 'changetype'`.
This is because the linting is set up against TypeScript, but we are working with AssemblyScript.
You can safely ignore those messages. 🤠

## Running The Tests

To run the tests, install the project dependencies:

```bash
npm i
```

Then, make sure `@graphprotocol/graph-cli` is installed:

```bash
graph --version
```

If not, install it by running:

```bash
npm i -g @graphprotocol/graph-cli
```

Finally, from the root of the project, run the tests:

```bash
npm run test
```
