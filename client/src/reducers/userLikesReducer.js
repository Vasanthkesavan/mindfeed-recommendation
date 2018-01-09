const userLikes = (state=[], action) => {
  switch( action.type ) {
    case 'SET_USER_LIKES':
      return action.likes;

    default:
      return state;
  }


}

export default userLikes;