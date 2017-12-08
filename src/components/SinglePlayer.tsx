import * as React from "react";
import { Page } from '../types';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import Select, { Option } from 'rc-select';

interface SinglePlayerProps {
  switchPage: (p: Page) => () => void;
}
const FSlider = createSliderWithTooltip(Slider);
export const SinglePlayer = ({ switchPage }: SinglePlayerProps) => <div className="wrapper">
  <div className="header">
    <a href="#" onClick={switchPage(Page.Home)} className="back">
      <img src="assets/left.png" height="12" /> Back
    </a>
    <div className="title">Singleplayer</div>
  </div>
  <div className="settings">
    <div className="label">Difficulty</div>
    <FSlider tipFormatter={formatDifficulty} max={2} />
    <div className="label">Variant</div>
    <FSlider tipFormatter={formatVariant} max={3} />
    <a className="btn" href="#" onClick={switchPage(Page.Board)}>Play</a>
  </div>
</div>;

const formatDifficulty = (n: number) => {
  switch (n) {
    case 0: return 'Easy';
    case 1: return 'Medium';
    default: return 'Hard';
  }
}
const formatVariant = (n: number) => {
  switch (n) {
    case 0: return '3x3';
    case 1: return '9x9';
    case 2: return '18x18';
    default: return '36x35';
  }
}
