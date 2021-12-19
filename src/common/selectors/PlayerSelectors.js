export function getPositionInfo(state) {
    const { currentHost, positionInfos } = state.sonosService;
    return positionInfos[currentHost] || {};
}

export function getPlaying(state) {
    const { currentHost, playStates } = state.sonosService;
    const playState = playStates[currentHost];
    const playing = playState && playState === 'playing';
    return playing;
}

export function getCrossfadeMode(state) {
    const { currentHost, crossFadeModes } = state.sonosService;
    return !!crossFadeModes[currentHost];
}

export function getPlayMode(state) {
    const { currentHost, playModes } = state.sonosService;
    return playModes[currentHost];
}

export function isStreaming(state) {
    const { currentHost, currentTracks } = state.sonosService;
    return currentTracks[currentHost] && currentTracks[currentHost].isStreaming;
}

export function disableNextButton(state) {
    const { currentHost, currentTracks } = state.sonosService;
    return (
        currentTracks[currentHost] &&
        currentTracks[currentHost].disableNextButton
    );
}
