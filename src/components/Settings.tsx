import * as React from "react";
import { Page } from '../types';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import Select, { Option } from 'rc-select';

interface SettingsProps {
  switchPage: (p: Page) => () => void;
  onSoundChange: (x: number) => void;
  onMusicChange: (x: number) => void;
  sound: number;
  music: number;
}
const FSlider = createSliderWithTooltip(Slider);
export const Settings = (props: SettingsProps) => <div className="wrapper">
  <div className="header">
    <a href="#" onClick={props.switchPage(Page.Home)} className="back">
      <img src="left.png" height="12" /> Back
    </a>
    <div className="title">Settings</div>
  </div>
  <div className="settings">
    <div className="label">Sound volume</div>
    <FSlider value={props.sound} onChange={props.onSoundChange} />
    <div className="label">Music volume</div>
    <FSlider value={props.music} onChange={props.onMusicChange} onAfterChange={props.onMusicChange} />
    <div className="label">Language</div>
    <Select value="english"><Option value="english">English</Option></Select>
  </div>
</div >;
