import * as React from "react";
import { Page } from '../types';
import { Home } from './Home';
import { SinglePlayer } from './SinglePlayer';
import { MultiPlayer } from './MultiPlayer';
import { Settings } from './Settings';
import { Help } from './Help';
import { Board } from './Board';
import { Sequence } from '../sequence';

interface AppState {
  page: Page;
  sound: number;
  music: number;
}

export class App extends React.Component<{}, AppState> {
  state = {
    page: Page.Home,
    sound: 100,
    music: 100,
  }
  switchPage = (page: Page) => () => this.setState({ page });
  onSoundChange = (sound: number) => this.setState({ sound });
  onMusicChange = (music: number) => this.setState({ music });
  sequence: Sequence;

  componentWillMount() {
    this.sequence = new Sequence(new AudioContext(), 120, [
      'G3 q',
      'E4 q',
      'C4 h'
    ]);
  }
  componentWillUpdate() {
    this.sequence.gain.gain.value = this.state.music;
  }

  render() {
    const { switchPage, onSoundChange, onMusicChange } = this;
    const { sound, music } = this.state;
    switch (this.state.page) {
      case Page.Home:
        return <Home switchPage={this.switchPage} />;
      case Page.SinglePlayer:
        return <SinglePlayer {...{ switchPage }} />;
      case Page.MultiPlayer:
        return <MultiPlayer {...{ switchPage }} />;
      case Page.Settings:
        return <Settings {...{ switchPage, onSoundChange, onMusicChange, music, sound }} />;
      case Page.Help:
        return <Help {...{ switchPage }} />;
      case Page.Board:
        return <Board {...{ switchPage }} />;
    }
  }
}
