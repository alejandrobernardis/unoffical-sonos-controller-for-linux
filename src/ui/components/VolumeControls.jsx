import React, { Component } from 'react';
import { connect } from 'react-redux';

import MuteButton from './MuteButton';
import ValueSlider from './ValueSlider';

const { setDragging, setExpanded, setPlayerMuted, setPlayerVolume } =
    window.VolumeControlActions;

const { show } = window.EqActions;

const { getPlayers, getCurrentGroupKeys, getGroupVolume, getGroupMuted } =
    window.VolumeControlSelectors;

const mapStateToProps = (state) => {
    return {
        players: getPlayers(state),
        currentGroupKeys: getCurrentGroupKeys(state),
        groupVolume: getGroupVolume(state),
        groupMuted: getGroupMuted(state),
        dragging: state.volume.dragging,
        expanded: state.volume.expanded,
    };
};

const mapDispatchToProps = {
    setPlayerVolume,
    setPlayerMuted,
    setDragging,
    setExpanded,
    show,
};

class VolumeControls extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    _toggleGoupMute() {
        const muted = this.props.groupMuted;

        this.props.currentGroupKeys.forEach((host) => {
            this.props.setPlayerMuted(host, !muted);
        });
    }

    _changeGroupVolume(volume) {
        this.props.setExpanded(true);

        // adjust all players in group
        const volumeLevel = volume;
        const groupVolume = this.props.groupVolume;
        const deltaVolume = volumeLevel - groupVolume;

        for (const key of this.props.currentGroupKeys) {
            let newVolume;

            if (volumeLevel < 1) {
                newVolume = 0;
            } else if (deltaVolume > 0) {
                newVolume = this.props.players[key].volume + deltaVolume;
            } else {
                const factor = this.props.players[key].volume / groupVolume;
                newVolume = Math.ceil(factor * volumeLevel);
            }

            if (newVolume > 99) {
                newVolume = 99;
            }

            if (newVolume <= 0) {
                newVolume = 0;
            }

            this.props.setPlayerVolume(key, newVolume);
        }
    }

    _startGroupVolume() {
        const keys = this.props.currentGroupKeys;
        this._dragStart();
        this.props.setExpanded(keys.length > 1);
    }

    _endGroupVolume() {
        this._dragEnd();
        this._hideTimeStart();
    }

    _dragStart() {
        if (this._dragEndTimer) {
            window.clearTimeout(this._dragEndTimer);
        }

        this.props.setDragging(true);
    }

    _dragEnd() {
        this._dragEndTimer = window.setTimeout(() => {
            this.props.setDragging(false);
        }, 500);
    }

    _hideTimeStart() {
        this._hideTimer = window.setTimeout(() => {
            this.props.setExpanded(false);
        }, 1000);
    }

    _hideTimeStop() {
        window.clearTimeout(this._hideTimer);
    }

    _openSettings() {
        this.props.show();
    }

    render() {
        let groupMuted = false;
        let groupVolume = 0;
        let playerPopover;

        const keys = this.props.currentGroupKeys;

        if (keys.length === 1) {
            groupMuted = this.props.players[keys[0]].muted;
            groupVolume = this.props.players[keys[0]].volume;
        } else {
            groupMuted = this.props.groupMuted;
            groupVolume = this.props.groupVolume;
        }

        if (this.props.expanded && keys.length > 1) {
            const playerRows = Object.keys(this.props.players).map((key) => {
                const { volume, muted, name } = this.props.players[key];

                const startVolume = () => {
                    this._dragStart();
                    this.props.setDragging(true);
                };

                const endVolume = () => {
                    this._dragEnd();
                };

                const changeVolume = (volume) => {
                    if (!this.propsexpanded) {
                        this.props.setExpanded(true);
                    }
                    this.props.setPlayerVolume(key, volume);
                };

                const toggleMute = () => {
                    this.props.setPlayerMuted(key, !muted);
                };

                return (
                    <div key={key}>
                        <h6>{name}</h6>

                        <MuteButton muted={muted} clickHandler={toggleMute} />

                        <ValueSlider
                            value={volume}
                            stopHandler={endVolume}
                            startHandler={startVolume}
                            dragHandler={changeVolume}
                        />
                    </div>
                );
            });

            playerPopover = (
                <div
                    id="player-volumes-container"
                    onMouseOut={this._hideTimeStart.bind(this)}
                    onMouseOver={this._hideTimeStop.bind(this)}
                >
                    <div id="player-volumes">{playerRows}</div>
                </div>
            );
        }

        return (
            <div id="master-volume">
                <MuteButton
                    muted={groupMuted}
                    clickHandler={this._toggleGoupMute.bind(this)}
                />

                <ValueSlider
                    value={groupVolume}
                    stopHandler={this._endGroupVolume.bind(this)}
                    startHandler={this._startGroupVolume.bind(this)}
                    dragHandler={this._changeGroupVolume.bind(this)}
                />

                {playerPopover}

                <a
                    className="settings-button"
                    onClick={this._openSettings.bind(this)}
                >
                    <i className="material-icons settings">equalizer</i>
                </a>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(VolumeControls);
