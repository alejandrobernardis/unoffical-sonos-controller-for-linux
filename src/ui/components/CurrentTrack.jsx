import React from 'react/addons';

import PlayerStore from '../stores/PlayerStore';

import AlbumArt from './AlbumArt';

class CurrentTrack extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			currentTrack: null,
			nextTrack: null,
		};
	}

	componentDidMount() {
		PlayerStore.addChangeListener(this._onChange.bind(this));
	}

	_onChange() {
		let currentTrack = PlayerStore.getCurrentTrack();
		let nextTrack = PlayerStore.getNextTrack();

		this.setState({
			currentTrack: currentTrack,
			nextTrack: nextTrack,
		});
	}

	render () {
		var currentTrack = this.state.currentTrack;
		var nextTrack = this.state.nextTrack;


		var nextTrackInfo;
		//var albumArtURI = this.props.cursor.refine('albumArtURI');

		if(!currentTrack || !currentTrack.title) {
			return <div id="current-track-info">No Music</div>
		}

		if(nextTrack && nextTrack.title) {
			nextTrackInfo = <p id="next-track">{nextTrack.title}</p>
		}

		return (
			<div id="current-track-info">
				<AlbumArt id="current-track-art" />
				<div>
					<h6>Track</h6>
					<p id="track">{currentTrack.title}</p>
					<h6>Artist</h6>
					<p id="artist">{currentTrack.artist}</p>
					<h6>Album</h6>
					<p id="album">{currentTrack.album}</p>
				</div>

				<h5>Next</h5>
				{nextTrackInfo}
			</div>
		);
	}
}

export default CurrentTrack;
