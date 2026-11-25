import { useLayoutEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Contact from "./pages/Contact";

/*
 * Every time the user navigates (even to the SAME page again, for example
 * clicking "Contact" while already on /contact), start at the top.
 * Without this, opening /contact from the footer keeps the old scroll
 * position, and the shorter Contact page ends up showing its footer.
 *
 * We watch `location.key` (it changes on every navigation) instead of only
 * `pathname`, so same-page link clicks are handled too.
 *
 * Links with a hash (like /#work) are left alone, the Navbar scrolls
 * to those sections itself. The Navbar's Home link sets `smoothTop` in the
 * location state when it wants to do its own smooth scroll to the top.
 */
function ScrollToTop() {
  const { hash, key, state } = useLocation();
  const previousKey = useRef(key);

  useLayoutEffect(() => {
    /* Keep the browser's own scroll restoration on the first load. */
    if (previousKey.current === key) return undefined;
    previousKey.current = key;

    if (hash) return undefined;
    if (state && state.smoothTop) return undefined;

    const toTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    toTop();

    /* Once more on the next frame, in case a late layout moved it. */
    const frame = requestAnimationFrame(() => {
      if (window.scrollY > 0) toTop();
    });

    return () => cancelAnimationFrame(frame);
  }, [key, hash, state]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;