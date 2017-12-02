import * as React from "react";
import { Page } from '../types';

interface HelpProps {
    switchPage: (p: Page) => () => void;
}
export const Help = ({ switchPage }: HelpProps) => <div className="wrapper">
    <div className="header">
        <a href="#" onClick={switchPage(Page.Home)} className="back">&lt;- Back</a>
        <div className="title">Help</div>
    </div>
    <div className="help">
        <p>Long text explaining Gomoku. Long text explaining Gomoku. Long text explaining Gomoku. Long text explaining Gomoku. </p>
        <p>Long text explaining Gomoku. Long text explaining Gomoku. Long text explaining Gomoku. Long text explaining Gomoku. </p>
        <p>Long text explaining Gomoku. Long text explaining Gomoku. Long text explaining Gomoku. Long text explaining Gomoku. </p>
        <p>Long text explaining Gomoku. Long text explaining Gomoku. Long text explaining Gomoku. Long text explaining Gomoku. </p>
    </div>
</div>;
