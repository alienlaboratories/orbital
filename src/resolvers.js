//
// Copyright 2017 Alien Labs.
//

export class Resolvers {

  constructor() {}

  getMap() {
    return {
      RootQuery: {
        root: (obj, args, context) => {
          return {
            title: 'Root'
          };
        }
      }
    };
  }
}
