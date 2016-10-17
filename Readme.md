# Mocha Test DSL

Modern testing DSL built on top of [mocha](https://mochajs.org/)
- Uses chaining to allow for easier composition.
- Use optional `RunContext` class to describe how to setup and tear down run context.
- Recommend using `context` and `check` objects to encapsulate:
  - the functionality to test 
  - the test functions (expectations) on the result 

The `context` and `check` objects can either be simple objects with functions on or 
use classes for even more power and reuse, polymorhism etc.
The `RunContext` can also be subclassed and extended easily to suit different testing scenarios. 

## Install

`npm i mocha-dsl --save-dev` 

## Usage

`const test = require('mocha-test-dsl');`

Sample usage example:

```js
const test = require('mocha-test-dsl');

// TODO: put in a separate file to share between tests
const context = {
  delete: async () => {
    try {
      await fs.stat(path.join(__dirname, './helper.js'));
      return true;
    } catch (err) {
      return false;
    }    
  }
}

// TODO: put in a separate file to share between tests
const check = {
  wasDeleted: (ctx) => {
    expect(ctx).to.eql(true);
  },
  wasIdexed: (ctx) => {
    expect(true).to.eql(true);
  }
}

// TODO: put in a separate file to share between tests
class RunCtx {
  constructor(x) {
    this.x = x;    
  }

  before() {
    console.log('x = ', this.x)
  }

  beforeEach() {
    console.log('before each');
  }

  // clean up
  after() {
    this.x = 0;
    console.log('x = ', this.x)
  }

  afterEach() {
    console.log('after each');
  }  
} 

test('Addon')
  .that('READ item')
  .for('some cool stuff')
  .will('read a single component', () => {
    expect(1 + 1).to.eql(2);
  })
  .run();

test('Components')
  .that('DELETE item', {
    prepare: RunCtx
  })
  .should('delete a single component', async () => {
    let result = await context.delete(); 
    check.wasDeleted(result);
  })
  .should('delete also update index', () => {
    check.wasIdexed(true);
  })
  .run()
```  

When the main test parts have been but into a separate file for reuse: 

```js
const test = require('../lib/dsl');
const { RunCtx , check, context } = require('./test-ctx');

test('Components')
  .that('DELETE item', {
    prepare: RunCtx
  })
  .should('delete a single component', async () => {
    let result = await context.delete(); 
    check.wasDeleted(result);
  })
  .should('delete also update index', () => {
    check.wasIdexed(true);
  })
  .run()
```

The `prepare` can also be set to an object with `beforeXX` and `afterXX` methods.     

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
  .should('delete also update index', async () => {
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
    .should('not delete also update index', async () => {
      let result = await context.index();
      check.wasIdexed(result, false);
    })
    .run()
``` 

## Development

Here some tips on further developing this handy testing DSL.

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