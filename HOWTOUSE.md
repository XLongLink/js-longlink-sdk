# Official LongLink SDK for JavaScript

## Development
### Set up tools and environment

You need to have [Node.js](https://nodejs.org/en/download/) installed. Node includes npm as its default package manager.

Open the whole package folder with a good code editor, preferably [Visual Studio Code](https://code.visualstudio.com/download). Consider installing VS Code extensions [ES Lint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

In the VS Code top menu: **Terminal** -> **New Terminal**

### Install dependencies

Install dependencies with npm:

```bash
npm i
```

### Write your code

Make necessary changes in **package.json** (name, version, description, keywords, author, homepage and other URLs).

Write your code in **src** folder, and unit test in **test** folder, replacing the original files there.

The VS Code shortcuts for formatting of a code file are: <kbd>Shift</kbd> + <kbd>Alt</kbd> + <kbd>F</kbd> (Windows); <kbd>Shift</kbd> + <kbd>Option (Alt)</kbd> + <kbd>F</kbd> (MacOS); <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> (Linux).

Change code linting and formatting settings in **.prettierrc.js** if you want.

### Test

Test your code with Jest framework:

```bash
npm run test
```

**Note:** Example TypeScript Package uses [husky](https://typicode.github.io/husky/), [pinst](https://github.com/typicode/pinst) and [commitlint](https://commitlint.js.org/) to automatically execute test and [lint commit message](https://www.conventionalcommits.org/) before every commit.

### Build

Build production (distribution) files in your **dist** folder:

```bash
npm run build
```

It generates CommonJS (in **dist/cjs** folder), ES Modules (in **dist/esm** folder), bundled and minified UMD (in **dist/umd** folder), as well as TypeScript declaration files (in **dist/types** folder).

### Try it before publishing

Run:

```bash
npm link
```

[npm link](https://docs.npmjs.com/cli/v6/commands/npm-link) will create a symlink in the global folder, which may be **{prefix}/lib/node_modules/example-typescript-package** or **C:\Users\<username>\AppData\Roaming\npm\node_modules\example-typescript-package**.

Create an empty folder elsewhere, you don't even need to `npm init` (to generate **package.json**). Open the folder with VS Code, open a terminal and just run:

```bash
npm link example-typescript-package
```

This will create a symbolic link from globally-installed example-typescript-package to **node_modules/** of the current folder.

You can then create a, for example, **testnum.ts** file with the content:

```ts
import { Num } from 'example-typescript-package'
console.log(new Num(5).add(new Num(6)).val() === 11)
```

If you don't see any linting errors in VS Code, if you put your mouse cursor over `Num` and see its type, then it's all good.

Whenever you want to uninstall the globally-installed example-typescript-package and remove the symlink in the global folder, run:

```bash
npm uninstall example-typescript-package -g
```

### Prepare to publish

Create an [npm](https://www.npmjs.com/) account.

<details><summary><strong>Click to read this section if you do manual publishing</strong></summary>

#### Manual publishing to npm

Log in:

```bash
npm adduser
```

And publish:

```bash
npm publish
```

</details>

This package is configured to use GitHub Actions CI/CD to automate both the **npm** and **GitHub Packages** publishing process. The following are what you have to do.

#### CI publishing to npm

Follow [npm's official instruction](https://docs.npmjs.com/creating-and-viewing-access-tokens) to create an npm token. Choose "Publish" from the website, or use `npm token create` without argument with the CLI.

If you use 2FA, then make sure it's enabled for **authorization** only instead of **authorization and publishing** (**Edit Profile** -> **Modify 2FA**).

On the page of your newly created or existing GitHub repo, click **Settings** -> **Secrets** -> **New repository secret**, the **Name** should be `NPM_TOKEN` and the **Value** should be your npm token.

#### CI publishing to GitHub Packages

The default configuration of this example package **assumes you publish package with an unscoped name to npm**. GitHub Packages must be named with a scope name such as "@tomchen/example-typescript-package".

Change `scope: '@tomchen'` to your own scope in **.github/workflows/publish.yml**, also change `addscope` in **package.json**.

If you publish package with a scoped name to npm, change the name to something like "@tomchen/example-typescript-package" in **package.json**, and remove the `- run: npm run addscope` line in **.github/workflows/publish.yml**

If you publish your package to npm only, and don't want to publish to GitHub Packages, then delete the lines from `- name: Setup .npmrc file to publish to GitHub Packages` to the end of the file in **.github/workflows/publish.yml**.

(You might have noticed `secret.GITHUB_TOKEN` in **.github/workflows/publish.yml**. You don't need to set up a secret named `GITHUB_TOKEN` actually, it is [automatically created](https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow#about-the-github_token-secret))

### Publish

Now everything is set. The example package has automated tests and upload (publishing) already set up with GitHub Actions:

- Every time you `git push` or a pull request is submitted on your `master` or `main` branch, the package is automatically tested against the desired OS and Node.js versions with GitHub Actions.
- Every time an [**annotated**](https://git-scm.com/book/en/v2/Git-Basics-Tagging#_annotated_tags) (not [lightweight](https://git-scm.com/book/en/v2/Git-Basics-Tagging#_lightweight_tags)) "v*" tag is pushed onto GitHub, a GitHub release is automatically generated from this version, it also automatically publishes to the npm registry and/or GitHub Packages registry to update the package there.
  - [`npm version`](https://docs.npmjs.com/cli/version/) / [`yarn version`](https://yarnpkg.com/cli/version) is useful to create tags.
  - (npm or yarn v1, not yarn v2) You could also add `"postversion": "git push --follow-tags"` to **package.json** file to push it automatically after `npm` or `yarn` `version`.
  - (yarn v1, not v2) because `yarn version` doesn't check whether there are uncommitted changes, you can add `"preversion": "git diff-index --quiet HEAD --"` to **package.json**
    - Note: `preversion`, `postversion` doesn't work in yarn v2

For npm registry: you can unpublish a version or the whole package but can never re-publish the same version under the same name.

If you want to modify the description / README on the npm package page, you have to publish a new version. You can modify the description on GitHub Packages without publishing.