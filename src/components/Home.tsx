import * as React from "react";
import { Page } from '../types';

interface HomeProps {
    switchPage: (p: Page) => () => void;
}
export const Home = ({ switchPage }: HomeProps) => <div className="wrapper">
    <div className="header">
        <div className="title">3D Gomoku</div>
    </div>
    <div className="menu">
        <a href="#" onClick={switchPage(Page.SinglePlayer)}>Single player</a>
        <a href="#" onClick={switchPage(Page.MultiPlayer)}>Multi player</a>
        <a href="#" onClick={switchPage(Page.Settings)}>Settings</a>
        <a href="#" onClick={switchPage(Page.Help)}>Help</a>
    </div>
</div>;
