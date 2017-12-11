import * as React from "react";
import { Page } from '../types';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import Select, { Option } from 'rc-select';
import { Variant } from '../types';

interface Props {
  switchPage: (p: Page) => () => void;
  onVariantChange: (v: Variant) => void;
  onSizeChange: (v: number) => void;
  variant: Variant;
  size: number;
}
const FSlider = createSliderWithTooltip(Slider);
export class SinglePlayer extends React.Component<Props, {}> {
  render() {
    const { switchPage } = this.props;
    return <div className="wrapper">
      <div className="header">
        <a href="#" onClick={switchPage(Page.Home)} className="back">
          <img src="assets/left.png" height="12" /> Back
        </a>
        <div className="title">Singleplayer</div>
      </div>
      <div className="settings">
        <div className="label">Size: {formatSize(this.props.size)}</div>
        <FSlider
          tipFormatter={formatSize} min={3} max={27} value={this.props.size}
          onChange={this.props.onSizeChange}
          onAfterChange={this.props.onSizeChange}
        />
        <div className="label">Variant: {this.props.variant}</div>
        <FSlider
          tipFormatter={toVariant} min={3} max={6} value={fromVariant(this.props.variant)}
          onChange={this.onVariantChange}
          onAfterChange={this.onVariantChange}
        />
        <a className="btn" href="#" onClick={switchPage(Page.Board)}>Play</a>
      </div>
    </div>;
  }
  onVariantChange = (n: number) => this.props.onVariantChange(toVariant(n))
}

const formatSize = (n: number) => {
  return `${n}x${n}`;
}
const fromVariant = (v: Variant) => {
  switch (v) {
    case Variant.threeInARow: return 3;
    case Variant.fourInARow: return 4;
    case Variant.fiveInARow: return 5;
    case Variant.sixInARow: return 6;
  }
}
const toVariant = (n: number) => {
  switch (n) {
    case 3: return Variant.threeInARow;
    case 4: return Variant.fourInARow;
    case 5: return Variant.fiveInARow;
    case 6: return Variant.sixInARow;
  }
}
