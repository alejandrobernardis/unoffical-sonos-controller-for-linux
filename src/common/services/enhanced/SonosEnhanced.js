import _ from 'lodash';
import { Sonos, Helpers } from 'sonos';

import ContentDirectoryEnhanced from './ContentDirectoryEnhanced';

const TUNEIN_ID = 65031;

export default class SonosEnhanced extends Sonos {
    async initialise() {
        this._zpInfo = await this.getZPInfo();
        this._deviceDescription = await this.deviceDescription();
    }

    get UUID() {
        return this._zpInfo.LocalUID;
    }

    get householdId() {
        return this._zpInfo.HouseholdControlID;
    }

    get deviceId() {
        return this._zpInfo.SerialNumber;
    }

    get icon() {
        return this._zpInfo.ZoneIcon;
    }

    get name() {
        return this._zpInfo.ZoneName;
    }

    get model() {
        return this._deviceDescription.modelNumber;
    }

    contentDirectoryService() {
        return new ContentDirectoryEnhanced(this.host, this.port);
    }

    async getAvailableServices() {
        const data = await this.musicServices().ListAvailableServices();

        const servicesObj = await Helpers.ParseXml(
            data.AvailableServiceDescriptorList
        );

        const serviceDescriptors = servicesObj.Services.Service.map((obj) => {
            const stringsUri = _.get(obj, 'Presentation.Strings.Uri');
            const mapUri = _.get(obj, 'Presentation.PresentationMap.Uri');
            const manifestUri = _.get(obj, 'Manifest.Uri');

            return _.assign({}, obj, obj.Policy, {
                manifestUri,
                presentation: {
                    stringsUri,
                    mapUri,
                },
            });
        });

        const services = [];

        [TUNEIN_ID, ...data.AvailableServiceTypeList.split(',')].forEach(
            async (t) => {
                const serviceId =
                    Math.floor(Math.abs((t - 7) / 256)) || Number(t);
                const match = _.find(serviceDescriptors, {
                    Id: String(serviceId),
                });

                if (match) {
                    match.ServiceIDEncoded = Number(t);
                    services.push(match);
                }
            }
        );

        return services;
    }

    async queryMusicLibrary(
        searchType,
        searchTerm,
        requestOptions = {},
        separator = ':'
    ) {
        const searchTypes = {
            artists: 'A:ARTIST',
            albumArtists: 'A:ALBUMARTIST',
            albums: 'A:ALBUM',
            genres: 'A:GENRE',
            composers: 'A:COMPOSER',
            tracks: 'A:TRACKS',
            playlists: 'A:PLAYLISTS',
            sonos_playlists: 'SQ',
            share: 'S',
        };

        const defaultOptions = {
            BrowseFlag: 'BrowseDirectChildren',
            Filter: '*',
            StartingIndex: '0',
            RequestedCount: '100',
            SortCriteria: '',
        };

        let searches = searchTypes[searchType]
            ? `${searchTypes[searchType]}${separator}`
            : searchType;

        if (searchTerm && searchTerm !== '') {
            searches = `${searches}${separator}${encodeURIComponent(
                searchTerm
            )}`;
        }

        let opts = {
            ObjectID: searches,
        };
        if (requestOptions && requestOptions.start !== undefined) {
            opts.StartingIndex = requestOptions.start;
        }
        if (requestOptions && requestOptions.total !== undefined) {
            opts.RequestedCount = requestOptions.total;
        }
        // opts = _.extend(defaultOptions, opts)
        opts = Object.assign({}, defaultOptions, opts);
        const result = await this.contentDirectoryService().GetResult(opts);
        return result;
    }
}
