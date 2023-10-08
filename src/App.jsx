import React, { useCallback, useState, useMemo } from 'react';
import convert from 'xml-js';
import DatePicker, { DateObject } from "react-multi-date-picker"
import './App.css';
import MapComponent from "./map";
import SatellitesComponent from "./satelites";
import forest from './assets/images/chip_077_612_forest_nonforest.png';
import forestW from './assets/images/chip_077_612_forest_nonforest_w.png';
import forestDiff from './assets/images/forest_diff.png';

function App() {
    const [satellite, setSatellite] = useState('')
    const [marker, setMarker] = useState([])
    const [collection, setCollections] = useState([])
    const [images, setImages] = useState([])
    const [dates, setDates] = useState([
        new DateObject().subtract(31, "days"),
        new DateObject().add(0, "days")
    ])

    const takeCollections = useCallback(() => {
        const dataFetch = async () => {
            const requestLink = `https://cmr.earthdata.nasa.gov/search/granules?collection_concept_id=${satellite}&point=${marker}&temporal=${new Date(dates[0]).toISOString()}%2C${new Date(dates[1]).toISOString()}&cloud_cover=0,50&page_size=2000`
            const data = await fetch(new URL(requestLink))
            const dataJson = convert.xml2js(await data.text(), {compact: true, ignoreComment: true});
            setCollections(dataJson.results.references.reference.map(item => ({img: `https://cmr.earthdata.nasa.gov/browse-scaler/browse_images/granules/${item.id._text}?h=85&w=85`, link: item.location._text})));
        };
        dataFetch();
    }, [satellite, marker, dates])

    const takeCollectionData = useCallback((url) => () => {
        const dataFetch = async () => {
            const data = await fetch(url)
            const dataJson = convert.xml2js(await data.text(), {compact: true, ignoreComment: true});
            setImages(dataJson.Granule.OnlineAccessURLs.OnlineAccessURL.map(item => item.URL._text).filter(url => url.startsWith('http')));
        };
        dataFetch();
    }, [])

    //TODO problem with cors, need to use server for this action
    const downloadImages = useCallback(async () => {
        const links = document.getElementsByClassName('links');
        console.log(links)
        for (let item of links) {
            window.open(item.href);
        }
    }, [])

    const buttonEnabled = useMemo(() => satellite && marker.length && dates.length, [satellite, marker, dates])

  return (
    <div className="App">
      <header>
        <div className="app-top">NASA Ephemeris</div>
        <h1>To analyze forest data loss choose satellite, point on the map where you want to analyze forecast loss and choose period of time for analyzing.</h1>
      </header>
        <div className="select">
            <div className="satellites-select">
                <SatellitesComponent setSatellite={setSatellite}/>
            </div>
            <DatePicker
                value={dates}
                onChange={setDates}
                range
            />
        </div>
        <div className="map">
            <MapComponent setMarkerPosition={setMarker}/>
        </div>
        <div className="button-block">
            <button onClick={takeCollections} className="button-3" disabled={!buttonEnabled}>Find Collections</button>
        </div>
        <div>
            {collection.length > 0 && (
                <>
                <h4>Choose collection for analyze</h4>
                    <div className="collection">
                        { collection.map(item =>
                            <div onClick={takeCollectionData(item.link)} className="collection-item">
                                <img src={item.img} alt="" />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
            {images.length > 0 && (
                <>
                    <div className="button-block">
                        <button onClick={downloadImages} className="button-3" >Download images for analyze</button>
                    </div>
                    <div className="links-block">
                        { images.map(item =>
                            <a href={item} download={item} className="links">{item}</a>
                        )}
                    </div>
                </>
            )}
        {images.length > 0 && (
        <div className="results">
            <h4>Difference in forest square calculated by ML model (Example result)</h4>
            <div>
                <h5>Image1</h5>
                <img src={forest} alt=""/>
            </div>
            <div>
                <h5>Image2</h5>
                <img src={forestW} alt=""/>
            </div>
            <div>
                <h5>Difference</h5>
                <img src={forestDiff} alt=""/>
            </div>
            <h3>Forest square reduce is approximately 22.60%.</h3>
        </div>
            )}
    </div>
  );
}

export default App;
