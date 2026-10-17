import { AboutSection } from "../components";

// The /about route reuses the shared AboutSection component. The primary way
// to reach "About" is the on-page section at /#about, but this route remains
// as a direct, linkable fallback.
const About = () => {
  return <AboutSection />;
};
export default About;
