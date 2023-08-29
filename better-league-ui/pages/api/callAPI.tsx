export default async function callAPI(endpoint: string, method: string, headers: any, postData: any = null, json: boolean = true){
    try {
        if(method == "POST" || postData != null){
            const res = await fetch(
                `http://localhost:3080/api/` + endpoint,
                {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                      },
                    body: JSON.stringify(postData)
                }
            );
            if(json){
                const response = await res.json();
                return response;
            }
            const response = await res;
            //console.log(response);
            return response;
        }else{
            const res = await fetch(
                `http://localhost:3080/api/` + endpoint,
                {
                    method: method,
                    headers: headers
                }
            );
            const response = await res.json();
            //console.log(response);
            return response;
        }
    } catch (err) {
        console.log("An error has ocurred while communicating with the backend: " + err);
        return null;
    }
}