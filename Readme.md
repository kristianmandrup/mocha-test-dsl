# Mocha Test DSL

Modern testing DSL built on top of [mocha](https://mochajs.org/)

- Use chaining to allow for easier composition.
- Use optional `runContext` class/object to describe how to setup and tear down run context.
- Use `context` and `check` objects to encapsulate:
  - the functionality to test
  - the test functions (expectations) on the result

The `context` and `check` objects can either be:
- simple objects with functions
- classes for even more power and reuse, polymorhism etc.

If the `runContext` is a class it can also be subclassed and extended easily to suit different testing scenarios.
Use composition and a divide & conquer testing strategie to create parts of the test which can
be externalised in one or more files to be shared between suites!

## Install

`npm i mocha-test-dsl --save-dev`

## Usage

`const test = require('mocha-test-dsl');`

We recommend using an `env` folder to setup the environment used for the test.
A typical testing file structure would look as follows:

```
/actions
  /env
    index.js
    check.js
    action.js
    dbenv.js
    utils.js

  create.spec.js
  delete.spec.js
  ...
  index.js
```

### Checker

`env/check.js`

We recommend making the checker chainable and have both an environment constructor and a method to set the result for all method to access as an instance variable, in order to be consistent.

```js
class Checker {
  constructor(env) {
    this.env = env;
    this.index = this.env.index;
    this.name = this.env.name;
  }

  get isNameIndexed() {
    return this.index[this.name];
  }

  for(res) {
    this.res = res;
  }

  wasDeleted(expected = true) => {
    expect(this.res.deleted).to.eql(expected);
    return this;
  }

  isIdexed(expected = true) => {
    expect(this.isNameIndexed).to.eql(expected);
    return this;
  }
}

module.export = function(res) {
  return new Checker(res);
}
```

### Prepare and cleanup test environment

`env/prepare.js`

```js
class Prepare {
  constructor(env) {
    this.env = env;
  }

  before() {
    this.env.connection.open();
  }

  beforeEach() {
    this.env.action = new Action();
  }

  afterEach() {
    this.env.action = null;
  }

  // clean up
  after() {
    this.env.connection.close();
  }
}

module.exports = (x) => {
  return new Prepare(x);
}
```

### Some prepacked action for testing

`env/action.js`

```js
module.exports = {
  delete: async (filePath = './helper.js') => {
    try {
      await fs.stat(path.join(__dirname, filePath));
      return true;
    } catch (err) {
      return false;
    }
  }
}
```

### Export full set of variables needed for testing

`env/index.js`

```js
const test = require('mocha-test-dsl');
const check = require('./check');
const prepare = require('./prepare');
const action = require('./action');

module.exports = {
  test,
  check,
  prepare,
  action
}
```

### Clean test

Then use as follows for a super clean and effective test:

```js
const { prepare, test, checker, action, dbenv } = require('./env');

// set up initial environment needed by prepare
const prepare = prepare(dbenv)

// (optionally) make prepare environment accessible by checker
const check = checker(prepare.env);

test('Components')
  .for(' a mongo DB connection', {
    prepare
  })
  .that('DELETE item')
    .will('delete a single component', async () => {
      let result = await action.delete();
      check.for(result)
        .wasDeleted()
        .isIndexed(false)
    })
    .and('also update index', () => {
      check.for(result)
        .isIndexed(true)
    })
    .run()
```

Since chain syntax is enabled, we can compose and reuse tests elegantly from individual parts:

```js

let delete = {
  item: test('Components').that('DELETE item'),
  version: test('Components').that('DELETE version')
  // ...
}

let delete.default = delete.item
  .when('default indexed', {
    prepare: new RunCtx()
  })

let delete.notIndexed = delete.item
  .when('not indexed', {
    prepare: new RunCtx({indexed: false})
  })

// Note: again the above could be placed in a different file for reuse across the test suite
delete.default
  .should('delete a single component', async () => {
    let result = await context.delete();
    check.wasDeleted(result);
  })
  .and('also update index', async () => {
    let result = await context.index();
    check.wasIdexed(true);
  })
  .run()

deleteNotIndexed
  .when('not indexed')
    .should('not delete a single component', async () => {
      let result = await context.delete();
      check.wasDeleted(result, false);
    })
    .but('not delete update index', async () => {
      let result = await context.index();
      check.wasIdexed(result, false);
    })
    .run()
```

### Aliases

`that` - `when`, `for`, `on`, `while`
`should` - `will`, `it`, `and`, `but`, `can`

### DSL rules

`test` followed by any number of chained `that` (or alias).
Any `that` can chain with any number of chained `should` (or alias)
To add the test chain add a `run()` at the end.

### Enable/Disable tests

To enable/disable a test, simply remove or comment/uncomment the final `.run()`` method!

## Development

Here some tips on further developing this handy testing DSL.

Fork the repo. Start development on a new feature branch

`git co -b my-feature`

When done, push the feature branch to your forked repo

`git push origin my-feature`

Then from your git site (such as github or similar), create a Pull Request (PR).

### Build

`npm run build` - builds `/src` folder and puts resulting ES5 `.js` files in `/dist`

### Auto build

`npm run watch` - builds `/src` and watches for changes to `/src` files for auto-build!

### Troubleshooting

If you still get an error, try removing the `dist` folder:

`rm -r dist`

Then recompile via `build` or `watch` task and start server again.

### Run Test or Test suite

To run the tests, the Koa server app must be running...

`npm test` (runs test command in `Makefile`)

## License

MIT