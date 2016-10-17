const fs = require('fs-promise');

require('babel-core/register');
require('babel-polyfill');

const chai = require('chai');
chai.should();
const expect = chai.expect;

import path from 'path'; 
const test = require('../lib/dsl');

const context = {
  delete: async () => {
    let file = path.join(__dirname, './helper.js');
    try {      
      // console.log('get stats', file)
      await fs.stat(file);
      return true;
    } catch (err) {
      console.log('file not found', file)
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
  .when('going gets tough')
    .should('delete a single component', async () => {
      let result = await context.delete(); 
      console.log('result', result);
      check.wasDeleted(result);
    })
    .should('delete also update index', () => {
      check.wasIdexed(true);
    })
    .run()
