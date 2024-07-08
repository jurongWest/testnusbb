import React from 'react';

const UserContext = React.createContext({
  userEmail: null,
  setUserEmail: () => {},
});

export default UserContext;