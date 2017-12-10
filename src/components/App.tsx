import * as React from "react";
import { Page } from '../types';
import { Home } from './Home';
import { SinglePlayer } from './SinglePlayer';
import { MultiPlayer } from './MultiPlayer';
import { Settings } from './Settings';
import { Help } from './Help';
import { Board } from './Board';
import { Sequence } from '../sequence';
import { Variant } from '../types';

interface AppState {
  page: Page;
  sound: number;
  music: number;
  variant: Variant;
  size: number;
}

export class App extends React.Component<{}, AppState> {
  state = {
    page: Page.Home,
    sound: 50,
    music: 50,
    variant: Variant.fiveInARow,
    size: 9,
  }
  switchPage = (page: Page) => () => this.setState({ page });
  onSoundChange = (sound: number) => this.setState({ sound });
  onMusicChange = (music: number) => this.setState({ music });
  onVariantChange = (variant: Variant) => this.setState({ variant });
  onSizeChange = (size: number) => this.setState({ size });
  sequence: Sequence;

  //  D E Fis G A B Cis
  componentWillMount() {
    this.sequence = new Sequence(new AudioContext(), 90, [
      'D5 e', 'B5 e', 'A5 h',
      'D5 e', 'B5 e', 'A5 h',
      'D5 e', 'B5 e', 'A5 q',
      'B5 q', 'A5 h', '- q',
      'F#4 q', 'F4 q', 'F#4 q',
      'C#5 e', 'D5 e',
      'B4 h', 'D5 h',
      'D5 q', 'C#5 e', 'B5 e', 'A5 h',
      'D5 e', 'B5 e', 'A5 h',
      'D5 e', 'B5 e', 'A5 h',
      'B5 q', 'A5 h', '- q',
      'F#4 q', 'F4 q', 'F#4 q',
      'C#5 e', 'D5 e',
      'B4 h', 'D5 h',
      'E5 q', 'D5 2', '- 1',
      'D5 e', 'B5 e', 'A5 h',
      'D5 e', 'B5 e', 'A5 h',
      'D5 e', 'B5 e', 'A5 q',
      'B5 q', 'A5 h', '- q',
      'F#4 q', 'F4 q', 'F#4 q',
      'C#5 e', 'D5 e',
      'B4 h', 'D5 h',
      'D5 q', 'C#5 e', 'B5 e', 'A5 h',
      'D5 e', 'B5 e', 'A5 h',
      'D5 e', 'B5 e', 'A5 h',
      'B5 q', 'A5 h', '- q',
      'F#4 q', 'F4 q', 'F#4 q',
      'C#5 e', 'D5 e',
      'B4 h', 'D5 h',
      'E5 q', 'D5 2', '- 5',
    ]);
    this.sequence.gain.gain.value = this.state.music / 100;
    this.sequence.play();
  }
  componentWillUpdate() {
    this.sequence.gain.gain.value = this.state.music / 100;
  }

  render() {
    const { switchPage, onSoundChange, onMusicChange, onSizeChange, onVariantChange } = this;
    const { sound, music, size, variant } = this.state;
    switch (this.state.page) {
      case Page.Home:
        return <Home switchPage={this.switchPage} />;
      case Page.SinglePlayer:
        return <SinglePlayer {...{ switchPage, onSizeChange, onVariantChange, size, variant }} />;
      case Page.MultiPlayer:
        return <MultiPlayer {...{ switchPage, onSizeChange, onVariantChange, size, variant }} />;
      case Page.Settings:
        return <Settings {...{ switchPage, onSoundChange, onMusicChange, music, sound }} />;
      case Page.Help:
        return <Help {...{ switchPage }} />;
      case Page.Board:
        return <Board {...{ switchPage, size, variant }} />;
    }
  }
}
