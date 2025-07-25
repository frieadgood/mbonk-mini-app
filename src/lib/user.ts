import axios from "axios";

const MIMIR_API_URL = process.env.NEXT_PUBLIC_MIMIR_API_URL;

export const userTelegramLogin = async (privyId: string, referralFrom: string, projectName: string | null) => {
    const result = await axios({
        url: `${MIMIR_API_URL}/telegram/user/login`,
        method: 'POST',
        data: {
            privy_id: privyId,
            referral_from: referralFrom,
            project_name: projectName
        }
    }).then((response) => {
        return {
            status: true,
            data: response.data.Result
        };
    }).catch((error) => {
        console.log('Error logging in', error);
        return {
            status: false,
            data: null
        };
    });
    return result;
}