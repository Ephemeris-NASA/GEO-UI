import React, { useRef, useState} from 'react';
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
const libraries = ['places', 'drawing'];
const MapComponent = ({ setMarkerPosition }) => {

    const mapRef = useRef();
    const autocompleteRef = useRef();

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyBpPyZfwAdK_9gneXm-THVI2V3Y_4nO3tI',
        libraries
    });

    const [marker, setMarker] = useState({});

    const onMapClick = (e) => {
        setMarker({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
        setMarkerPosition(`${e.latLng.lng()},${e.latLng.lat()}`)
    };

    const defaultCenter = {
        lat: 44.9645575,
        lng: -73.5624471,
    }
    const [center, setCenter] = useState(defaultCenter);

    const containerStyle = {
        width: '100%',
        height: '500px',
    }

    const autocompleteStyle = {
        boxSizing: 'border-box',
        border: '1px solid transparent',
        width: '240px',
        height: '38px',
        padding: '0 12px',
        borderRadius: '3px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
        fontSize: '14px',
        outline: 'none',
        textOverflow: 'ellipses',
        position: 'absolute',
        right: '8%',
        top: '11px',
        marginLeft: '-120px',
    }

    const onLoadMap = (map) => {
        mapRef.current = map;
    }

    const onLoadAutocomplete = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    }

    const onPlaceChanged = () => {
        const { geometry } = autocompleteRef.current.getPlace();
        const bounds = new window.google.maps.LatLngBounds();
        if (geometry.viewport) {
            bounds.union(geometry.viewport);
        } else {
            bounds.extend(geometry.location);
        }
        mapRef.current.fitBounds(bounds);
    }

    return (
        isLoaded
            ?
            <div className='map-container' style={{ position: 'relative' }}>
                <GoogleMap
                    zoom={6}
                    center={center}
                    onLoad={onLoadMap}
                    mapContainerStyle={containerStyle}
                    onTilesLoaded={() => setCenter(null)}
                    onClick={onMapClick}
                >
                    <Marker position={{lat: marker.lat, lng: marker.lng}} />
                    <Autocomplete
                        onLoad={onLoadAutocomplete}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <input
                            type='text'
                            placeholder='Search Location'
                            style={autocompleteStyle}
                        />
                    </Autocomplete>
                </GoogleMap>
            </div>
            :
            null
    );
}

export default MapComponent;
