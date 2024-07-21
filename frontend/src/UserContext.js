import React from 'react';

const UserContext = React.createContext({
  userId: null,
  setUserId: () => {},
  userEmail: null,
  setUserEmail: () => {},
});

export default UserContext;