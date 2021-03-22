import pyUtils from '@/logics/odoo/py_utils'

const _ = window.udjs

class Context {
  constructor() {
    this.__ref = "compound_context";
    this.__contexts = [];
    this.__eval_context = null;
    _.each(arguments, (x) => {
        this.add(x);
    });
  }

  add(context) {
    this.__contexts.push(context);
    return this;
  }

  eval() {
      return pyUtils.eval('context', this);
  }

  set_eval_context(evalContext) {
    // a special case needs to be done for moment objects.  Dates are
    // internally represented by a moment object, but they need to be
    // converted to the server format before being sent. We call the toJSON
    // method, because it returns the date with the format required by the
    // server
    // for (var key in evalContext) {
    //     if (evalContext[key] instanceof moment) {
    //         evalContext[key] = evalContext[key].toJSON();
    //     }
    // }
    this.__eval_context = evalContext;
    return this;
  }
}

export default Context