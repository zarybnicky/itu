import * as React from "react";
import { Page } from '../types';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import Select, { Option } from 'rc-select';

interface MultiPlayerProps {
  switchPage: (p: Page) => () => void;
}
const FSlider = createSliderWithTooltip(Slider);
export const MultiPlayer = ({ switchPage }: MultiPlayerProps) => <div className="wrapper">
  <div className="header">
    <a href="#" onClick={switchPage(Page.Home)} className="back">
      <img src="assets/left.png" height="12" /> Back
    </a>
    <div className="title">Multiplayer</div>
  </div>
  <div className="settings">
    <input type="text" placeholder="Room name" />
    <div className="label">Variant</div>
    <FSlider tipFormatter={formatVariant} max={3} />
    <div>&nbsp;</div>
    <RoomBtn />
  </div>
  <div className="search">
    <img alt="searching..." width="75" src="assets/search.png" />
    <Searching />
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

class RoomBtn extends React.Component<{}, { x: boolean }> {
  state = { x: false };
  f = () => this.setState({ x: true });
  render() {
    return <a className={`btn ${this.state.x && 'disabled'}`} href="#" onClick={this.f}>Create room</a>;
  }
}

class Searching extends React.Component<{}, { n: number }> {
  state = { n: 1 };
  timer?: any;
  componentDidMount() {
    this.timer = setInterval(() => this.setState({
      n: (this.state.n + 1) % 3,
    }), 500);
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  render() {
    return `Searching${new Array(this.state.n + 2).join('.')}`;
  }
}
