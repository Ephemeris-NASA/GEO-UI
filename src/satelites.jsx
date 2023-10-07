import React, { useState, useCallback, useEffect } from 'react';
import Select from 'react-select'
import convert from 'xml-js';

const SatellitesComponent = ({setSatellite}) => {
    const [satellites, setSatellites] = useState([])
    useEffect(() => {
        const dataFetch = async () => {
            const data = await fetch("https://cmr.earthdata.nasa.gov/search/collections?keyword=Landsat")
            const dataJson = convert.xml2js(await data.text(), {compact: true, ignoreComment: true, spaces: 4})
            setSatellites(dataJson.results.references.reference.map(item => ({value: item.id._text, label: item.name._text})));
        };

        dataFetch();
    }, [setSatellites]);

    const handleChange = useCallback((selectedOption) => {
        setSatellite(selectedOption.value);
    }, [setSatellite]);

    return (
        <>
            {satellites && (
                <Select options={satellites} onChange={handleChange}/>
            )}
        </>
    );
}

export default SatellitesComponent;