import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import '../styles/globals.css'; 

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;