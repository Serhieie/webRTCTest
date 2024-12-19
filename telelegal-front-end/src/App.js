
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import './App.css';
import MainVideoPage from './videoComponents/MainVideoPage';
import ProMainVideoPage from './videoComponents/ProMainVideoPage';
import ProDashboard from './siteComponents/ProDashboard';
// import socketConnection from './webRTCUtilities/socketConnection'


const Home = () => <h1>Hello Home Page</h1>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path ='/' Component={Home}/>
        <Route exact path='/join-video' Component={MainVideoPage} />
        <Route exact path="/dashboard" Component={ProDashboard} />
        <Route exact path="/join-video-pro" Component={ProMainVideoPage} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
