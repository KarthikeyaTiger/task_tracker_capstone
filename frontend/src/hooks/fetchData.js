import axios from 'axios';
const fetchData = async ( url, token ) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: url,
        headers: {
            "Authorization": `Bearer ${token}`
        }
    };

    return await axios.request(config);
};  

export default fetchData;