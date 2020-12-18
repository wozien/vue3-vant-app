import _ from 'lodash'

export const findTree = (items: any[], attrs: Function | Object, sonField = 'children') => {
  if (!_.isFunction(attrs) && _.isEmpty(attrs)) {
    return null;
  }
  
  let node = null;
  let callback = _.iteratee(attrs);
  let level = 0;

  // 递归查找子级所有节点
  while (items && items.length) {
      let children = [] as any[];
      level++;

      node = _.find(items, (item: any) => {
        children = children.concat(item[sonField] || []);
        
        return callback(item, level);
      });
      
      if (node) {
        break;
      }

      items = children;
  }

  return node;
}