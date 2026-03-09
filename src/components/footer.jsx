import React from "react";
import { Link } from "react-router-dom";

import './css/footer.css';

const Footer = () => {
    return (
        <div className="box">
            <div className="footer-container">
                <div className="row">
                <div className="column col1">
                    <Link to="/"> <img className="footer-logo" src={require('../components/images/SchoolDayLogo.png')} alt="jc logo"></img></Link>
                    <p className="footer-info">191 Baypointe Pkwy<br />San Jose, CA 95134</p>
                    <p className="footer-info"><strong>Phone: </strong>408-298-5100</p>
                </div>
                </div>
            </div>
            <h4 className="copyright">&#169;2026 Matt Chang</h4>
        </div>
    );
};

export default Footer;
