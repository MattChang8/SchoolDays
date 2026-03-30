import React from 'react';
import './App.css';
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import SideMenu from './components/sideMenu.jsx';
import PageHelpBubble from './components/pageHelpBubble.jsx';
import { ProfileProvider } from './components/profiles/profileContext.jsx';

function App() {
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
    </style>

	return (
		<>
		<meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
		<ProfileProvider>
			<Header />
			<SideMenu />
			<PageHelpBubble />
			<Footer />
		</ProfileProvider>
		</>
	);
}

export default App;
