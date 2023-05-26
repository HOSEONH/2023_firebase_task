import './App.css';
import { Routes, Route } from 'react-router-dom'
import FireStore from './page/FireStore';


function App() {
  return (
    <Routes>
      <Route path='/' element={<FireStore/>} />
    </Routes>
  );
}

export default App;
