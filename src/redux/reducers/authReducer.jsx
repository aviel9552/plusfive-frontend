const initialState = {
  isAuthenticated: false,
  loading: false,
  user: null,
  token: null,
  error: null,
};

const safelyParseJSON = (data) => {
  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error parsing JSON from localStorage:', error);
    return null;
  }
};

const isBrowser = typeof window !== "undefined";

let persistedState = initialState;

if (isBrowser) {
  const userData = localStorage.getItem('userData');
  const token = localStorage.getItem('token');

  if (userData && token) {
    persistedState = {
      ...initialState,
      isAuthenticated: true,
      user: safelyParseJSON(userData),
      token: token,
    };
  } else {
    // console.log("No data in localStorage");
  }
}

export default function authReducer(state = persistedState, action) {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, loading: true };

    case 'LOGIN_SUCCESS': {
      const newState = {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.user,
        token: action.accessToken,
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(newState.user));
        localStorage.setItem('token', newState.token);
        // Also store user role for easy access
        localStorage.setItem('userRole', newState.user.role);
      }
      return newState;
    }

    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        // Keep existing user data on login failure
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      };

    case 'UPDATE_USER':
      const updatedUser = { ...state.user, ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      return { ...state, user: updatedUser };

    case 'UPDATE_USER_REQUEST':
      return { 
        ...state, 
        loading: true,
        // Keep existing user data during request
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        error: state.error
      };

    case 'UPDATE_USER_SUCCESS':
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(action.user));
        localStorage.setItem('userRole', action.user.role);
      }
      return { 
        ...state, 
        loading: false, 
        user: { ...state.user, ...action.user },
        error: null 
      };

    case 'UPDATE_USER_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: null,  // Clear the error instead of storing it
        // Keep all existing user data unchanged
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      };

    case 'LOGOUT':
      if (isBrowser) {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        document.cookie = 'token=; path=/; max-age=0';
      }
      // Only clear user data on logout, not on API errors
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        error: null, 
        token: null 
      };

    default:
      return state;
  }
}
