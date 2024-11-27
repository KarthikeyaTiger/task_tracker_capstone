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

    try {
        const response = await axios.request(config);
        return response.data;
    } catch(error) {
        console.log(error);
        throw new Error (error);
    }
};  

export default fetchData;