# Drips Subgraph Repository

Code for building and deploying the subgraph (a graphQL database instance built on [The Graph](https://thegraph.com/)) for 💦 [drips.network](https://drips.network/).

Drips is an 💎 Ethereum protocol for creating continuous funding streams (Drips) and splitting funding streams among multiple recipients. With Drips there are no 💸 commissions, predatory 👔 middle-men, or 🏦 banks involved.

Drips is a part of the [Radicle](https://radicle.xyz/) ecosystem of projects. See the [Drips docs](https://v2.docs.drips.network/docs/whats-a-drip.html) for more details about the Drips protocol and how to use it.

### How To Use This Repository

Most end users and developers building on Drips will not have a reason to clone or fork this repository. For details on how to access the public subgraph endpoints maintained by the Drips team, please see [here](https://v2.docs.drips.network/docs/for-developers/smart-contract-and-subgraph-details).

However, for contributors to the Drips protocol, the following commands may be helpful if you wish to make changes to this repository:

1. Calling `yarn prepare:goerli` (where `goerli` can be replaced with any network that has a config the `config/` dir) will build the `subgraph.yaml` file by injecting appropriate values into `subgraph.template.yaml` from the corresponding file in the `config` dir. This should be done before deploying the subgraph for the network in question.

2. Calling `graph codegen` generates .ts files in the `generated` folder based on the contract ABIs in `abis/`. In general, this only
   needs to be done if the ABIs are updated and should be the same across all networks.

3. Calling `graph build` compiles .wasm files (and collects related files) that will be sent to the server(s) that will
   host and serve the subgraph instance. This will process the code in `src/` and is useful if you want to check that the code is free of simple compile errors, or if you want to actually push a new subgraph deployment.

4. Calling `yarn deploy:goerli` will deploy to the subgraph instance specified in package.json. Most contributors will not need to call this, unless they have set up their own test instance, as calling this requires first calling `graph auth` with an appropriate auth key parameter for the subgraph in question.
