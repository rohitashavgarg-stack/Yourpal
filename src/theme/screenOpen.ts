import { createContext, useContext } from 'react';

// True once the page around this has finished opening (see Zoom in app/_layout). iOS liquid glass does not draw if it
// first appears while its page is still fading in, so glass is (re)drawn when this turns true. Outside a zooming page it is always true.
export const ScreenOpen = createContext(true);
export const useScreenOpen = () => useContext(ScreenOpen);
