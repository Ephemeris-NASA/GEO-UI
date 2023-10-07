import React, { useCallback, useState, useMemo } from 'react';
import convert from 'xml-js';
import DatePicker, { DateObject } from "react-multi-date-picker"
import './App.css';
import MapComponent from "./map";
import SatellitesComponent from "./satelites";

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
        let link = document.createElement("a");
        document.documentElement.append(link);

        for (let i = 0; i < images.length; i++) {
            await fetch(images[i])
                .then(res => res.blob())
                .then(blob => {

                    let objectURL = URL.createObjectURL(blob);

                    // Set the download name and href
                    link.setAttribute("download", `image_${i}.tiff`);
                    link.href = objectURL;

                    // Auto click the link
                    link.click();
                })
        }
    }, [images])

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
                <div className="button-block">
                    <button onClick={downloadImages} className="button-3" >Download images</button>
                </div>
            )}
    </div>
  );
}

export default App;
