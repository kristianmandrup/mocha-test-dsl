# Mocha Test DSL

## Usage

`const test = require('../lib/dsl');`

Sample usage example:

```js
const test = require('../lib/dsl');

const context = {
  delete: async () => {
    try {
      await fs.stat(path.join(__dirname, './dsl.js'));
      return true;
    } catch (err) {
      return false;
    }    
  }
}

const check = {
  wasDeleted: (ctx) => {
    expect(ctx).to.eql(true);
  },
  wasIdexed: (ctx) => {
    expect(true).to.eql(true);
  }
}

class Ctx{
  constructor() {
    this.x = 1;    
  }

  before() {
    console.log('x = ', this.x)
  }

  beforeEach() {
    console.log('before each');
  }

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
    prepare: Ctx
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


### Install

`npm i mocha-dsl --save-dev` 

## Development

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