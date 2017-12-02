import * as React from "react";
import { Page } from '../types';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import Select, { Option } from 'rc-select';

interface SettingsProps {
    switchPage: (p: Page) => () => void;
}
const FSlider = createSliderWithTooltip(Slider);
export const Settings = ({ switchPage }: SettingsProps) => <div className="wrapper">
    <div className="header">
        <a href="#" onClick={switchPage(Page.Home)} className="back">&lt;- Back</a>
        <div className="title">Settings</div>
    </div>
    <div className="settings">
        <div className="label">Sound volume</div>
        <FSlider />
        <div className="label">Music volume</div>
        <FSlider />
        <div className="label">Language</div>
        <Select value="english"><Option value="english">English</Option></Select>
    </div>
</div>;
