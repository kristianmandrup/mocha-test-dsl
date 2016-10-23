# Mocha Test DSL

Modern testing DSL built on top of [mocha](https://mochajs.org/)

- Use chaining to allow for easier composition.
- Use optional `prepare` class/object to describe how to setup and tear down run context.
- Use `env` and `check` objects to encapsulate:
  - the environment to test in
  - the test functions (expectations) on the result

The `prepare`, `env` and `check` objects can either be:
- simple objects with functions
- classes for even more power and reuse, polymorhism etc.

```js
test('Component model')
  .for('a mongo DB connection', {
    prepare
  })
  .that('the delete command')
    .will('delete a single component', async () => {
      let result = await action.delete();
      check.for(result)
        .wasDeleted()
        .isIndexed(false)
    })
    .run()
```

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

test('Component model')
  .for('a mongo DB connection', {
    prepare
  })
  .that('the delete command')
    .will('delete a single component', async () => {
      let result = await action.delete();
      check.for(result)
        .wasDeleted()
        .isIndexed(false)
    })
    .run()
```

Since chain syntax is enabled, we can compose and reuse tests elegantly from individual parts:

```js

let component = test('Component model')

let action = {
  delete: component.that('delete action'),
  create: component.that('create action')
  // ...
}

// continue chaining...
let action.delete.default = action.delete.item
  .when('default indexed', {
    prepare: new Prepare()
  })

let action.delete.notIndexed = action.delete.item
  .when('not indexed', {
    prepare: new Prepare({indexed: false})
  })

// Note: again the above could be placed in a different file for reuse across the test suite
action.delete.default
  .should('delete a single component', async () => {
    let result = await model.action.delete();
    check.for(result)
      .wasDeleted();
  })
  .and('also update index', async () => {
    // since check is global and set from previous test we can reuse directly here if we like
    check
      .isIdexed(false);
  })
  .run()

action.delete.notIndexed
    .should('not delete it', async () => {
      let result = await model.action.delete();
      check.for(result)
        .wasDeleted(false);
    })
    .and('still not indexed', async () => {
      check
        .wasIdexed(false);
    })
    .run()
```

We recommend using `check` chaining to reduce the `should` chains and make multiple checks to check for a specific kind of outcome, such as checking the returned value and making checks on the actual environment affected.

Use `should` chaining only when you need to, in order to make the test output more clear and to group logical types of outcome tests.

PS: Always mock the environment when you can!

### Aliases

To make the DSL more fluent, the following aliases are available:

`that` - `when`, `for`, `on`, `while`
`should` - `will`, `it`, `and`, `but`, `can`

### DSL rules

- `test` followed by any number of chained `that` (or alias).
- Any `that` can chain with any number of chained `should` (or alias)
- To run a test chain add a `run()` call at the end of a `should` chain.

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