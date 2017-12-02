import * as React from "react";
import { Page } from '../types';
import { Home } from './Home';
import { SinglePlayer } from './SinglePlayer';
import { MultiPlayer } from './MultiPlayer';
import { Settings } from './Settings';
import { Help } from './Help';
import { Board } from './Board';

interface AppState {
    page: Page;
}

export class App extends React.Component<{}, AppState> {
    state = {
        page: Page.Home,
    }
    switchPage = (page: Page) => () => this.setState({ page });

    render() {
        let widget;
        switch (this.state.page) {
            case Page.Home: widget = <Home switchPage={this.switchPage} />; break;
            case Page.SinglePlayer: widget = <SinglePlayer switchPage={this.switchPage} />; break;
            case Page.MultiPlayer: widget = <MultiPlayer switchPage={this.switchPage} />; break;
            case Page.Settings: widget = <Settings switchPage={this.switchPage} />; break;
            case Page.Help: widget = <Help switchPage={this.switchPage} />; break;
            case Page.Board: widget = <Board switchPage={this.switchPage} />; break;
        }
        return widget;
    }
}
