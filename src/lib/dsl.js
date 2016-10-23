class Tester {
  constructor(parent, text, opts) {
    this.parent = parent;
    this.text = text;
    this.opts = opts;
    this.itFuns = [];
    this.instance = {};

    this.will = this.should;
    this.it = this.should;
    this.and = this.should;
    this.but = this.should;
    this.can = this.should;

    this.when = this.that;
    this.for = this.that;
    this.on = this.that;
    this.while = this.that;

    if (typeof opts === 'function')
      this.fun = opts;

    if (typeof opts === 'object' && this.opts.prepare) {
      if (this.opts.prepare === 'function')
        this.runCtxConstructor = opts.prepare;

      if (this.opts.prepare === 'object')
        this.runCtxObj = opts.prepare;
    }
  }

  that(text, opts) {
    return new Tester(this, text, opts);
  }

  describe(fun) {
    if (this.parent) {
      // console.log('describe w parent', this.text)
      this.parent.describe(() => {
        if (this.runCtxConstructor)
          this.instance = new this.clazz();

        if (this.runCtxObj)
          this.instance = this.runCtxObj;

        if (this.instance && this.instance.beforeEach)
          before(this.instance.before);

        if (this.instance && this.instance.beforeEach)
          beforeEach(this.instance.beforeEach);

        if (this.instance && this.instance.afterEach)
          afterEach(this.instance.afterEach);

        if (this.instance && this.instance.after)
          after(this.instance.after);

        describe(this.text, fun);
      })
    } else {
      describe(this.text, fun);
    }
  }

  should(text, fun) {
    // console.log('should parent', this.parent.text)
    this.itFuns.push(() => {
      it(text, fun);
    });
    return this;
  }

  run() {
    return this.describe(() => {

      for (let fun of this.itFuns) {
        fun();
      }
    })
  }
}

export default function (text, opts) {
  return new Tester(null, text, opts);
}
