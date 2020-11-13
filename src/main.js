/**
 * 0: rels or (sync for expr)
 * 1: deps
 * 2: (valid for sel)
 */
let context_node;
let active_bound;

// node: sel or expr node
// type: 0 - rels, 1 - deps
const free = (node, type) => {
  node[type].forEach((target) => target[1 - type].delete(node));
  node[type].clear();
}

// node: box or sel node
const read = (node) => {
  if (context_node) {
    context_node[1].add(node);
    node[0].add(context_node);
  }
};

const write = (box_node) => {
  if (active_bound)
    box_node[0].forEach((rel) => active_bound.add(rel));
  else {
    const syncs = new Set();
    let limit = 10000;
    let next_bound = new Set();

    active_bound = new Set(box_node[0]);
    try {
      while (active_bound.size) {
        active_bound.forEach((node) => {
          if (node.length === 2) syncs.add(node[0]) // expr
          else { // sel
            node[2] = 0; // invalidate
            node[0].forEach((next_node) => next_bound.add(next_node));
            free(node, 0);
          }
          free(node, 1);
        });
        [active_bound, next_bound] = [next_bound, active_bound];
        next_bound.clear();

        if (!active_bound.size) {
          syncs.forEach((sync) => sync());
          syncs.clear();
        }

        if (!--limit) throw new Error('Infinity reactions loop');
      }
    }
    finally {
      active_bound = 0;
    }
  }
};

const box = (value, change_listener) => {
  const box_node = [new Set()];
  return [
    () => (read(box_node), value),
    change_listener
      ? (next_value) => {
          if (!Object.is(value, next_value)) {
            const prev_value = value;
            value = next_value;
            write(box_node);
            change_listener(value, prev_value);
          }
        }
      : (next_value) => {
          Object.is(value, next_value) ||
            ((value = next_value), write(box_node));
        },
  ];
};

const sel = (body) => {
  const sel_node = [new Set(), new Set(), 0];
  let cache;
  return [
    () => {
      read(sel_node);
      if (!sel_node[2]) {
        const stack = context_node;
        context_node = sel_node;
        try {
          cache = body();
        } finally {
          context_node = stack;
        }
        sel_node[2] = 1;
      }
      return cache;
    },
    () => (free(sel_node, 1), free(sel_node, 0)),
  ];
};

const expr = (body, sync) => {
  const expr_node = [sync || run, new Set()];
  function run() {
    let result;
    const stack = context_node;

    expr_node[1].size || free(expr_node, 1);
    context_node = expr_node;
    try {
      result = body.apply(this, arguments);
    } finally {
      context_node = stack;
    }
    return result;
  }
  return [
    run,
    () => free(expr_node, 1),
  ];
};

module.exports = { box, sel, expr };
