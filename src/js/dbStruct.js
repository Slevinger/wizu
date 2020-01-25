exports.meta = function(obj) {
  return {
    user: {
      //_id:null,
      username: null,
      email: null,
      fullname: { first: null, last: null },
      password: null,
      events: [],
      correspondences: [],
      action_items: [],
      timestamp: new Date().getTime(),
      ...obj
    },
    stickey_note: {
      title: null,
      description: null,
      timestamp: new Date().getTime(),
      ...obj
    },
    event: {
      //_id:null,
      name: null,
      description: null,
      date: null,
      users: [],
      location: null,
      event_nature: null,
      todo_lists: [],
      stickey_notes: [],
      admin: [],
      correspondences: [],
      suervyes: [],
      budget: null,
      timestamp: new Date().getTime(),
      ...obj
    },
    action_item: {
      aid: null,
      description: null,
      have: null,
      needed: null,
      unit: null,
      cost: null,
      focals: [],
      username: null,
      timestamp: new Date().getTime(),
      ...obj
    },
    todo_list: {
      title: null,
      description: null,
      stickey_notes: [],
      action_items: [],
      focals: [],
      timestamp: new Date().getTime(),
      ...obj
    },
    correspondence: {
      event_id: null,
      username: null,
      trigger_username: null,
      answer: null, // confirm | reject | maybe
      status: "created", // created | sent | replied
      timestamp: new Date().getTime(),
      ...obj
    }
  };
};
