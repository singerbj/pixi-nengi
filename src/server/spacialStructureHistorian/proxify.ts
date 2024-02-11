export type Proxy = { ref?: any };

const getValue = (obj: any, path: any) => {
  //console.log('getValue', obj, path)
  //if (path) {
  if (path.length === 1) {
    return obj[path[0]];
  } else if (path.length === 2) {
    return obj[path[0]][path[1]];
  } else if (path.length === 3) {
    return obj[path[0]][path[1]][path[2]];
  } else {
    throw new Error(
      "proxify property path is too deep, 3 layer nest limit: obj.a.b.c; obj: " +
        obj +
        " path: " +
        path
    );
  }
  //}
};

const setValue = (obj: any, path: any, value: any) => {
  if (!path || !obj) {
    return;
  }
  if (path.length === 1) {
    obj[path[0]] = value;
  } else if (path.length === 2) {
    if (typeof obj[path[0]] === "undefined") {
      obj[path[0]] = {};
    }
    obj[path[0]][path[1]] = value;
  } else if (path.length === 3) {
    if (typeof obj[path[0]] === "undefined") {
      obj[path[0]] = {};
    }
    if (typeof obj[path[0]][path[1]] === "undefined") {
      obj[path[0]][path[1]] = {};
    }
    obj[path[0]][path[1]][path[2]] = value;
  }
};

export const proxify = function (obj: any, protocol?: any): Proxy {
  //console.log('PROXIFY', obj, protocol)
  var proxy: Proxy = {};

  for (var i = 0; i < protocol.keys.length; i++) {
    //var value
    var prop = protocol.properties[protocol.keys[i]];
    var value = getValue(obj, prop.path);
    //console.log('prop', prop, 'value', value)
    if (prop.isArray) {
      //console.log(prop.path, 'ARRAY_BASEd', prop)

      //console.log('AAAA', typeof prop.type)
      if (prop.protocol) {
        // array of object references
        //console.log('array of object references')
        var temp = new Array(value.length);
        for (var j = 0; j < value.length; j++) {
          //console.log('mm', value[j])
          temp[j] = proxify(value[j], prop.protocol);
        }
        value = temp;
      } else {
        value = value.slice(0);
      }
    } else {
      //console.log(prop.path, 'sub object NOT in array')
      if (typeof prop.protocol !== "undefined") {
        if (prop.protocol !== null) {
          value = proxify(value, prop.protocol);
          //console.log('.:', value)
        }
      }
    }

    if (!value) {
      if (typeof value === "undefined") {
        value = 0;
      }
    }

    //console.log('r.:', value)
    setValue(proxy, prop.path, value);

    //console.log('SETTT', protocol.keys[i], value)
    //proxy[protocol.keys[i]] = value
  }
  //console.log('returning proxy', proxy)
  return proxy;
};
