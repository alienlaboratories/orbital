//
// Copyright 2017 Alien Labs.
//

import { Orb } from './api';

test('Basic API.', async () => {

  Orb.config.update({});

  let db = Orb.DB();

  {
    let result = db.test();
    expect(result).toBeTruthy();
  }

  {
    let result = await db.clear();
    expect(result).toBeTruthy();
  }
});
