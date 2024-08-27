import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import GifSlideshow from './GifSlideshow';
import Title from './Title';
import ButtonWrapper from './ButtonWrapper';
import SoundButton from './SoundButton';
import JoinRoom from './JoinRoom'; // Import the JoinRoom component
import Play from './Play'; // Import the Play component
import HostRoom from './HostRoom';
import Multiplayer from './Multiplayer';
import { RoomProvider } from './RoomContext'; // Import the RoomProvider
import './App.css';

function App() {
    return (
        <RoomProvider> {/* Wrap the entire routing setup with RoomProvider */}
            <Router>
                <Routes>
                    {/* Default Route to Home (where your GIF slideshow and buttons are) */}
                    <Route path="/" element={
                        <div className="App">
                            <GifSlideshow />
                            <Title />
                            <ButtonWrapper />
                            <SoundButton />
                        </div>
                    }/>

                    {/* Route for Join Room page */}
                    <Route path="/join-room" element={<JoinRoom />} />

                    {/* Route for Host Room page */}
                    <Route path="/host-room" element={<HostRoom />} />

                    {/* Route for Play page */}
                    <Route path="/play" element={<Play />} />
                    
                    {/* Route for multiplayer page */}
                    <Route path="/multiplayer" element={<Multiplayer />} />
                </Routes>
            </Router>
        </RoomProvider>
    );
}

export default App;
