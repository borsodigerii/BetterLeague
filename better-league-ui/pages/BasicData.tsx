import { useEffect, useState } from "react";
import callAPI from "./api/callAPI";
import DisplayBasicData from "./DisplayBasicData";

export default function BasicData() {
    const [name, setName] = useState("");
    const [level, setLevel] = useState(0);
    const [data, updateData] = useState();
    useEffect(() => {
        const getData = async () => {
            console.log("in");
            let response = await callAPI("user-info", "GET", {});
            console.log(response);
            
        };
        getData();
    }, []);
    
    return data && <DisplayBasicData data={data}/>;
}