import axios from "axios";

const MIMIR_API_URL = process.env.NEXT_PUBLIC_MIMIR_API_URL;

export const getRankList = async (type: string) => {

    const rankList = await axios({
        url: `${MIMIR_API_URL}/telegram/rank/list`,
        method: 'GET',
        headers: {
            accept: 'application/json'
        },
        params: {
            type: type,
            project_name: process.env.NEXT_PUBLIC_PROJECT_NAME
        }
    }).then((response) => {
        const result = response.data.Result;
        return {
            data: result,
            error: null
        };
    }).catch((error) => {
        console.log('Error fetching rank list', error);
        return {
            data: null,
            error: error.response.data
        };
    });

    return rankList;
}