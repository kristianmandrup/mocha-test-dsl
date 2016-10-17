class Tester {
  constructor(parent, text, opts) {
    this.parent = parent;
    this.text = text;
    this.opts = opts;
    this.itFuns = [];
    this.instance = {};

    this.will = this.should;

    if (typeof opts === 'function') 
      this.fun = opts;    

    if (typeof opts === 'object' && this.opts.prepare) {
      this.clazz = opts.prepare;                
    }      
  }

  that(text, opts) {
    return new Tester(this, text, opts);
  }

  for(text, opts) {
    return new Tester(this, text, opts);
  }

  describe(fun) {
    if (this.parent) {
      // console.log('describe w parent', this.text)      
      this.parent.describe(() => {        
        if (this.clazz) {
          this.instance = new this.clazz();
        }
        
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
