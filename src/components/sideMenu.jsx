import React from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Dashboard } from '../pages/dashboard.jsx';
import { Route, Routes, Link } from "react-router-dom";
import { Login } from '../pages/login.jsx';
import ScrollToTop from './scrollTop.jsx';
import { Benefits } from '../pages/benefits.jsx';
import { Time } from '../pages/time.jsx';
import { Payroll } from '../pages/payroll.jsx';
import { Absence } from '../pages/absence.tsx';
import { Info } from '../pages/info.jsx';
import { Training } from '../pages/training.jsx';
import '../components/css/workday.css';
import '../components/css/sideMenu.css';
import DashIcon from './images/wd-accent-dashboard.png';
import HandMoney from './images/wd-accent-hand-money.png';
import OpenBook from './images/wd-accent-open-book-blank.png';
import Person from './images/wd-accent-person.png';
import ShieldBenefits from './images/wd-accent-shield-benefits.png';
import Suitcase from './images/wd-accent-suitcase.png';
import TimeClock from './images/wd-accent-time-clock.png';
import Arrow from './images/wd-accent-chevron-solid-right.png';


const SideMenu = () => {


const [collapsed, setCollapsed] = React.useState(false);

return(

  <div className='appLayout'>
    <Sidebar className='appSidebar' collapsed={collapsed} collapsedWidth='90px'>
      <Menu>
        <MenuItem onClick={() => setCollapsed(!collapsed)} icon={<img className='' src={Arrow} alt='SMArrow'/>}> &nbsp;Collapse </MenuItem>
        <MenuItem component={<Link to='/dashboard' />} icon={<img className='' src={DashIcon} alt='SMDash'/>}> 	&nbsp;Dashboard</MenuItem>
        <MenuItem component={<Link to='/time' />} icon={<img className='' src={TimeClock} alt='SMTime'/>}> &nbsp;Time </MenuItem>
        <MenuItem component={<Link to='/payroll' />} icon={<img className='' src={HandMoney} alt='SMPay'/>}> &nbsp;Payroll </MenuItem>
        <MenuItem component={<Link to='/benefits' />} icon={<img className='' src={ShieldBenefits} alt='SMBenefits'/>}> &nbsp;Benefits </MenuItem>
        <MenuItem component={<Link to='/absence' />} icon={<img className='' src={Suitcase} alt='SMAbsence'/>}> &nbsp;Absence </MenuItem>
        <MenuItem component={<Link to='/training' />} icon={<img className='' src={OpenBook} alt='SMTraining'/>}> &nbsp;Training </MenuItem>
        <MenuItem component={<Link to='/info' />} icon={<img className='' src={Person} alt='SMInfo'/>}> &nbsp;Personal Info </MenuItem>
      </Menu>
    </Sidebar>

    <main className='appMain'>
        <ScrollToTop />
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/time" element={<Time />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/absence" element={<Absence />} />
            <Route path="/benefits" element={<Benefits />} />
            <Route path="/training" element={<Training />} />
            <Route path="/info" element={<Info />} />
        </Routes> 
    </main>
  </div>

);
}

export default SideMenu;
