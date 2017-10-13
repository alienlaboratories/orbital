//
// Copyright 2017 Alien Labs.
//

import { Orb } from './api';

// TODO(burdon): Test locally.
test('Test Deployed API.', async () => {

  Orb.config.update({
    API_KEY: 'test'
  });

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
